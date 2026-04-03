import { Alert } from 'react-bootstrap';
import { ReactNode } from 'react';

export default function Message({ variant = 'info', children }: { variant?: string; children: ReactNode }) {
  return <Alert variant={variant}>{children}</Alert>;
}
