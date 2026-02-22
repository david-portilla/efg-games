export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface PostsQueryParams {
  limit: number;
  skip: number;
}
