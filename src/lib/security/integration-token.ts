import crypto from 'crypto';

const TOKEN_PREFIX = 'enc:v1:';

function getEncryptionKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

function getSecret(): string | null {
  const secret = process.env.INTEGRATION_TOKEN_SECRET?.trim();
  return secret ? secret : null;
}

export function hasIntegrationTokenSecret(): boolean {
  return !!getSecret();
}

export function isEncryptedIntegrationToken(token: string | null | undefined): boolean {
  return typeof token === 'string' && token.startsWith(TOKEN_PREFIX);
}

export function encryptIntegrationToken(token: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error('INTEGRATION_TOKEN_SECRET is required to encrypt integration tokens');
  }

  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey(secret);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${TOKEN_PREFIX}${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptIntegrationToken(token: string): string {
  if (!isEncryptedIntegrationToken(token)) {
    return token;
  }

  const secret = getSecret();
  if (!secret) {
    throw new Error('INTEGRATION_TOKEN_SECRET is required to decrypt integration tokens');
  }

  const payload = token.slice(TOKEN_PREFIX.length);
  const [ivB64, tagB64, encryptedB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !encryptedB64) {
    throw new Error('Invalid encrypted integration token format');
  }

  const iv = Buffer.from(ivB64, 'base64url');
  const authTag = Buffer.from(tagB64, 'base64url');
  const encrypted = Buffer.from(encryptedB64, 'base64url');
  const key = getEncryptionKey(secret);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
