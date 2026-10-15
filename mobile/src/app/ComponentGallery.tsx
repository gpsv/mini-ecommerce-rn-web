import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ArrowLeft, Trash } from 'lucide-react-native';
import { CATEGORY_LABELS } from '@core/catalog/categoryLabels';
import { AppText } from '../shared/components/atoms/AppText';
import { Badge } from '../shared/components/atoms/Badge';
import { Button, type ButtonVariant } from '../shared/components/atoms/Button';
import { IconButton } from '../shared/components/atoms/IconButton';
import { Price } from '../shared/components/atoms/Price';
import { ProductImage } from '../shared/components/atoms/ProductImage';
import { Spinner } from '../shared/components/atoms/Spinner';
import { TextField } from '../shared/components/atoms/TextField';
import { CategoryChips } from '../shared/components/molecules/CategoryChips';
import { EmptyState } from '../shared/components/molecules/EmptyState';
import { ErrorState } from '../shared/components/molecules/ErrorState';
import { ProductCardSkeleton } from '../shared/components/molecules/ProductCardSkeleton';
import { QuantityStepper } from '../shared/components/molecules/QuantityStepper';
import { SearchBar } from '../shared/components/molecules/SearchBar';

// Temporary (P06): visual check against design/screens/hoja-de-componentes.png.
// Delete it once the real screens exist.

const SAMPLE_IMAGE_URI = 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg';
const BROKEN_IMAGE_URI = 'https://fakestoreapi.com/img/does-not-exist.jpg';
const BUTTON_VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface GallerySectionProps {
  title: string;
  children: ReactNode;
}

function GallerySection({ title, children }: GallerySectionProps) {
  return (
    <View className="bg-surface rounded-lg p-4 gap-3">
      <AppText variant="subtitle" className="text-primary">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-3">{children}</View>;
}

export function ComponentGallery() {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-gutter gap-4"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}
    >
      <AppText variant="title">Hoja de componentes</AppText>

      <GallerySection title="Button · variantes (md)">
        {BUTTON_VARIANTS.map(variant => (
          <Row key={variant}>
            <Button label="Confirmar" variant={variant} />
            <Button label="Confirmar" variant={variant} disabled />
            <Button label="Procesando…" variant={variant} isLoading />
          </Row>
        ))}
      </GallerySection>

      <GallerySection title="Button · tamaños y éxito">
        <Row>
          <Button label="Agregar" size="sm" icon={Plus} />
          <Button label="Reintentar" size="md" />
          <Button label="Agregar al carrito" size="lg" />
        </Row>
        <Row>
          <Button
            label={isAdded ? 'Agregado' : 'Agregar al carrito'}
            size="lg"
            isSuccess={isAdded}
            onPress={() => setIsAdded(current => !current)}
          />
          <Button label="Ver detalle" size="sm" variant="secondary" />
        </Row>
      </GallerySection>

      <GallerySection title="AppText">
        <AppText variant="title">Tu carrito está vacío</AppText>
        <AppText variant="subtitle">Resumen del pedido</AppText>
        <AppText>Explora el catálogo y agrega lo que te guste.</AppText>
        <AppText variant="caption">20 productos</AppText>
      </GallerySection>

      <GallerySection title="Price">
        <Price cents={795} size="sm" />
        <Price cents={10995} size="md" />
        <Price cents={69500} size="lg" />
        <Price cents={99999} size="xl" />
        <Price cents={39020} tone="total" />
      </GallerySection>

      <GallerySection title="Badge">
        <Row>
          {CATEGORY_OPTIONS.map(option => (
            <Badge key={option.value} variant="category" label={option.label} />
          ))}
        </Row>
        <Row>
          <Badge variant="count" count={5} />
          <Badge variant="count" count={12} />
          <Badge variant="count" count={0} />
          <Badge variant="success" label="Agregado" />
        </Row>
      </GallerySection>

      <GallerySection title="IconButton">
        <Row>
          <View className="bg-primary rounded-md p-1">
            <IconButton icon={ArrowLeft} accessibilityLabel="Regresar" variant="onPrimary" />
          </View>
          <IconButton icon={Trash} accessibilityLabel="Eliminar" iconSize={20} />
          <IconButton icon={Trash} accessibilityLabel="Eliminar" variant="danger" iconSize={20} />
          <IconButton icon={Trash} accessibilityLabel="Eliminar" iconSize={20} disabled />
        </Row>
      </GallerySection>

      <GallerySection title="Spinner">
        <Row>
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={24} />
          <Spinner size={32} />
          <View className="size-11 rounded-md bg-primary items-center justify-center">
            <Spinner size={20} tone="onPrimary" />
          </View>
        </Row>
      </GallerySection>

      <GallerySection title="ProductImage">
        <Row>
          <ProductImage
            uri={SAMPLE_IMAGE_URI}
            accessibilityLabel="Mochila"
            className="w-[158px] h-[132px] rounded-md border border-border"
          />
          <ProductImage
            uri={BROKEN_IMAGE_URI}
            accessibilityLabel="Producto sin imagen"
            className="w-[158px] h-[132px] rounded-md border border-border"
          />
          <ProductImage
            uri={SAMPLE_IMAGE_URI}
            accessibilityLabel="Mochila"
            variant="thumb"
            className="size-[72px] rounded-md border border-border"
          />
        </Row>
      </GallerySection>

      <GallerySection title="TextField">
        <TextField label="Nombre" defaultValue="María López" />
        <TextField label="Teléfono" placeholder="10 dígitos" hint="Solo números" keyboardType="phone-pad" />
        <TextField label="Correo" defaultValue="maria.lopez@correo" error="Ingresa un correo válido" />
        <TextField label="Deshabilitado" defaultValue="No editable" disabled />
      </GallerySection>

      <GallerySection title="QuantityStepper">
        <Row>
          <QuantityStepper
            quantity={quantity}
            onIncrease={() => setQuantity(current => current + 1)}
            onDecrease={() => setQuantity(current => current - 1)}
            onRemoveRequest={() => setQuantity(1)}
          />
          <AppText variant="caption">carrito (interactivo)</AppText>
        </Row>
        <Row>
          <QuantityStepper quantity={1} onIncrease={() => {}} onDecrease={() => {}} />
          <AppText variant="caption">detalle, − deshabilitado</AppText>
        </Row>
        <Row>
          <QuantityStepper quantity={99} onIncrease={() => {}} onDecrease={() => {}} />
          <AppText variant="caption">máximo, + deshabilitado</AppText>
        </Row>
      </GallerySection>

      <GallerySection title="SearchBar">
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
      </GallerySection>

      <GallerySection title="CategoryChips">
        <View className="-mx-4">
          <CategoryChips
            options={CATEGORY_OPTIONS}
            selectedValue={category}
            onSelect={setCategory}
          />
        </View>
      </GallerySection>

      <GallerySection title="ErrorState">
        <ErrorState onRetry={() => {}} />
      </GallerySection>

      <GallerySection title="EmptyState">
        <EmptyState
          variant="cart"
          title="Tu carrito está vacío"
          message="Explora el catálogo y agrega lo que te guste."
          actionLabel="Ver productos"
          onAction={() => {}}
        />
        <EmptyState
          variant="search"
          title="Sin resultados para “audífonos”"
          message="Prueba con otra palabra o revisa la categoría seleccionada."
          actionLabel="Limpiar búsqueda"
          onAction={() => {}}
        />
      </GallerySection>

      <GallerySection title="ProductCardSkeleton">
        <ProductCardSkeleton className="w-[158px]" />
      </GallerySection>
    </ScrollView>
  );
}
