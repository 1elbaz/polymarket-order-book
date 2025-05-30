// ============================
// File: src/components/OrderBookViewer.tsx
// ============================
import React from 'react';
import { useOrderBook } from '@/contexts/OrderBookContext';

export const OrderBookViewer: React.FC = () => {
  const { book, status, precision, rowCount, setPrecision, setRowCount } = useOrderBook();

  if (status === 'connecting' || !book) {
    return <div>Loading order book...</div>;
  }
  if (status === 'error') {
    return <div>Error loading order book.</div>;
  }

  // Display a simple table of top bids and asks
  const bids = book.bids.slice(0, rowCount);
  const asks = book.asks.slice(0, rowCount);

  return (
    <div>
      <div>
        <label>
          Precision:
          <input
            type="number"
            value={precision}
            onChange={e => setPrecision(Number(e.target.value))}
            data-testid="precision-input"
          />
        </label>
        <label>
          Rows:
          <input
            type="number"
            value={rowCount}
            onChange={e => setRowCount(Number(e.target.value))}
            data-testid="rowcount-input"
          />
        </label>
      </div>
      <table data-testid="orderbook-table">
        <thead>
          <tr>
            <th>Bid Price</th>
            <th>Bid Size</th>
            <th>Ask Price</th>
            <th>Ask Size</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => {
            const bid = bids[i];
            const ask = asks[i];
            return (
              <tr key={i}>
                <td>{bid ? bid.price.toFixed(precision) : '-'}</td>
                <td>{bid ? bid.size.toFixed(precision) : '-'}</td>
                <td>{ask ? ask.price.toFixed(precision) : '-'}</td>
                <td>{ask ? ask.size.toFixed(precision) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
