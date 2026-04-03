import { Button, ButtonProps } from 'react-bootstrap';

export default function GlassButton({ className = '', ...props }: ButtonProps) {
  return <Button {...props} className={`glass-button ${className}`.trim()} />;
}

