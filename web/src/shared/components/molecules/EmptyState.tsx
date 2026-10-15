import type { ReactNode, Ref } from 'react'
import { PackageX, SearchX, ShoppingCart, type LucideIcon } from 'lucide-react'

export type EmptyStateVariant = 'cart' | 'search' | 'notFound'

export interface EmptyStateProps {
  variant: EmptyStateVariant
  title: string
  message: string
  /** A Button or ButtonLink: the screen decides whether the action navigates. */
  action?: ReactNode
  /** Heading level: h1 when the state is the whole page (404, empty cart). */
  headingLevel?: 'h1' | 'h2'
  /** Makes the heading focusable from code (tabIndex -1), e.g. after removing the last cart item. */
  headingRef?: Ref<HTMLHeadingElement>
  className?: string
}

interface VariantStyle {
  icon: LucideIcon
  iconSize: number
  circleClass: string
  titleClass: string
}

const STATE_TITLE_CLASS = 'text-[18px] leading-6 font-semibold'

/** Same variants as mobile (D37): the empty cart is larger than the other two. */
const VARIANT_STYLE: Record<EmptyStateVariant, VariantStyle> = {
  cart: {
    icon: ShoppingCart,
    iconSize: 44,
    circleClass: 'size-24 mb-2 bg-secondary text-price',
    titleClass: 'text-title',
  },
  search: {
    icon: SearchX,
    iconSize: 34,
    circleClass: 'size-[72px] mb-1 bg-primary-soft text-primary',
    titleClass: STATE_TITLE_CLASS,
  },
  notFound: {
    icon: PackageX,
    iconSize: 34,
    circleClass: 'size-[72px] mb-1 bg-primary-soft text-primary',
    titleClass: STATE_TITLE_CLASS,
  },
}

export function EmptyState({
  variant,
  title,
  message,
  action,
  headingLevel = 'h2',
  headingRef,
  className = '',
}: EmptyStateProps) {
  const style = VARIANT_STYLE[variant]
  const Icon = style.icon
  const Heading = headingLevel

  return (
    <div className={`flex flex-col items-center gap-3 px-8 py-12 text-center ${className}`}>
      <span className={`flex items-center justify-center rounded-full ${style.circleClass}`}>
        <Icon size={style.iconSize} aria-hidden="true" strokeWidth={1.8} />
      </span>
      <Heading
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className={`outline-none ${style.titleClass}`}
      >
        {title}
      </Heading>
      <p className="text-body text-text-muted">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
