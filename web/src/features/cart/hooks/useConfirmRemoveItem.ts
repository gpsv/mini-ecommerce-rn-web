import { useCallback, useState } from 'react'
import type { CartItem } from '@core/cart/cart.schema'
import { removeItem } from '@core/cart/cartSlice'
import { useAppDispatch } from '@core/store/hooks'

/**
 * Removing is always explicit and confirmed (D08). Web version of the mobile
 * hook (D15): instead of Alert.alert it holds the item for ConfirmDialog.
 */
export function useConfirmRemoveItem() {
  const dispatch = useAppDispatch()
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null)

  const requestRemove = useCallback((item: CartItem) => setPendingItem(item), [])
  const cancelRemove = useCallback(() => setPendingItem(null), [])
  const confirmRemove = useCallback(() => {
    if (pendingItem) {
      dispatch(removeItem(pendingItem.id))
    }
    setPendingItem(null)
  }, [dispatch, pendingItem])

  return { pendingItem, requestRemove, cancelRemove, confirmRemove }
}
