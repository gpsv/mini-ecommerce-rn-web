import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@core/store/createAppStore';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
