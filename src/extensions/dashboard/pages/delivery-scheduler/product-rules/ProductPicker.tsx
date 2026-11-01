import React from 'react';
import { Box, Dropdown, Input, Text } from '@wix/design-system';
import { searchProducts, type ProductOption } from '../products-api';

/** Search the store's catalog (V1 or V3) and pick one product. */
export const ProductPicker = ({
  value,
  onChange,
}: {
  value: ProductOption | null;
  onChange: (product: ProductOption | null) => void;
}) => {
  const [term, setTerm] = React.useState('');
  const [options, setOptions] = React.useState<ProductOption[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');

  React.useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const timer = window.setTimeout(() => {
      searchProducts(term)
        .then((found) => {
          if (cancelled) return;
          setOptions(found);
          setStatus('idle');
        })
        .catch((error: unknown) => {
          console.error('Product search failed', error);
          if (!cancelled) setStatus('error');
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term]);

  return (
    <Box direction="vertical" gap="SP2">
      <Input
        placeholder="Search products by name"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        status={status === 'loading' ? 'loading' : undefined}
        ariaLabel="Search products"
      />
      <Dropdown
        placeholder={options.length ? 'Choose a product' : 'No products found'}
        selectedId={value?.id}
        options={[
          ...(value && !options.some((o) => o.id === value.id) ? [value] : []),
          ...options,
        ].map((o) => ({ id: o.id, value: o.name }))}
        onSelect={(option) => {
          const picked = [...options, ...(value ? [value] : [])].find((o) => o.id === option.id);
          onChange(picked ?? null);
        }}
      />
      {status === 'error' && (
        <Text size="tiny" skin="error">Couldn't load products. Check that Wix Stores is installed.</Text>
      )}
    </Box>
  );
};
