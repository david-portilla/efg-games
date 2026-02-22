import { baseApi } from '@/shared/lib/baseApi';
import type { Author } from './types';

/**
 * Users API — extends `baseApi` via `injectEndpoints`.
 *
 * Why `keepUnusedDataFor: Infinity`: user profiles are immutable in this
 * context. Caching them forever means each author is fetched exactly once,
 * even if the same user appears across 50+ posts.
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<Author, number>({
      query: (id) => `/users/${id}?select=id,firstName,lastName,image`,
      keepUnusedDataFor: Infinity,
    }),
  }),
});

export const { useGetUserByIdQuery } = usersApi;
