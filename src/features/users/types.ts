/**
 * Author profile from `GET /users/{id}?select=id,firstName,lastName,image`.
 * Cached indefinitely via RTK Query — user data is immutable in this context.
 */
export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  /** Avatar URL from dummyjson CDN. Rendered via `next/image`. */
  image: string;
}
