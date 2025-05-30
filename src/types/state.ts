// File: src/types/state.ts
import { z } from 'zod';
import type { 
  Market, 
  DetailedMarket, 
  MarketFilters, 
  MarketSortOptions, 
  MarketPreferences,
  RecentMarketActivity 
} from './market';
import type { 
  OrderBook, 
  AggregatedOrderBook, 
  OrderBookConfig, 
  PriceImpactResult, 
  ConnectionStatus,
  OrderBookError,
  LastTrade,
  OrderBookStats 
} from './orderbook';
import type { 
  TradeApiResponse,
  RateLimitInfo 
} from './api';

// =============================================================================
// SIMPLIFIED TYPES TO AVOID CONFLICTS
// =============================================================================

/**
 * Simplified decimal-like type that can accept both Decimal and number
 */
export type StateDecimal = string | number;

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Font size options
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * View types
 */
export type AppView = 'market-selection' | 'order-book' | 'analysis' | 'settings';

/**
 * Mobile tab options
 */
export type MobileTab = 'details' | 'orderbook' | 'trades' | 'chart';

/**
 * Notification types
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Breakpoint types
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Orientation types
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Network types
 */
export type NetworkType = 'ethernet' | 'wifi' | 'cellular' | 'unknown';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error types
 */
export type ErrorType = 'api' | 'websocket' | 'calculation' | 'ui' | 'network';

/**
 * Trade side filter
 */
export type TradeSideFilter = 'buy' | 'sell' | 'all';

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'sideways';

/**
 * Connection health status
 */
export type ConnectionHealth = 'healthy' | 'degraded' | 'unhealthy';

// =============================================================================
// GLOBAL APPLICATION STATE
// =============================================================================

/**
 * Root application state structure
 */
export interface AppState {
  /** Market-related state */
  market: MarketState;
  /** Order book state */
  orderBook: OrderBookState;
  /** Trade history state */
  trades: TradeState;
  /** User interface state */
  ui: UIState;
  /** User preferences and settings */
  user: UserState;
  /** API and connection state */
  connection: ConnectionState;
  /** Error handling state */
  errors: ErrorState;
  /** Performance and analytics state */
  analytics: AnalyticsState;
}

// =============================================================================
// MARKET STATE
// =============================================================================

/**
 * Market selection and data state
 */
export interface MarketState {
  /** Currently selected market */
  selectedMarket: DetailedMarket | null;
  /** Market loading state */
  loading: boolean;
  /** Market data error */
  error: string | null;
  /** Available markets for selection */
  availableMarkets: Market[];
  /** Search results */
  searchResults: {
    markets: Market[];
    total: number;
    loading: boolean;
    query: string;
    filters: Record<string, unknown>; // Simplified to avoid type conflicts
    sort: Record<string, unknown>; // Simplified to avoid type conflicts
  };
  /** Recently viewed markets */
  recentMarkets: Array<{
    marketId: string;
    market: Market;
    lastViewed: number;
  }>;
  /** Favorite/watchlist markets */
  watchlist: string[];
  /** Market metadata cache */
  cache: Record<string, {
    market: DetailedMarket;
    lastFetched: number;
    expires: number;
  }>;
  /** Market subscription status */
  subscriptions: Record<string, {
    isSubscribed: boolean;
    subscriptionType: 'orderbook' | 'trades' | 'all';
    lastUpdate: number;
  }>;
}

// =============================================================================
// ORDER BOOK STATE
// =============================================================================

/**
 * Order book data and configuration state
 */
export interface OrderBookState {
  /** Raw order book data */
  rawBook: OrderBook | null;
  /** Aggregated order book (after precision/filtering) */
  aggregatedBook: AggregatedOrderBook | null;
  /** Order book configuration */
  config: OrderBookConfig;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: OrderBookError | null;
  /** Last successful update timestamp */
  lastUpdate: number;
  /** Order book statistics */
  stats: OrderBookStats | null;
  /** Price impact calculation cache */
  priceImpactCache: Record<string, {
    result: PriceImpactResult;
    timestamp: number;
  }>;
  /** Historical snapshots for comparison */
  history: Array<{
    timestamp: number;
    snapshot: OrderBook;
    stats: OrderBookStats;
  }>;
  /** Real-time update metadata */
  updates: {
    /** Total updates received */
    totalUpdates: number;
    /** Updates per second (rolling average) */
    updatesPerSecond: number;
    /** Last update sequence number */
    lastSequence: number;
    /** Missed updates count */
    missedUpdates: number;
  };
}

// =============================================================================
// TRADE STATE
// =============================================================================

/**
 * Trade history and analysis state
 */
export interface TradeState {
  /** Recent trades list */
  recentTrades: TradeApiResponse[];
  /** Last trade information */
  lastTrade: LastTrade | null;
  /** Trade history loading state */
  loading: boolean;
  /** Trade data error */
  error: string | null;
  /** Trade analysis data */
  analysis: {
    /** Volume-weighted average price */
    vwap: StateDecimal | null;
    /** Trading frequency */
    frequency: number;
    /** Average trade size */
    averageSize: StateDecimal | null;
    /** Price trend */
    trend: TrendDirection;
    /** Volatility measure */
    volatility: StateDecimal | null;
  };
  /** Trade filters and pagination */
  filters: {
    /** Time range filter */
    timeRange: {
      from: number;
      to: number;
    };
    /** Minimum trade size filter */
    minSize: StateDecimal | null;
    /** Side filter */
    side: TradeSideFilter;
    /** Current page */
    page: number;
    /** Items per page */
    limit: number;
  };
  /** Trade subscription status */
  subscription: {
    isActive: boolean;
    lastTradeReceived: number;
    tradesPerMinute: number;
  };
}

// =============================================================================
// UI STATE
// =============================================================================

/**
 * User interface state and preferences
 */
export interface UIState {
  /** Current view/page */
  currentView: AppView;
  /** Layout configuration */
  layout: {
    /** Sidebar visibility */
    sidebarOpen: boolean;
    /** Panel sizes */
    panelSizes: {
      orderBook: number;
      depthChart: number;
      tradeHistory: number;
    };
    /** Mobile tab selection */
    mobileTab: MobileTab;
  };
  /** Theme and appearance */
  theme: {
    /** Color scheme */
    mode: ThemeMode;
    /** Color accent */
    accent: string;
    /** Font size scale */
    fontSize: FontSize;
    /** Animation preferences */
    animations: boolean;
    /** Reduced motion */
    reducedMotion: boolean;
  };
  /** Modal and overlay state */
  modals: {
    /** Market search modal */
    marketSearch: boolean;
    /** Settings modal */
    settings: boolean;
    /** Price impact modal */
    priceImpact: boolean;
    /** Help modal */
    help: boolean;
  };
  /** Loading states for UI elements */
  loading: {
    /** Page transition loading */
    pageTransition: boolean;
    /** Data refresh loading */
    dataRefresh: boolean;
    /** Action button loading states */
    buttons: Record<string, boolean>;
  };
  /** Toast notifications */
  notifications: Array<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: number;
    duration?: number;
    actions?: Array<{
      label: string;
      action: string;
    }>;
  }>;
  /** Keyboard shortcuts state */
  shortcuts: {
    enabled: boolean;
    activeShortcuts: Record<string, boolean>;
  };
  /** Responsive design state */
  responsive: {
    /** Screen size category */
    breakpoint: Breakpoint;
    /** Actual screen dimensions */
    dimensions: {
      width: number;
      height: number;
    };
    /** Device orientation */
    orientation: Orientation;
    /** Touch device detection */
    touchDevice: boolean;
  };
}

// =============================================================================
// USER STATE
// =============================================================================

/**
 * User preferences and personalization state
 */
export interface UserState {
  /** User market preferences - simplified to avoid type conflicts */
  preferences: Record<string, unknown>;
  /** Recent user activity - simplified to avoid type conflicts */
  activity: Record<string, unknown>;
  /** User settings */
  settings: {
    /** Default precision for order book */
    defaultPrecision: number;
    /** Default row count */
    defaultRowCount: number;
    /** Auto-refresh intervals */
    refreshIntervals: {
      orderBook: number;
      trades: number;
      marketData: number;
    };
    /** Notification preferences */
    notifications: {
      browser: boolean;
      sound: boolean;
      priceAlerts: boolean;
      volumeAlerts: boolean;
      newMarkets: boolean;
    };
    /** Privacy preferences */
    privacy: {
      analytics: boolean;
      crashReporting: boolean;
      performanceTracking: boolean;
    };
    /** Accessibility preferences */
    accessibility: {
      highContrast: boolean;
      largeText: boolean;
      keyboardNavigation: boolean;
      screenReader: boolean;
    };
  };
  /** User session information */
  session: {
    /** Session start time */
    startTime: number;
    /** Time spent in application */
    timeSpent: number;
    /** Page views in session */
    pageViews: number;
    /** Markets viewed in session */
    marketsViewed: string[]; // Changed from Set to Array for serialization
    /** User actions count */
    actions: Record<string, number>;
  };
  /** Local storage sync status */
  storage: {
    /** Last sync timestamp */
    lastSync: number;
    /** Pending changes to sync */
    pendingChanges: string[];
    /** Storage quota usage */
    quotaUsage: {
      used: number;
      available: number;
      percentage: number;
    };
  };
}

// =============================================================================
// CONNECTION STATE
// =============================================================================

/**
 * API connection and network state
 */
export interface ConnectionState {
  /** Overall connection status */
  status: ConnectionStatus;
  /** WebSocket connection state */
  websocket: {
    /** Connection status */
    status: ConnectionStatus;
    /** Connection URL */
    url: string;
    /** Reconnection attempts */
    reconnectAttempts: number;
    /** Max reconnection attempts */
    maxReconnectAttempts: number;
    /** Reconnection delay */
    reconnectDelay: number;
    /** Last connection timestamp */
    lastConnected: number;
    /** Connection uptime */
    uptime: number;
    /** Messages received count */
    messagesReceived: number;
    /** Messages sent count */
    messagesSent: number;
  };
  /** REST API connection state */
  api: {
    /** Base URL */
    baseUrl: string;
    /** Rate limiting information */
    rateLimit: RateLimitInfo | null;
    /** Request queue size */
    queueSize: number;
    /** Active requests count */
    activeRequests: number;
    /** Average response time */
    averageResponseTime: number;
    /** Error rate (requests failed / total requests) */
    errorRate: number;
    /** Last successful request */
    lastSuccessfulRequest: number;
  };
  /** Network quality indicators */
  network: {
    /** Connection type */
    type: NetworkType;
    /** Estimated bandwidth */
    bandwidth: number;
    /** Latency to API */
    latency: number;
    /** Packet loss rate */
    packetLoss: number;
    /** Online/offline status */
    online: boolean;
  };
  /** Fallback mechanisms */
  fallback: {
    /** Using polling instead of WebSocket */
    usingPolling: boolean;
    /** Polling interval */
    pollingInterval: number;
    /** Cached data available */
    cacheAvailable: boolean;
    /** Offline mode active */
    offlineMode: boolean;
  };
}

// =============================================================================
// ERROR STATE
// =============================================================================

/**
 * Error handling and reporting state
 */
export interface ErrorState {
  /** Current active errors */
  activeErrors: Array<{
    id: string;
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    details?: Record<string, unknown>;
    timestamp: number;
    retryable: boolean;
    retryCount: number;
    resolved: boolean;
  }>;
  /** Error history */
  errorHistory: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: number;
    resolved: boolean;
    resolutionTime?: number;
  }>;
  /** Error recovery state */
  recovery: {
    /** Auto-recovery enabled */
    autoRecoveryEnabled: boolean;
    /** Recovery attempts in progress */
    recoveryInProgress: string[]; // Changed from Set to Array
    /** Successful recoveries count */
    successfulRecoveries: number;
    /** Failed recoveries count */
    failedRecoveries: number;
  };
  /** Error reporting */
  reporting: {
    /** Reporting enabled */
    enabled: boolean;
    /** Pending reports */
    pendingReports: Array<{
      errorId: string;
      reportData: Record<string, unknown>;
      timestamp: number;
    }>;
    /** Last report sent */
    lastReportSent: number;
  };
}

// =============================================================================
// ANALYTICS STATE
// =============================================================================

/**
 * Performance and usage analytics state
 */
export interface AnalyticsState {
  /** Performance metrics */
  performance: {
    /** Page load time */
    pageLoadTime: number;
    /** Time to interactive */
    timeToInteractive: number;
    /** First contentful paint */
    firstContentfulPaint: number;
    /** Largest contentful paint */
    largestContentfulPaint: number;
    /** Cumulative layout shift */
    cumulativeLayoutShift: number;
    /** Memory usage */
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    /** Bundle size information */
    bundleSize: {
      javascript: number;
      css: number;
      images: number;
      total: number;
    };
  };
  /** Usage analytics */
  usage: {
    /** Feature usage tracking */
    features: Record<string, {
      usageCount: number;
      totalTime: number;
      lastUsed: number;
    }>;
    /** User journey tracking */
    journey: Array<{
      page: string;
      timestamp: number;
      duration: number;
      actions: string[];
    }>;
    /** Interaction analytics */
    interactions: {
      clicks: number;
      keystrokes: number;
      scrolls: number;
      hovers: number;
    };
  };
  /** Error analytics */
  errors: {
    /** Error frequency by type */
    frequency: Record<string, number>;
    /** Error resolution time */
    resolutionTime: Record<string, number>;
    /** User impact score */
    userImpact: number;
  };
  /** Business metrics */
  business: {
    /** Markets viewed */
    marketsViewed: number;
    /** Time spent analyzing */
    analysisTime: number;
    /** Price impact calculations performed */
    priceImpactCalculations: number;
    /** Search queries performed */
    searchQueries: number;
  };
}

// =============================================================================
// ACTION TYPES
// =============================================================================

/**
 * Redux-style action types for state management
 */
export type ActionType = 
  // Market actions
  | 'MARKET_SELECT'
  | 'MARKET_LOAD_START'
  | 'MARKET_LOAD_SUCCESS'
  | 'MARKET_LOAD_ERROR'
  | 'MARKET_SEARCH'
  | 'MARKET_ADD_TO_WATCHLIST'
  | 'MARKET_REMOVE_FROM_WATCHLIST'
  
  // Order book actions
  | 'ORDERBOOK_UPDATE'
  | 'ORDERBOOK_CONFIG_CHANGE'
  | 'ORDERBOOK_CLEAR'
  | 'ORDERBOOK_SUBSCRIBE'
  | 'ORDERBOOK_UNSUBSCRIBE'
  
  // Trade actions
  | 'TRADE_UPDATE'
  | 'TRADE_HISTORY_LOAD'
  | 'TRADE_FILTER_CHANGE'
  
  // UI actions
  | 'UI_THEME_CHANGE'
  | 'UI_LAYOUT_CHANGE'
  | 'UI_MODAL_OPEN'
  | 'UI_MODAL_CLOSE'
  | 'UI_NOTIFICATION_ADD'
  | 'UI_NOTIFICATION_REMOVE'
  
  // Connection actions
  | 'CONNECTION_STATUS_CHANGE'
  | 'WEBSOCKET_CONNECT'
  | 'WEBSOCKET_DISCONNECT'
  | 'API_REQUEST_START'
  | 'API_REQUEST_SUCCESS'
  | 'API_REQUEST_ERROR'
  
  // Error actions
  | 'ERROR_ADD'
  | 'ERROR_RESOLVE'
  | 'ERROR_RETRY'
  
  // User actions
  | 'USER_PREFERENCES_UPDATE'
  | 'USER_ACTIVITY_TRACK'
  | 'USER_SETTINGS_CHANGE';

/**
 * Action payload structure
 */
export interface Action<T = unknown> {
  type: ActionType;
  payload: T;
  timestamp: number;
  meta?: Record<string, unknown>;
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

/**
 * Schema for validating UI theme
 */
export const UIThemeSchema = z.object({
  mode: z.enum(['light', 'dark', 'auto']),
  accent: z.string(),
  fontSize: z.enum(['small', 'medium', 'large']),
  animations: z.boolean(),
  reducedMotion: z.boolean(),
});

/**
 * Schema for validating connection status
 */
export const ConnectionStatusSchema = z.enum([
  'idle', 'connecting', 'connected', 'reconnecting', 
  'disconnected', 'error', 'fallback'
]);

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for valid action
 */
export function isValidAction(action: unknown): action is Action {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    'payload' in action &&
    'timestamp' in action &&
    typeof (action as any).type === 'string' &&
    typeof (action as any).timestamp === 'number'
  );
}

/**
 * Type guard for UI theme
 */
export function isValidUITheme(theme: unknown): theme is UIState['theme'] {
  return UIThemeSchema.safeParse(theme).success;
}

/**
 * Type guard for connection status
 */
export function isValidConnectionStatus(status: unknown): status is ConnectionStatus {
  return ConnectionStatusSchema.safeParse(status).success;
}

// =============================================================================
// STATE HELPERS
// =============================================================================

/**
 * Create initial app state
 */
export function createInitialAppState(): AppState {
  const now = Date.now();
  
  return {
    market: {
      selectedMarket: null,
      loading: false,
      error: null,
      availableMarkets: [],
      searchResults: {
        markets: [],
        total: 0,
        loading: false,
        query: '',
        filters: {},
        sort: {},
      },
      recentMarkets: [],
      watchlist: [],
      cache: {},
      subscriptions: {},
    },
    orderBook: {
      rawBook: null,
      aggregatedBook: null,
      config: {
        precision: 2,
        rowCount: 10,
        showTotals: true,
        showOrderCounts: false,
      },
      loading: false,
      error: null,
      lastUpdate: 0,
      stats: null,
      priceImpactCache: {},
      history: [],
      updates: {
        totalUpdates: 0,
        updatesPerSecond: 0,
        lastSequence: 0,
        missedUpdates: 0,
      },
    },
    trades: {
      recentTrades: [],
      lastTrade: null,
      loading: false,
      error: null,
      analysis: {
        vwap: null,
        frequency: 0,
        averageSize: null,
        trend: 'sideways',
        volatility: null,
      },
      filters: {
        timeRange: {
          from: now - 24 * 60 * 60 * 1000,
          to: now,
        },
        minSize: null,
        side: 'all',
        page: 1,
        limit: 50,
      },
      subscription: {
        isActive: false,
        lastTradeReceived: 0,
        tradesPerMinute: 0,
      },
    },
    ui: {
      currentView: 'market-selection',
      layout: {
        sidebarOpen: true,
        panelSizes: {
          orderBook: 40,
          depthChart: 35,
          tradeHistory: 25,
        },
        mobileTab: 'orderbook',
      },
      theme: {
        mode: 'dark',
        accent: '#3B82F6',
        fontSize: 'medium',
        animations: true,
        reducedMotion: false,
      },
      modals: {
        marketSearch: false,
        settings: false,
        priceImpact: false,
        help: false,
      },
      loading: {
        pageTransition: false,
        dataRefresh: false,
        buttons: {},
      },
      notifications: [],
      shortcuts: {
        enabled: true,
        activeShortcuts: {},
      },
      responsive: {
        breakpoint: 'desktop',
        dimensions: { width: 1920, height: 1080 },
        orientation: 'landscape',
        touchDevice: false,
      },
    },
    user: {
      preferences: {},
      activity: {},
      settings: {
        defaultPrecision: 2,
        defaultRowCount: 10,
        refreshIntervals: {
          orderBook: 1000,
          trades: 5000,
          marketData: 30000,
        },
        notifications: {
          browser: true,
          sound: false,
          priceAlerts: true,
          volumeAlerts: true,
          newMarkets: false,
        },
        privacy: {
          analytics: true,
          crashReporting: true,
          performanceTracking: true,
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          keyboardNavigation: true,
          screenReader: false,
        },
      },
      session: {
        startTime: now,
        timeSpent: 0,
        pageViews: 1,
        marketsViewed: [],
        actions: {},
      },
      storage: {
        lastSync: now,
        pendingChanges: [],
        quotaUsage: {
          used: 0,
          available: 0,
          percentage: 0,
        },
      },
    },
    connection: {
      status: 'idle',
      websocket: {
        status: 'idle',
        url: '',
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        reconnectDelay: 1000,
        lastConnected: 0,
        uptime: 0,
        messagesReceived: 0,
        messagesSent: 0,
      },
      api: {
        baseUrl: '',
        rateLimit: null,
        queueSize: 0,
        activeRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastSuccessfulRequest: 0,
      },
      network: {
        type: 'unknown',
        bandwidth: 0,
        latency: 0,
        packetLoss: 0,
        online: true,
      },
      fallback: {
        usingPolling: false,
        pollingInterval: 5000,
        cacheAvailable: false,
        offlineMode: false,
      },
    },
    errors: {
      activeErrors: [],
      errorHistory: [],
      recovery: {
        autoRecoveryEnabled: true,
        recoveryInProgress: [],
        successfulRecoveries: 0,
        failedRecoveries: 0,
      },
      reporting: {
        enabled: true,
        pendingReports: [],
        lastReportSent: 0,
      },
    },
    analytics: {
      performance: {
        pageLoadTime: 0,
        timeToInteractive: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        memoryUsage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        bundleSize: {
          javascript: 0,
          css: 0,
          images: 0,
          total: 0,
        },
      },
      usage: {
        features: {},
        journey: [],
        interactions: {
          clicks: 0,
          keystrokes: 0,
          scrolls: 0,
          hovers: 0,
        },
      },
      errors: {
        frequency: {},
        resolutionTime: {},
        userImpact: 0,
      },
      business: {
        marketsViewed: 0,
        analysisTime: 0,
        priceImpactCalculations: 0,
        searchQueries: 0,
      },
    },
  };
}

/**
 * Deep merge state updates with proper TypeScript constraints
 */
export function mergeState<T extends Record<string, any>>(
    current: T, 
    updates: Partial<T>
  ): T {
    if (typeof current !== 'object' || current === null) {
      return { ...((current || {}) as {}), ...updates } as T;
    }
    
    const result: T = { ...current };
    
    Object.keys(updates).forEach((key) => {
      const typedKey = key as keyof T;
      const updateValue = updates[typedKey];
      
      if (updateValue !== undefined) {
        if (
          typeof updateValue === 'object' && 
          updateValue !== null && 
          !Array.isArray(updateValue) &&
          typeof current[typedKey] === 'object' &&
          current[typedKey] !== null &&
          !Array.isArray(current[typedKey]) &&
          typeof current[typedKey] === 'object'
        ) {
          // Recursively merge objects
          result[typedKey] = mergeState(
            current[typedKey] as Record<string, any>,
            updateValue as Record<string, any>
          ) as T[keyof T];
        } else {
          // Direct assignment for primitive values and arrays
          result[typedKey] = updateValue as T[keyof T];
        }
      }
    });
    
    return result;
  }
