import type { AppProps } from 'next/app';

if (process.env.NODE_ENV === 'development') {
    // start MSW
    import('../mocks/browser').then(({ worker }) => worker.start());
  } 
export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
  } 
  