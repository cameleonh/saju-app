import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createServer } from 'node:http';
import { createCognitoAuth } from '../../server/auth/cognito.mjs';

const calls = [];
const sessions = new Map();
let expectedNonce;
const storage = {
  async upsertAccount(identity) {
    calls.push(['upsertAccount', identity]);
    return { userId: '11111111-1111-4111-8111-111111111111', status: 'active', email: identity.email };
  },
  async createSession(session) {
    calls.push(['createSession', session]);
    sessions.set(session.tokenHash, { userId: session.userId, status: 'active', email: 'adult@example.test', expiresAt: session.expiresAt });
  },
  async getSession(tokenHash) { return sessions.get(tokenHash) || null; },
  async deleteSession(tokenHash) { calls.push(['deleteSession', tokenHash]); return sessions.delete(tokenHash); },
  async deleteAccount(userId) {
    calls.push(['deleteAccount', userId]);
    sessions.clear();
    return { deletionRequestId: '22222222-2222-4222-8222-222222222222', providerSubject: 'cognito-subject' };
  },
  async completeAccountDeletion(deletionRequestId, userId, succeeded, failureCode = null) {
    calls.push(['completeAccountDeletion', deletionRequestId, userId, succeeded, failureCode]);
  },
};
let identityFailure = false;
const identityAdmin = {
  async deleteUser(providerSubject) {
    calls.push(['deleteIdentity', providerSubject]);
    if (identityFailure) throw Object.assign(new Error('synthetic failure'), { name: 'ServiceUnavailableException' });
  },
};
const verifier = {
  async verify(token) {
    assert.equal(token, 'id-token');
    return { sub: 'cognito-subject', email: 'adult@example.test', email_verified: true, nonce: expectedNonce };
  },
};
const tokenFetch = async (url, init) => {
  calls.push(['tokenFetch', url, init]);
  return new Response(JSON.stringify({ id_token: 'id-token', access_token: 'access-token', expires_in: 3600 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
let baseUrl;
const auth = createCognitoAuth({
  storage,
  verifier,
  fetchImpl: tokenFetch,
  clientId: 'client-id',
  cognitoDomain: 'https://auth.example.test',
  publicBaseUrl: () => baseUrl,
  sessionSecret: 'test-session-secret-with-at-least-thirty-two-bytes',
  identityAdmin,
  now: () => new Date('2026-08-05T00:00:00Z'),
});
const server = createServer(async (request, response) => {
  if (await auth.handle(request, response)) return;
  response.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
baseUrl = `http://127.0.0.1:${server.address().port}`;

const login = await fetch(`${baseUrl}/auth/login`, { redirect: 'manual' });
assert.equal(login.status, 302);
const authorize = new URL(login.headers.get('location'));
assert.equal(authorize.origin, 'https://auth.example.test');
assert.equal(authorize.pathname, '/oauth2/authorize');
assert.equal(authorize.searchParams.get('response_type'), 'code');
assert.equal(authorize.searchParams.get('code_challenge_method'), 'S256');
assert.ok(authorize.searchParams.get('code_challenge'));
expectedNonce = authorize.searchParams.get('nonce');
assert.ok(expectedNonce, 'the authorization request binds an OIDC nonce');
const state = authorize.searchParams.get('state');
const oauthCookie = login.headers.get('set-cookie').split(';')[0];
assert.match(login.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);

const invalidCallback = await fetch(`${baseUrl}/auth/callback?code=authorization-code&state=x`, {
  headers: { cookie: oauthCookie },
  redirect: 'manual',
});
assert.equal(invalidCallback.status, 400, 'a malformed OAuth state is rejected without crashing the server');

const callback = await fetch(`${baseUrl}/auth/callback?code=authorization-code&state=${encodeURIComponent(state)}`, {
  headers: { cookie: oauthCookie },
  redirect: 'manual',
});
assert.equal(callback.status, 302);
assert.equal(callback.headers.get('location'), '/');
assert.match(callback.headers.get('set-cookie'), /__Host-saju_session=.*HttpOnly; Secure; SameSite=Lax/);
const sessionSetCookie = callback.headers.getSetCookie().find((value) => value.startsWith('__Host-saju_session='));
const sessionCookie = sessionSetCookie.split(';')[0];
assert.equal(calls.filter(([name]) => name === 'upsertAccount').length, 1);
assert.equal(calls.filter(([name]) => name === 'createSession').length, 1);

const authenticated = await auth.authenticate({ headers: { cookie: sessionCookie } });
assert.equal(authenticated.userId, '11111111-1111-4111-8111-111111111111');
assert.equal(authenticated.email, 'adult@example.test');

const wrongOriginDelete = await fetch(`${baseUrl}/v1/account`, {
  method: 'DELETE',
  headers: { cookie: sessionCookie, origin: 'https://attacker.test' },
  redirect: 'manual',
});
assert.equal(wrongOriginDelete.status, 403);

const accountDelete = await fetch(`${baseUrl}/v1/account`, {
  method: 'DELETE',
  headers: { cookie: sessionCookie, origin: baseUrl },
  redirect: 'manual',
});
assert.equal(accountDelete.status, 204);
assert.equal(calls.filter(([name]) => name === 'deleteAccount').length, 1);
assert.equal(calls.filter(([name]) => name === 'deleteIdentity').length, 1);
assert.equal(calls.filter(([name]) => name === 'completeAccountDeletion').length, 1);

const pendingToken = 'pending-session-token';
sessions.set(crypto.createHash('sha256').update(pendingToken).digest('hex'), { userId: '11111111-1111-4111-8111-111111111111', status: 'active', expiresAt: '2026-08-05T01:00:00Z' });
identityFailure = true;
const pendingDelete = await fetch(`${baseUrl}/v1/account`, {
  method: 'DELETE',
  headers: { cookie: `__Host-saju_session=${pendingToken}`, origin: baseUrl },
  redirect: 'manual',
});
assert.equal(pendingDelete.status, 202, 'active data deletion remains successful when Cognito deletion needs an operator retry');
assert.equal(calls.filter(([name, , , succeeded]) => name === 'completeAccountDeletion' && succeeded === false).length, 1);

await storage.createSession({ tokenHash: 'replacement', userId: '11111111-1111-4111-8111-111111111111', expiresAt: '2026-08-05T01:00:00Z' });

const logout = await fetch(`${baseUrl}/auth/logout`, {
  method: 'POST',
  headers: { cookie: '__Host-saju_session=replacement', origin: baseUrl },
  redirect: 'manual',
});
assert.equal(logout.status, 204);
assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
assert.equal(await auth.authenticate({ headers: { cookie: sessionCookie } }), null);

server.close();
const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`cognito auth: ${assertionCount} assertions passed`);
