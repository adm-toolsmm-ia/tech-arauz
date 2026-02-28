import { encryptIntegrationToken } from '@/lib/security/integration-token';
import { resolveApiToken } from '@/lib/sync/espaider-sync';

describe('resolveApiToken', () => {
  const originalSecret = process.env.INTEGRATION_TOKEN_SECRET;
  const originalEspaiderToken = process.env.ESPAIDER_TOKEN;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.INTEGRATION_TOKEN_SECRET;
    } else {
      process.env.INTEGRATION_TOKEN_SECRET = originalSecret;
    }

    if (originalEspaiderToken === undefined) {
      delete process.env.ESPAIDER_TOKEN;
    } else {
      process.env.ESPAIDER_TOKEN = originalEspaiderToken;
    }
  });

  it('uses env token when value is placeholder', () => {
    process.env.ESPAIDER_TOKEN = 'env-token';
    expect(resolveApiToken('PREENCHER_TOKEN')).toBe('env-token');
  });

  it('keeps plaintext token for backward compatibility', () => {
    expect(resolveApiToken('legacy-plain-token')).toBe('legacy-plain-token');
  });

  it('decrypts encrypted token when secret is present', () => {
    process.env.INTEGRATION_TOKEN_SECRET = 'secret-123';
    const encrypted = encryptIntegrationToken('secure-token');
    expect(resolveApiToken(encrypted)).toBe('secure-token');
  });
});
