export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  apiPrefix: '/api/v1',
  apiBaseUrl: 'http://localhost:3000/api/v1',
  swaggerUrl: 'http://localhost:3000/docs',
  apiTimeout: 30000,
  tokenRefreshThreshold: 300000, // 5 minutes before expiry
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  enableDebugMode: true,
};
