// File: src/contexts/OrderBookContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { OrderBook } from '@/types/orderbook';
import type { ConnectionStatus } from '@/types/orderbook'; // Use the simple type
import { fetchOrderBook, OrderBookSocket } from '@/lib/apiClient';

// Context value shape - simplified to use ConnectionStatus instead of ConnectionState
export interface OrderBookContextProps {
  book: OrderBook | null;
  status: ConnectionStatus; // Changed from ConnectionState to ConnectionStatus
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
    let socket: OrderBookSocket | null = null;

    const initializeOrderBook = async () => {
      setStatus('connecting');

      try {
        // Fetch initial snapshot
        const initialBook = await fetchOrderBook(marketId);
        
        if (!mounted) return;
        
        setBook(initialBook);
        setStatus('connected');

        // Subscribe to live updates
        socket = new OrderBookSocket(
          marketId, 
          (updatedBook: OrderBook) => {
            if (!mounted) return;
            setBook(updatedBook);
          },
          (newStatus: ConnectionStatus) => {
            if (!mounted) return;
            setStatus(newStatus);
          }
        );

      } catch (error) {
        console.error('OrderBook fetch error:', error);
        if (mounted) {
          setStatus('error');
        }
      }
    };

    initializeOrderBook();

    return () => {
      mounted = false;
      if (socket) {
        socket.close();
      }
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