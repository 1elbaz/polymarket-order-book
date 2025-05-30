// File: src/lib/api/endpoints.ts

/**
 * API endpoint configuration
 */
export const ENDPOINTS = {
    // Market endpoints
    MARKETS: '/markets',
    MARKET_DETAIL: (marketId: string) => `/markets/${marketId}`,
    MARKET_SEARCH: '/markets/search',
    
    // Order book endpoints
    ORDER_BOOK: (marketId: string) => `/book/${marketId}`,
    ORDER_BOOK_DEPTH: (marketId: string, depth: number) => `/book/${marketId}?depth=${depth}`,
    
    // Trade endpoints
    TRADES: (marketId: string) => `/trades/${marketId}`,
    TRADE_HISTORY: (marketId: string) => `/trades/${marketId}/history`,
    
    // Market statistics
    MARKET_STATS: (marketId: string) => `/markets/${marketId}/stats`,
    MARKET_CANDLES: (marketId: string) => `/markets/${marketId}/candles`,
    
    // System endpoints
    PING: '/ping',
    STATUS: '/status',
  } as const;
  
  /**
   * WebSocket endpoint configuration
   */
  export const WS_ENDPOINTS = {
    BASE_URL: 'wss://ws-subscriptions-clob.polymarket.com',
    ORDER_BOOK: (marketId: string) => `/book/${marketId}`,
    TRADES: (marketId: string) => `/trades/${marketId}`,
    ALL_MARKETS: '/markets',
  } as const;
  
  /**
   * API version configuration
   */
  export const API_CONFIG = {
    VERSION: 'v1',
    BASE_URL: 'https://clob.polymarket.com',
    WS_BASE_URL: WS_ENDPOINTS.BASE_URL,
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  } as const;
  
  /**
   * Build full URL for an endpoint
   */
  export function buildUrl(endpoint: string, baseUrl: string = API_CONFIG.BASE_URL): string {
    return `${baseUrl}${endpoint}`;
  }
  
  /**
   * Build WebSocket URL
   */
  export function buildWsUrl(endpoint: string): string {
    return `${WS_ENDPOINTS.BASE_URL}${endpoint}`;
  }