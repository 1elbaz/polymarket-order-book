// File: src/pages/_app.tsx
import type { AppProps } from 'next/app';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // start MSW in browser only
  import('../mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'warn',
    });
  });
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}