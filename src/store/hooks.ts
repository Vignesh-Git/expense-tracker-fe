import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed version of useDispatch hook
 * Provides proper TypeScript support for dispatch actions
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Provides proper TypeScript support for state selection
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 