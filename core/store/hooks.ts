import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './createAppStore';

/** Typed react-redux hooks, shared by the core/ hooks and both apps. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
