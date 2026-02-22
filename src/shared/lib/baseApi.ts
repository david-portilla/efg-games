import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Shared RTK Query base API instance.
 *
 * Why: A single `createApi` with empty endpoints allows each feature
 * to call `baseApi.injectEndpoints()` independently — enabling code
 * splitting without duplicating the base query config.
 *
 * @see https://dummyjson.com/docs
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com' }),
  endpoints: () => ({}),
});
