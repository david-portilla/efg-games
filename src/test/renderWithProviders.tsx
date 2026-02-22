import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { baseApi } from '@/shared/lib/baseApi';
import feedReducer from '@/features/feed/slice';
import type { ReactElement } from 'react';

/** Creates a fresh Redux store for testing — isolates cache state between tests. */
export function createTestStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      feed: feedReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: ReturnType<typeof createTestStore>;
}

/** Renders a component wrapped in a fresh Redux store Provider. */
export function renderWithProviders(ui: ReactElement, options?: RenderWithProvidersOptions) {
  const { store = createTestStore(), ...renderOptions } = options ?? {};
  return {
    store,
    ...render(ui, {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      ...renderOptions,
    }),
  };
}
