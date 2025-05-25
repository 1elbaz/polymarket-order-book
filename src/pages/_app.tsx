
// ============================
// File: src/pages/_app.tsx
// ============================
import '@/app/globals.css';
import type { AppProps } from 'next/app';
import { OrderBookProvider } from '@/contexts/OrderBookContext';

export default function App({ Component, pageProps }: AppProps) {
  // Replace 'your-market-id' with a dynamic value or router param as needed.
  const marketId = 'your-market-id';

  return (
    <OrderBookProvider marketId={marketId}>
      <Component {...pageProps} />
    </OrderBookProvider>
  );
}
