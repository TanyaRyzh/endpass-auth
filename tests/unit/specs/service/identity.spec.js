import MockAdapter from 'axios-mock-adapter';
import {
  successResponse,
  errorResponse,
  getRecoveryIdentifierResponse,
} from '@unitFixtures/services/identity';
import http from '@/class/singleton/request/http';

const identityService = require.requireActual('@/service/identity').default;

jest.mock('@/store', () => ({
  dispatch: jest.fn(), // mock store for http module
}));

describe('identity service', () => {
  const axiosMock = new MockAdapter(http);
  const identityBaseUrl = ENV.VUE_APP_IDENTITY_API_URL;

  afterEach(() => {
    axiosMock.reset();
  });

  describe('getRecoveryIdentifier', () => {
    const email = 'email+test@email.com';
    const url = `${identityBaseUrl}/auth/recover?email=${encodeURIComponent(
      email,
    )}`;

    it('should make correct request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(config => {
        expect(config.url).toBe(url);

        return [200, getRecoveryIdentifierResponse];
      });

      await identityService.getRecoveryIdentifier(email);
    });

    it('should handle successfull GET /auth/recover request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, getRecoveryIdentifierResponse);

      const received = await identityService.getRecoveryIdentifier(email);

      expect(received).toEqual(getRecoveryIdentifierResponse.message);
    });

    it('should handle successfull GET /auth/recover request with error message', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, errorResponse);

      await expect(
        identityService.getRecoveryIdentifier(email),
      ).rejects.toThrow(expect.any(Error));
    });

    it('should handle rejected GET /auth/recover request', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(500);

      await expect(
        identityService.getRecoveryIdentifier(email),
      ).rejects.toThrow(expect.any(Error));
    });
  });

  describe('recover', () => {
    const email = 'email+test@email.com';
    const signature = 'signature';
    const redirectUrl = 'https://localhost:8080';
    const url = `${identityBaseUrl}/auth/recover`;

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onPost(url).reply(config => {
        expect(config.url).toBe(url);
        expect(config.data).toBe(
          JSON.stringify({ email, signature, redirectUrl }),
        );

        return [200, getRecoveryIdentifierResponse];
      });

      await identityService.disableOtp(email, signature, redirectUrl);
    });

    it('should handle successfull POST /auth/recover request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(200, successResponse);

      const received = await identityService.disableOtp(
        email,
        signature,
        redirectUrl,
      );

      expect(received).toEqual(successResponse);
    });

    it('should handle successfull POST /auth/recover request with error message', async () => {
      expect.assertions(1);

      axiosMock.onGet(url).reply(200, errorResponse);

      await expect(
        identityService.disableOtp(email, signature, redirectUrl),
      ).rejects.toThrow(expect.any(Error));
    });

    it('should handle rejected POST /auth/recover request', async () => {
      expect.assertions(1);

      axiosMock.onPost(url).reply(500);

      await expect(
        identityService.disableOtp(email, signature, redirectUrl),
      ).rejects.toThrow(expect.any(Error));
    });
  });
});
