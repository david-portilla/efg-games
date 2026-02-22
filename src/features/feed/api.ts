import { baseApi } from '@/shared/lib/baseApi';
import type { Post, PaginatedPostsResponse, PostsQueryParams } from './types';

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPostsPaginated: builder.query<PaginatedPostsResponse, PostsQueryParams>({
      query: ({ limit, skip }) => `/posts?limit=${limit}&skip=${skip}&select=id,title,body,userId`,
    }),
    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
    }),
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
