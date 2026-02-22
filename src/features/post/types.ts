/** Full post from `GET /posts/{id}` — includes all fields unlike the feed's select query. */
export interface PostDetail {
  id: number;
  title: string;
  body: string;
  userId: number;
}
