export const environment = {
  production: true,
  apiUrl: 'https://api.huetransfers.net',
  apiPrefix: '/api/v1',
  apiBaseUrl: 'https://api.huetransfers.net/api/v1',
  swaggerUrl: 'https://api.huetransfers.net/docs',
  apiTimeout: 30000,
  tokenRefreshThreshold: 300000, // 5 minutes before expiry
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  enableDebugMode: false,
};
