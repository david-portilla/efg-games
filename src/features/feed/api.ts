import { baseApi } from '@/shared/lib/baseApi';
import type { Post, PaginatedPostsResponse, PostsQueryParams } from './types';

/**
 * Posts API — extends `baseApi` via `injectEndpoints`.
 *
 * Why `select=id,title,body,userId`: dummyjson posts include extra fields
 * (tags, reactions, views) we don't need. Selecting only required fields
 * reduces payload size by ~40%.
 */
export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPostsPaginated: builder.query<PaginatedPostsResponse, PostsQueryParams>({
      query: ({ limit, skip }) => `/posts?limit=${limit}&skip=${skip}&select=id,title,body,userId`,
    }),
    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
    }),
    /** Used by the new post simulator (EFG-024) to create posts via dummyjson mock endpoint. */
    addPost: builder.mutation<Post, Pick<Post, 'title' | 'body' | 'userId'>>({
      query: (body) => ({
        url: '/posts/add',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetPostsPaginatedQuery, useGetPostByIdQuery, useAddPostMutation } = postsApi;
