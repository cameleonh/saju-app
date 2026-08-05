import crypto from 'node:crypto';
import { DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';

const ENCRYPTION_CONTEXT = Object.freeze({ service: 'saju-app', purpose: 'birth-vault', version: 'v1' });
const ENVELOPE_VERSION = 'kms-envelope.v1';
const ALGORITHM = 'aes-256-gcm';

function encodeEnvelope(value) {
  return Buffer.from(JSON.stringify(value), 'utf8');
}

function decodeEnvelope(value) {
  let envelope;
  try { envelope = JSON.parse(Buffer.from(value).toString('utf8')); }
  catch { throw new TypeError('invalid KMS envelope'); }
  if (envelope?.schemaVersion !== ENVELOPE_VERSION || envelope?.algorithm !== ALGORITHM) throw new TypeError('invalid KMS envelope');
  for (const field of ['encryptedDataKey', 'iv', 'authTag', 'ciphertext']) {
    if (typeof envelope[field] !== 'string' || envelope[field].length === 0) throw new TypeError('invalid KMS envelope');
  }
  return envelope;
}

export function createKmsVault({ kmsClient, keyId }) {
  if (!kmsClient?.send) throw new TypeError('kmsClient.send is required');
  if (!keyId) throw new TypeError('keyId is required');
  return {
    async encryptJson(value) {
      const generated = await kmsClient.send(new GenerateDataKeyCommand({
        KeyId: keyId,
        KeySpec: 'AES_256',
        EncryptionContext: ENCRYPTION_CONTEXT,
      }));
      if (!generated?.Plaintext || !generated?.CiphertextBlob) throw new Error('KMS did not return a complete data key');
      const plaintextKey = Buffer.from(generated.Plaintext);
      try {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGORITHM, plaintextKey, iv);
        const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const envelope = encodeEnvelope({
          schemaVersion: ENVELOPE_VERSION,
          algorithm: ALGORITHM,
          encryptedDataKey: Buffer.from(generated.CiphertextBlob).toString('base64'),
          iv: iv.toString('base64'),
          authTag: cipher.getAuthTag().toString('base64'),
          ciphertext: ciphertext.toString('base64'),
        });
        return {
          ciphertext: envelope,
          keyId: generated.KeyId || keyId,
          integrityHash: crypto.createHash('sha256').update(envelope).digest('hex'),
        };
      } finally {
        plaintextKey.fill(0);
      }
    },

    async decryptJson(value) {
      const envelope = decodeEnvelope(value);
      const decrypted = await kmsClient.send(new DecryptCommand({
        CiphertextBlob: Buffer.from(envelope.encryptedDataKey, 'base64'),
        EncryptionContext: ENCRYPTION_CONTEXT,
        KeyId: keyId,
      }));
      if (!decrypted?.Plaintext) throw new Error('KMS did not return a plaintext data key');
      const plaintextKey = Buffer.from(decrypted.Plaintext);
      try {
        const decipher = crypto.createDecipheriv(ALGORITHM, plaintextKey, Buffer.from(envelope.iv, 'base64'));
        decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
        const plaintext = Buffer.concat([
          decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
          decipher.final(),
        ]);
        return JSON.parse(plaintext.toString('utf8'));
      } catch (error) {
        throw new Error('KMS envelope authentication failed', { cause: error });
      } finally {
        plaintextKey.fill(0);
      }
    },
  };
}
