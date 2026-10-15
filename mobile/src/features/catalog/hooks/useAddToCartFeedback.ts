import { useCallback, useEffect, useRef, useState } from 'react';

/** 15-Specs: "Agregado ✓" for 1.5 s, snackbar for 3 s. */
export const ADDED_FEEDBACK_MS = 1500;
export const SNACKBAR_DURATION_MS = 3000;

type Timeout = ReturnType<typeof setTimeout>;

function restartTimeout(ref: { current: Timeout | null }, callback: () => void, delayMs: number) {
  if (ref.current) {
    clearTimeout(ref.current);
  }
  ref.current = setTimeout(callback, delayMs);
}

/** Temporary feedback after adding to the cart; another tap restarts both timers. */
export function useAddToCartFeedback() {
  const [isAdded, setIsAdded] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const addedTimeout = useRef<Timeout | null>(null);
  const snackbarTimeout = useRef<Timeout | null>(null);

  useEffect(
    () => () => {
      if (addedTimeout.current) {
        clearTimeout(addedTimeout.current);
      }
      if (snackbarTimeout.current) {
        clearTimeout(snackbarTimeout.current);
      }
    },
    [],
  );

  const showFeedback = useCallback(() => {
    setIsAdded(true);
    setIsSnackbarVisible(true);
    restartTimeout(addedTimeout, () => setIsAdded(false), ADDED_FEEDBACK_MS);
    restartTimeout(snackbarTimeout, () => setIsSnackbarVisible(false), SNACKBAR_DURATION_MS);
  }, []);

  const hideSnackbar = useCallback(() => setIsSnackbarVisible(false), []);

  return { isAdded, isSnackbarVisible, showFeedback, hideSnackbar };
}
