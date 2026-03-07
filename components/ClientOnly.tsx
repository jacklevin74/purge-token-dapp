'use client';

import { useEffect, useState, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only on the client side after hydration.
 * Use to wrap components that depend on browser APIs or wallet context.
 */
export function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
