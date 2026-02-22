/** Single post from dummyjson.com — uses `select=id,title,body,userId` to minimize payload. */
export interface Post {
  id: number;
  title: string;
  body: string;
  /** Foreign key to `/users/{userId}` — resolved via `usersApi`. */
  userId: number;
}

/** Paginated response shape from `GET /posts?limit=N&skip=N`. */
export interface PaginatedPostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

/** Query params for paginated posts endpoint. */
export interface PostsQueryParams {
  limit: number;
  skip: number;
}
