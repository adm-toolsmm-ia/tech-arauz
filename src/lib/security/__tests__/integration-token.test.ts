import {
  decryptIntegrationToken,
  encryptIntegrationToken,
  hasIntegrationTokenSecret,
  isEncryptedIntegrationToken,
} from '@/lib/security/integration-token';

describe('integration-token crypto', () => {
  const originalSecret = process.env.INTEGRATION_TOKEN_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.INTEGRATION_TOKEN_SECRET;
    } else {
      process.env.INTEGRATION_TOKEN_SECRET = originalSecret;
    }
  });

  it('encrypts and decrypts token with configured secret', () => {
    process.env.INTEGRATION_TOKEN_SECRET = 'test-secret-123';
    const encrypted = encryptIntegrationToken('my-token');

    expect(isEncryptedIntegrationToken(encrypted)).toBe(true);
    expect(decryptIntegrationToken(encrypted)).toBe('my-token');
  });

  it('throws when trying to encrypt without configured secret', () => {
    delete process.env.INTEGRATION_TOKEN_SECRET;
    expect(() => encryptIntegrationToken('plain')).toThrow(
      'INTEGRATION_TOKEN_SECRET is required to encrypt integration tokens',
    );
  });

  it('returns plaintext as-is when token is not encrypted', () => {
    process.env.INTEGRATION_TOKEN_SECRET = 'test-secret-123';
    expect(decryptIntegrationToken('plain-token')).toBe('plain-token');
  });

  it('reports secret availability correctly', () => {
    delete process.env.INTEGRATION_TOKEN_SECRET;
    expect(hasIntegrationTokenSecret()).toBe(false);
    process.env.INTEGRATION_TOKEN_SECRET = 'secret';
    expect(hasIntegrationTokenSecret()).toBe(true);
  });
});
