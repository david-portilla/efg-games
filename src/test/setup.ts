import '@testing-library/jest-dom';

// jsdom does not implement IntersectionObserver — provide a no-op stub
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
} as unknown as typeof IntersectionObserver;
