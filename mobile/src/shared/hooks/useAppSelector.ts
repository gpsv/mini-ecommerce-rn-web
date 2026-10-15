import { useSelector } from 'react-redux';
import type { RootState } from '@core/store/createAppStore';

export const useAppSelector = useSelector.withTypes<RootState>();
