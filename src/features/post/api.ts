import { baseApi } from '@/shared/lib/baseApi';
import type { PostDetail } from './types';

/** Post detail API — extends `baseApi` via `injectEndpoints`. */
export const postDetailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPostById: builder.query<PostDetail, number>({
      query: (id) => `/posts/${id}`,
    }),
  }),
});

export const { useGetPostByIdQuery } = postDetailApi;
