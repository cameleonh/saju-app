import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createKmsVault } from '../../server/crypto/kms-vault.mjs';

const dataKey = Buffer.alloc(32, 7);
const encryptedDataKey = Buffer.from('encrypted-data-key');
const commands = [];
const kmsClient = {
  async send(command) {
    commands.push(command);
    if (command.constructor.name === 'GenerateDataKeyCommand') {
      return { Plaintext: dataKey, CiphertextBlob: encryptedDataKey, KeyId: 'test-key-id' };
    }
    if (command.constructor.name === 'DecryptCommand') return { Plaintext: dataKey, KeyId: 'test-key-id' };
    throw new Error(`unexpected command ${command.constructor.name}`);
  },
};
const vault = createKmsVault({ kmsClient, keyId: 'alias/saju-vault' });
const birth = { date: '1990-10-10', time: '14:30', place: '서울특별시', unknownTime: false };
const encrypted = await vault.encryptJson(birth);

assert.equal(Buffer.isBuffer(encrypted.ciphertext), true);
assert.equal(encrypted.keyId, 'test-key-id');
assert.match(encrypted.integrityHash, /^[a-f0-9]{64}$/);
assert.doesNotMatch(encrypted.ciphertext.toString('utf8'), /1990-10-10|14:30|서울/);
assert.deepEqual(await vault.decryptJson(encrypted.ciphertext), birth);
assert.deepEqual(commands[0].input.EncryptionContext, { service: 'saju-app', purpose: 'birth-vault', version: 'v1' });
assert.equal(JSON.stringify(commands[0].input.EncryptionContext).includes('1990'), false);

const tampered = Buffer.from(encrypted.ciphertext);
tampered[tampered.length - 1] ^= 1;
await assert.rejects(() => vault.decryptJson(tampered), /invalid|authenticate|envelope/i);

const assertionCount = (fs.readFileSync(new URL(import.meta.url), 'utf8').match(/\bassert\./g) || []).length;
console.log(`kms vault unit: ${assertionCount} assertions passed`);
