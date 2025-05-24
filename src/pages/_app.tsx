if (process.env.NODE_ENV === 'development') {
    // start MSW
    import('../mocks/browser').then(({ worker }) => worker.start());
  }
  