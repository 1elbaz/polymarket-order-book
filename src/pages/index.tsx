// File: src/pages/index.tsx
import React, { useState } from 'react';
import { OrderBookProvider } from '@/contexts/OrderBookContext';
import { OrderBookViewer } from '@/components/OrderBookViewer';

const MarketSelector: React.FC<{ onMarketSelect: (marketId: string) => void }> = ({ onMarketSelect }) => {
  const [marketInput, setMarketInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!marketInput.trim()) {
      setError('Please enter a market ID or URL');
      return;
    }

    // Extract market ID from URL if needed
    let marketId = marketInput.trim();
    if (marketInput.includes('polymarket.com')) {
      const match = marketInput.match(/\/market\/([^/?]+)/);
      if (match) {
        marketId = match[1];
      } else {
        setError('Invalid Polymarket URL format');
        return;
      }
    }

    onMarketSelect(marketId);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Select Market
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="market-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Market ID or Polymarket URL
          </label>
          <input
            id="market-input"
            type="text"
            value={marketInput}
            onChange={(e) => setMarketInput(e.target.value)}
            placeholder="e.g., 0x1234... or https://polymarket.com/market/..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Load Order Book
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">Example markets to try:</p>
        <div className="space-y-1">
          <button 
            onClick={() => setMarketInput('0x123')}
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sample Market 1
          </button>
          <button 
            onClick={() => setMarketInput('0x456')}
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sample Market 2
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderBookPage: React.FC<{ marketId: string; onBack: () => void }> = ({ marketId, onBack }) => {
  return (
    <OrderBookProvider marketId={marketId}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-blue-600 dark:text-blue-400 hover:underline mb-2"
            >
              ← Back to market selection
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Market Order Book
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Market ID: {marketId}
            </p>
          </div>
        </div>
        
        {/* Order Book */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <OrderBookViewer />
          </div>
          
          {/* Placeholder for future components */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Market Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Market details will be displayed here in future updates.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Trades
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Trade history will be displayed here in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </OrderBookProvider>
  );
};

const IndexPage: React.FC = () => {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {selectedMarket ? (
          <OrderBookPage 
            marketId={selectedMarket} 
            onBack={() => setSelectedMarket(null)} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Polymarket Order Book Viewer
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                View real-time order book data for Polymarket prediction markets
              </p>
            </div>
            
            <MarketSelector onMarketSelect={setSelectedMarket} />
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;