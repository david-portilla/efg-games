import { describe, it, expect } from 'vitest';
import reducer, { addNewPost, setScrollPosition, clearNewPosts } from './slice';
import type { Post } from './types';

const mockPost = (id: number): Post => ({
  id,
  title: `Post ${id}`,
  body: `Body of post ${id}`,
  userId: 1,
});

describe('feedSlice', () => {
  describe('initial state', () => {
    it('has empty newPosts and scrollPosition 0', () => {
      const state = reducer(undefined, { type: '@@INIT' });
      expect(state.newPosts).toEqual([]);
      expect(state.scrollPosition).toBe(0);
    });
  });

  describe('addNewPost', () => {
    it('prepends a post to newPosts', () => {
      const state = reducer(undefined, addNewPost(mockPost(1)));
      expect(state.newPosts).toHaveLength(1);
      expect(state.newPosts[0].id).toBe(1);
    });

    it('prepends to the top when multiple posts are added', () => {
      let state = reducer(undefined, addNewPost(mockPost(1)));
      state = reducer(state, addNewPost(mockPost(2)));
      expect(state.newPosts[0].id).toBe(2);
      expect(state.newPosts[1].id).toBe(1);
    });
  });

  describe('setScrollPosition', () => {
    it('saves the scroll position', () => {
      const state = reducer(undefined, setScrollPosition(450));
      expect(state.scrollPosition).toBe(450);
    });

    it('overwrites the previous scroll position', () => {
      let state = reducer(undefined, setScrollPosition(100));
      state = reducer(state, setScrollPosition(800));
      expect(state.scrollPosition).toBe(800);
    });
  });

  describe('clearNewPosts', () => {
    it('clears all new posts', () => {
      let state = reducer(undefined, addNewPost(mockPost(1)));
      state = reducer(state, addNewPost(mockPost(2)));
      state = reducer(state, clearNewPosts());
      expect(state.newPosts).toEqual([]);
    });

    it('does not affect scrollPosition', () => {
      let state = reducer(undefined, setScrollPosition(300));
      state = reducer(state, addNewPost(mockPost(1)));
      state = reducer(state, clearNewPosts());
      expect(state.scrollPosition).toBe(300);
    });
  });
});
