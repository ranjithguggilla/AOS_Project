import { Navbar, NavbarProps } from 'react-bootstrap';

export default function GlassNavBar({ className = '', ...props }: NavbarProps) {
  return <Navbar {...props} className={`glass-nav ${className}`.trim()} />;
}

