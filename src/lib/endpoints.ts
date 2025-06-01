// File: src/lib/endpoints.ts - CORRECTED based on actual Polymarket API docs

/**
 * API endpoint configuration - UPDATED to match actual Polymarket API
 */
export const ENDPOINTS = {
    // Authentication endpoints
    CREATE_API_KEY: '/auth/api-key',
    DERIVE_API_KEY: '/auth/derive-api-key', 
    GET_API_KEYS: '/auth/api-keys',
    DELETE_API_KEY: '/auth/api-key',
    BAN_STATUS: '/auth/ban-status/cert-required',
    CLOSED_ONLY_MODE: '/auth/ban-status/closed-only',
    
    // Order endpoints
    CREATE_ORDER: '/order',
    GET_ORDER: (orderId: string) => `/data/order/${orderId}`,
    GET_ORDERS: '/data/orders',
    CANCEL_ORDER: '/order',
    CANCEL_ORDERS: '/orders', 
    CANCEL_ALL_ORDERS: '/cancel-all',
    CANCEL_MARKET_ORDERS: '/cancel-market-orders',
    ORDER_SCORING: '/order-scoring',
    ORDERS_SCORING: '/orders-scoring',
    
    // Trade endpoints  
    GET_TRADES: '/data/trades',
    
    // Market endpoints
    GET_MARKETS: '/markets',
    GET_SAMPLING_MARKETS: '/sampling-markets',
    GET_SIMPLIFIED_MARKETS: '/simplified-markets', 
    GET_SAMPLING_SIMPLIFIED_MARKETS: '/sampling-simplified-markets',
    GET_MARKET: (conditionId: string) => `/markets/${conditionId}`,
    
    // Price and book endpoints
    GET_BOOK: '/book', // ?token_id={token_id}
    GET_BOOKS: '/books',
    GET_PRICE: '/price', // ?token_id={token_id}&side={side}
    GET_PRICES: '/prices',
    GET_MIDPOINT: '/midpoint', // ?token_id={token_id}
    GET_MIDPOINTS: '/midpoints',
    GET_SPREAD: '/spread', // ?token_id={token_id}
    GET_SPREADS: '/spreads',
    
    // Timeseries
    PRICES_HISTORY: '/prices-history',
  } as const;
  
  /**
   * WebSocket endpoint configuration - CORRECTED
   */
  export const WS_ENDPOINTS = {
    BASE_URL: 'wss://ws-subscriptions-clob.polymarket.com/ws/',
    
    // WebSocket channels
    USER_CHANNEL: 'user',
    MARKET_CHANNEL: 'market', 
  } as const;
  
  /**
   * API configuration - CORRECTED
   */
  export const API_CONFIG = {
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
  export function buildWsUrl(): string {
    return WS_ENDPOINTS.BASE_URL;
  }