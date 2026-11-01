import React from 'react';
import { Box, Button, Dropdown, Input, Text } from '@wix/design-system';
import { searchProducts, type ProductOption } from '../products-api';
import { useDashboardI18n } from '../LanguageContext';

/** Search the store's catalog (V1 or V3) and pick one product. */
export const ProductPicker = ({
  value,
  onChange,
}: {
  value: ProductOption | null;
  onChange: (product: ProductOption | null) => void;
}) => {
  const { t } = useDashboardI18n();
  const [term, setTerm] = React.useState('');
  const [options, setOptions] = React.useState<ProductOption[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');
  const requestId = React.useRef(0);

  React.useEffect(() => {
    const currentRequestId = ++requestId.current;
    let cancelled = false;
    setStatus('loading');
    setOptions([]);
    setNextCursor(null);
    const timer = window.setTimeout(() => {
      searchProducts(term)
        .then(({ products, nextCursor: cursor }) => {
          if (cancelled || currentRequestId !== requestId.current) return;
          setOptions(products);
          setNextCursor(cursor);
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

  const loadMore = () => {
    if (!nextCursor || status === 'loading') return;
    const currentRequestId = requestId.current;
    setStatus('loading');
    searchProducts(term, nextCursor)
      .then(({ products, nextCursor: cursor }) => {
        if (currentRequestId !== requestId.current) return;
        setOptions((current) => {
          const ids = new Set(current.map((product) => product.id));
          return [...current, ...products.filter((product) => !ids.has(product.id))];
        });
        setNextCursor(cursor);
        setStatus('idle');
      })
      .catch((error: unknown) => {
        if (currentRequestId !== requestId.current) return;
        console.error('Loading more products failed', error);
        setStatus('error');
      });
  };

  const displayOptions = [
    ...(value && !options.some((o) => o.id === value.id) ? [value] : []),
    ...options,
  ];

  return (
    <Box direction="vertical" gap="SP2">
      <Input
        placeholder={t('productRules.searchPlaceholder')}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        status={status === 'loading' ? 'loading' : undefined}
        ariaLabel={t('productRules.searchPlaceholder')}
      />
      <Dropdown
        placeholder={options.length ? t('productRules.chooseProduct') : t('productRules.noProductsFound')}
        selectedId={value?.id}
        options={displayOptions.map((o) => ({ id: o.id, value: o.name }))}
        onSelect={(option) => {
          const picked = displayOptions.find((o) => o.id === option.id);
          onChange(picked ?? null);
        }}
      />
      {nextCursor && (
        <Button priority="secondary" onClick={loadMore} disabled={status === 'loading'}>
          {t('productRules.searchProduct')}
        </Button>
      )}
      {status === 'error' && (
        <Text size="tiny" skin="error">{t('productRules.errorTitle')}</Text>
      )}
    </Box>
  );
};
