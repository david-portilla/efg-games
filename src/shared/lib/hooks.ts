import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/** Typed `useDispatch` — provides full type inference on dispatched actions. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Typed `useSelector` — avoids manual `RootState` annotations on selectors. */
export const useAppSelector = useSelector.withTypes<RootState>();
