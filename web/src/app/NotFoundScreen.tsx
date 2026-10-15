import { ButtonLink } from '../shared/components/atoms/ButtonLink'
import { EmptyState } from '../shared/components/molecules/EmptyState'
import { ROUTES } from '../shared/navigation/routes'

export function NotFoundScreen() {
  return (
    <div className="page-container pt-8 pb-16">
      <title>Página no encontrada · MiniShop</title>
      <EmptyState
        variant="notFound"
        headingLevel="h1"
        title="Página no encontrada"
        message="La dirección no existe o cambió."
        action={<ButtonLink to={ROUTES.catalog} label="Volver al catálogo" size="lg" />}
      />
    </div>
  )
}
