import assert from 'node:assert/strict';
import { createIngestionServer } from '../../server/http.mjs';

const server = createIngestionServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const response = await fetch(`${url}/api/v1/astrology/eligibility`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ schemaVersion: 'birth-profile-input.v1', calendar: 'solar', date: '1990-10-10', time: '14:30', unknownTime: false }),
});
assert.notEqual(response.status, 404, 'the astrology eligibility contract route must be registered');
server.close();
console.log('astrology comparison route red test passed');
