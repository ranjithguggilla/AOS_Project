import { Card, CardProps } from 'react-bootstrap';

export default function GlassCard({ className = '', ...props }: CardProps) {
  return <Card {...props} className={`glass-card ${className}`.trim()} />;
}

