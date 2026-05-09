import { ReactNode } from 'react';

export default function GlassSurface({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass-surface ${className}`.trim()}>{children}</div>;
}

