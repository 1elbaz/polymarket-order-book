// File: src/components/OrderBookViewer.tsx
import React from 'react';
import { useOrderBook } from '@/contexts/OrderBookContext';
import type { Order } from '@/types/orderbook';

interface OrderRowProps {
  order: Order;
  side: 'bid' | 'ask';
  precision: number;
  maxTotal: number;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, side, precision, maxTotal }) => {
  const sizeBarWidth = maxTotal > 0 ? (order.total.toNumber() / maxTotal) * 100 : 0;
  
  return (
    <div className={`relative flex justify-between items-center py-1 px-2 text-sm font-mono hover:bg-gray-100 dark:hover:bg-gray-800 ${
      side === 'bid' ? 'hover:bg-green-50 dark:hover:bg-green-900/20' : 'hover:bg-red-50 dark:hover:bg-red-900/20'
    }`}>
      {/* Background size indicator */}
      <div 
        className={`absolute inset-0 ${
          side === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}
        style={{ width: `${sizeBarWidth}%` }}
      />
      
      {/* Order data */}
      <div className="relative z-10 flex justify-between w-full">
        <span className={`font-medium ${
          side === 'bid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {order.price.toFixed(precision)}
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          {order.size.toFixed(2)}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {order.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

interface ConnectionStatusProps {
  status: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'connecting': case 'reconnecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '●';
      case 'connecting': case 'reconnecting': return '◐';
      case 'error': return '●';
      default: return '○';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`${getStatusColor()} font-mono`}>
        {getStatusIcon()}
      </span>
      <span className="capitalize text-gray-600 dark:text-gray-400">
        {status}
      </span>
    </div>
  );
};

export const OrderBookViewer: React.FC = () => {
  const { book, status, precision, rowCount, setPrecision, setRowCount } = useOrderBook();

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading order book...</p>
      </div>
    );
  }

  if (status === 'error' || !book) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-red-500 text-2xl mb-2">⚠</div>
        <p className="text-red-600 dark:text-red-400 text-center">
          Error loading order book
          <br />
          <span className="text-sm">Please check your connection and try again</span>
        </p>
      </div>
    );
  }

  // Get orders for display
  const displayBids = book.bids.slice(0, rowCount);
  const displayAsks = book.asks.slice(0, rowCount).reverse(); // Show best ask at bottom
  
  // Calculate max total for sizing bars
  const maxBidTotal = displayBids.length > 0 ? displayBids[displayBids.length - 1].total.toNumber() : 0;
  const maxAskTotal = displayAsks.length > 0 ? displayAsks[0].total.toNumber() : 0;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  // Get spread information
  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;
  const spread = bestBid && bestAsk ? bestAsk.minus(bestBid) : null;
  const spreadPercent = spread && bestBid ? spread.dividedBy(bestBid).times(100) : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Book
          </h2>
          <ConnectionStatus status={status} />
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-600 dark:text-gray-400">Precision:</label>
            <select
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="precision-input"
            >
              {[0, 1, 2, 3, 4].map(p => (
                <option key={p} value={p}>{p} decimals</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-gray-600 dark:text-gray-400">Rows:</label>
            <select
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              data-testid="rowcount-input"
            >
              {[5, 10, 15, 20, 25].map(r => (
                <option key={r} value={r}>{r} levels</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Order book table */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
          <div>Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (sells) - displayed top to bottom, worst to best */}
        <div className="min-h-0" data-testid="asks-section">
          {displayAsks.map((ask, index) => (
            <OrderRow
              key={`ask-${ask.price.toString()}-${index}`}
              order={ask}
              side="ask"
              precision={precision}
              maxTotal={maxTotal}
            />
          ))}
        </div>

        {/* Spread indicator */}
        {spread && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Spread:</span>
              <div className="text-right">
                <div className="font-mono text-gray-900 dark:text-white">
                  {spread.toFixed(precision)}
                </div>
                {spreadPercent && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ({spreadPercent.toFixed(2)}%)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bids (buys) - displayed top to bottom, best to worst */}
        <div className="min-h-0" data-testid="bids-section">
          {displayBids.map((bid, index) => (
            <OrderRow
              key={`bid-${bid.price.toString()}-${index}`}
              order={bid}
              side="bid"
              precision={precision}
              maxTotal={maxTotal}
            />
          ))}
        </div>
      </div>

      {/* Footer with last update time */}
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        Last updated: {new Date(book.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};