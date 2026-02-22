import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Post } from './types';

interface FeedState {
  /** Posts prepended to the feed via the real-time simulator. */
  newPosts: Post[];
  /** Saved scroll position in px — restored when navigating back from post detail. */
  scrollPosition: number;
}

const initialState: FeedState = {
  newPosts: [],
  scrollPosition: 0,
};

/**
 * Feed slice managing local state for real-time new posts and scroll position.
 *
 * Why: RTK Query owns the paginated posts cache. This slice handles only the
 * two pieces of state that RTK Query cannot — optimistically prepended posts
 * from the simulator and the scroll offset for navigation restore.
 */
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    /** Prepends a simulated post to the top of the feed. */
    addNewPost(state, action: PayloadAction<Post>) {
      state.newPosts.unshift(action.payload);
    },

    /** Saves scroll Y offset for back-navigation restore. */
    setScrollPosition(state, action: PayloadAction<number>) {
      state.scrollPosition = action.payload;
    },

    /** Clears all real-time prepended posts. */
    clearNewPosts(state) {
      state.newPosts = [];
    },
  },
});

export const { addNewPost, setScrollPosition, clearNewPosts } = feedSlice.actions;
export default feedSlice.reducer;
