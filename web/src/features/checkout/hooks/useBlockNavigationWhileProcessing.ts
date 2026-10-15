import { useEffect } from 'react'
import { useBlocker } from 'react-router'

/**
 * Web counterpart of mobile's useBlockBackWhileBusy (D39): while the order is
 * being confirmed, in-app navigation (links, back/forward) is ignored and
 * closing or reloading the tab asks for confirmation. Only 'processing' blocks,
 * so the navigation to the confirmation that follows is never stopped.
 */
export function useBlockNavigationWhileProcessing(isProcessing: boolean) {
  const blocker = useBlocker(isProcessing)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  useEffect(() => {
    if (!isProcessing) {
      return undefined
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isProcessing])
}
