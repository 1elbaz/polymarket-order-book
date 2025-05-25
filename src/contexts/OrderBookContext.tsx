import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { OrderBook } from '@/types/orderbook';
import { fetchOrderBook, OrderBookSocket } from '@/lib/apiClient';

// Connection status states
export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed';

// Context value shape
export interface OrderBookContextProps {
  book: OrderBook | null;
  status: ConnectionStatus;
  precision: number;
  rowCount: number;
  setPrecision: (precision: number) => void;
  setRowCount: (count: number) => void;
}

// Default context values
const defaultContext: OrderBookContextProps = {
  book: null,
  status: 'idle',
  precision: 2,
  rowCount: 10,
  setPrecision: () => {},
  setRowCount: () => {},
};

// Create context
const OrderBookContext = createContext<OrderBookContextProps>(defaultContext);

interface OrderBookProviderProps {
  marketId: string;
  children: ReactNode;
}

// Provider component
export const OrderBookProvider: React.FC<OrderBookProviderProps> = ({ marketId, children }) => {
  const [book, setBook] = useState<OrderBook | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [precision, setPrecision] = useState<number>(2);
  const [rowCount, setRowCount] = useState<number>(10);

  useEffect(() => {
    let mounted = true;
    setStatus('connecting');

    // Fetch initial snapshot
    fetchOrderBook(marketId)
      .then(initialBook => {
        if (!mounted) return;
        setBook(initialBook);
        setStatus('open');

        // Subscribe to live updates
        const socket = new OrderBookSocket(marketId, updatedBook => {
          if (!mounted) return;
          setBook(updatedBook);
        });

        return () => {
          mounted = false;
          socket.close();
        };
      })
      .catch(error => {
        console.error('OrderBook fetch error:', error);
        if (mounted) setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, [marketId]);

  const value: OrderBookContextProps = {
    book,
    status,
    precision,
    rowCount,
    setPrecision,
    setRowCount,
  };

  return (
    <OrderBookContext.Provider value={value}>
      {children}
    </OrderBookContext.Provider>
  );
};

// Hook for consuming the context
export const useOrderBook = (): OrderBookContextProps => {
  return useContext(OrderBookContext);
};
