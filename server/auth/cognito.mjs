import crypto from 'node:crypto';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const OAUTH_COOKIE = '__Host-saju_oauth';
const SESSION_COOKIE = '__Host-saju_session';
const COOKIE_ATTRIBUTES = 'Path=/; HttpOnly; Secure; SameSite=Lax';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseCookies(value = '') {
  return Object.fromEntries(String(value).split(';').map((part) => {
    const separator = part.indexOf('=');
    return separator < 0 ? ['', ''] : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }).filter(([name]) => name));
}

function json(response, status, payload, headers = {}) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  response.end(JSON.stringify(payload));
}

function redirect(response, location, cookies = []) {
  response.writeHead(302, { location, 'cache-control': 'no-store', ...(cookies.length ? { 'set-cookie': cookies } : {}) });
  response.end();
}

function createSealer(secret) {
  const key = crypto.createHash('sha256').update(String(secret)).digest();
  return {
    seal(payload) {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
      return base64url(Buffer.concat([iv, cipher.getAuthTag(), ciphertext]));
    },
    unseal(value) {
      try {
        const envelope = Buffer.from(value, 'base64url');
        if (envelope.length < 29) return null;
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, envelope.subarray(0, 12));
        decipher.setAuthTag(envelope.subarray(12, 28));
        return JSON.parse(Buffer.concat([decipher.update(envelope.subarray(28)), decipher.final()]).toString('utf8'));
      } catch { return null; }
    },
  };
}

function sessionHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function constantTimeEqual(left, right) {
  const leftHash = crypto.createHash('sha256').update(String(left)).digest();
  const rightHash = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

export function createCognitoAuth({
  storage,
  identityAdmin,
  clientId,
  cognitoDomain,
  publicBaseUrl,
  sessionSecret,
  verifier = null,
  userPoolId = null,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
}) {
  if (!storage?.upsertAccount || !storage?.createSession || !storage?.getSession || !storage?.deleteSession || !storage?.deleteAccount || !storage?.completeAccountDeletion) throw new TypeError('account lifecycle storage is required');
  if (!identityAdmin?.deleteUser) throw new TypeError('Cognito account deletion admin is required');
  if (!clientId || !cognitoDomain || !publicBaseUrl || !sessionSecret) throw new TypeError('complete Cognito configuration is required');
  const tokenVerifier = verifier || CognitoJwtVerifier.create({ userPoolId, tokenUse: 'id', clientId });
  const sealer = createSealer(sessionSecret);
  const configuredBaseUrl = () => typeof publicBaseUrl === 'function' ? publicBaseUrl() : publicBaseUrl;
  const callbackUrl = () => new URL('/auth/callback', configuredBaseUrl()).toString();
  const domain = cognitoDomain.replace(/\/$/, '');
  const clearOauthCookie = () => `${OAUTH_COOKIE}=; Max-Age=0; ${COOKIE_ATTRIBUTES}`;

  function verifyMutation(request) {
    const expectedOrigin = new URL(configuredBaseUrl()).origin;
    return request?.headers?.origin === expectedOrigin;
  }

  async function authenticate(request) {
    const token = parseCookies(request?.headers?.cookie)[SESSION_COOKIE];
    if (!token) return null;
    const session = await storage.getSession(sessionHash(token));
    if (!session || session.status !== 'active' || Date.parse(session.expiresAt) <= now().getTime()) return null;
    return session;
  }

  async function handle(request, response) {
    const url = new URL(request.url || '/', configuredBaseUrl());
    if (request.method === 'GET' && url.pathname === '/auth/login') {
      const state = base64url(crypto.randomBytes(24));
      const nonce = base64url(crypto.randomBytes(24));
      const verifierValue = base64url(crypto.randomBytes(48));
      const challenge = base64url(crypto.createHash('sha256').update(verifierValue).digest());
      const oauthState = sealer.seal({ state, nonce, verifier: verifierValue, expiresAt: now().getTime() + 10 * 60_000 });
      const authorize = new URL(`${domain}/oauth2/authorize`);
      authorize.search = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        scope: 'openid email',
        redirect_uri: callbackUrl(),
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString();
      redirect(response, authorize.toString(), [`${OAUTH_COOKIE}=${oauthState}; Max-Age=600; ${COOKIE_ATTRIBUTES}`]);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/auth/callback') {
      const oauthState = sealer.unseal(parseCookies(request.headers.cookie)[OAUTH_COOKIE]);
      if (!oauthState || oauthState.expiresAt <= now().getTime() || !url.searchParams.get('code') || !constantTimeEqual(oauthState.state, url.searchParams.get('state'))) {
        json(response, 400, { error: 'oauth_callback_invalid' }, { 'set-cookie': clearOauthCookie() });
        return true;
      }
      let tokenResponse;
      try {
        tokenResponse = await fetchImpl(`${domain}/oauth2/token`, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            code: url.searchParams.get('code'),
            redirect_uri: callbackUrl(),
            code_verifier: oauthState.verifier,
          }),
        });
      } catch {
        json(response, 502, { error: 'identity_provider_unavailable' }, { 'set-cookie': clearOauthCookie() });
        return true;
      }
      if (!tokenResponse.ok) {
        json(response, 502, { error: 'identity_provider_unavailable' }, { 'set-cookie': clearOauthCookie() });
        return true;
      }
      let tokens;
      let identity;
      try {
        tokens = await tokenResponse.json();
        identity = await tokenVerifier.verify(tokens.id_token);
      } catch {
        json(response, 403, { error: 'identity_token_invalid' }, { 'set-cookie': clearOauthCookie() });
        return true;
      }
      if (!identity?.sub || !identity?.email || identity.email_verified !== true || !constantTimeEqual(identity.nonce, oauthState.nonce)) {
        json(response, 403, { error: 'verified_email_required' }, { 'set-cookie': clearOauthCookie() });
        return true;
      }
      let sessionToken;
      let maxAge;
      try {
        const account = await storage.upsertAccount({ provider: 'cognito', providerSubject: identity.sub, email: identity.email });
        sessionToken = base64url(crypto.randomBytes(32));
        maxAge = Math.max(60, Math.min(Number(tokens.expires_in) || 3600, 3600));
        const previousSessionToken = parseCookies(request.headers.cookie)[SESSION_COOKIE];
        if (previousSessionToken) await storage.deleteSession(sessionHash(previousSessionToken));
        await storage.createSession({
          tokenHash: sessionHash(sessionToken),
          userId: account.userId,
          expiresAt: new Date(now().getTime() + maxAge * 1000).toISOString(),
        });
      } catch {
        json(response, 503, { error: 'account_session_unavailable' }, { 'set-cookie': clearOauthCookie() });
        return true;
      }
      redirect(response, '/', [
        clearOauthCookie(),
        `${SESSION_COOKIE}=${sessionToken}; Max-Age=${maxAge}; ${COOKIE_ATTRIBUTES}`,
      ]);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/v1/me') {
      const principal = await authenticate(request);
      json(response, 200, principal ? { authenticated: true, account: { userId: principal.userId, email: principal.email } } : { authenticated: false });
      return true;
    }

    if (request.method === 'DELETE' && url.pathname === '/v1/account') {
      if (!verifyMutation(request)) {
        json(response, 403, { error: 'origin_rejected' });
        return true;
      }
      const principal = await authenticate(request);
      if (!principal) {
        json(response, 401, { error: 'authentication_required' });
        return true;
      }
      let deletion;
      try {
        deletion = await storage.deleteAccount(principal.userId);
      } catch {
        json(response, 503, { error: 'account_deletion_failed' });
        return true;
      }
      try {
        await identityAdmin.deleteUser(deletion.providerSubject);
        await storage.completeAccountDeletion(deletion.deletionRequestId, principal.userId, true);
        response.writeHead(204, { 'cache-control': 'no-store', 'set-cookie': `${SESSION_COOKIE}=; Max-Age=0; ${COOKIE_ATTRIBUTES}` });
        response.end();
      } catch (error) {
        await storage.completeAccountDeletion(deletion.deletionRequestId, principal.userId, false, error?.name || 'identity_delete_failed');
        json(response, 202, { status: 'deletion_pending', message: '저장 데이터는 삭제되었고 인증 계정 삭제를 마무리하고 있습니다.' }, { 'set-cookie': `${SESSION_COOKIE}=; Max-Age=0; ${COOKIE_ATTRIBUTES}` });
      }
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/auth/logout') {
      if (!verifyMutation(request)) {
        json(response, 403, { error: 'origin_rejected' });
        return true;
      }
      const token = parseCookies(request.headers.cookie)[SESSION_COOKIE];
      if (token) await storage.deleteSession(sessionHash(token));
      response.writeHead(204, { 'cache-control': 'no-store', 'set-cookie': `${SESSION_COOKIE}=; Max-Age=0; ${COOKIE_ATTRIBUTES}` });
      response.end();
      return true;
    }
    return false;
  }

  return { required: true, authenticate, handle, verifyMutation };
}
