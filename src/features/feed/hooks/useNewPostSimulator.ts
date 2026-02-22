import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/shared/lib/hooks';
import { useAddPostMutation } from '../api';
import { addNewPost } from '../slice';

const INTERVAL_MS = 8_000;

// Why: dummyjson POST /posts/add always returns id: 251 — a local counter
// generates unique ids to prevent React key conflicts across simulated posts.
let localIdCounter = 10_000;
const nextLocalId = () => ++localIdCounter;

/**
 * Simulates real-time new posts by polling POST /posts/add on an interval.
 *
 * Why interval over WebSocket: dummyjson has no push API. A simple interval
 * is the least complex approach that demonstrates the real-time UX requirement.
 */
export function useNewPostSimulator() {
  const dispatch = useAppDispatch();
  const [addPost] = useAddPostMutation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const tick = async () => {
      if (!isMounted.current) return;
      try {
        const result = await addPost({
          title: 'New post from the community',
          body: 'Something exciting just happened. Stay tuned for more updates.',
          userId: Math.ceil(Math.random() * 100),
        }).unwrap();

        if (isMounted.current) {
          dispatch(addNewPost({ ...result, id: nextLocalId() }));
        }
      } catch {
        // Silently ignore — simulator failures should not surface to the user
      }
    };

    const id = setInterval(tick, INTERVAL_MS);
    return () => {
      isMounted.current = false;
      clearInterval(id);
    };
  }, [addPost, dispatch]);
}
