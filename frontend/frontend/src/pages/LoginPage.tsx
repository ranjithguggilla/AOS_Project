import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../store/AuthContext';
import Message from '../components/Message';
import GlassSurface from '../components/glass/GlassSurface';
import GlassButton from '../components/glass/GlassButton';
import logoBlue from '../assets/logo/bitforge-blue-tight.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const isRegistered = params.get('registered') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(email, password); navigate(redirect); } catch (err: any) { setError(err.response?.data?.message || err.message); }
  };

  return (
    <Row className="justify-content-md-center auth-page">
      <Col xs={12} lg={10}>
        <Row className="g-3 auth-split-row">
          <Col md={5}>
            <GlassSurface className="auth-brand-card interactive-lift h-100">
              <img src={logoBlue} alt="BitForge" className="auth-brand-logo mb-2" />
              <p className="auth-eyebrow mb-2">BitForge Marketplace</p>
              <h2 className="auth-brand-title">Build smarter kits with zero friction.</h2>
              <p className="text-muted mb-3">
                Access your saved customizations, order history, and quick reorder workflow.
              </p>
              <ul className="auth-benefits mb-0">
                <li>Live BOM pricing and compatibility checks</li>
                <li>Order + payment tracking in one place</li>
                <li>Fast checkout with saved shipping details</li>
              </ul>
            </GlassSurface>
          </Col>
          <Col md={7}>
            <GlassSurface className="auth-card interactive-lift">
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p className="text-muted mb-0">Sign in to continue building and ordering your kits.</p>
              </div>
              {isRegistered && <Message variant="success">Account created successfully. Please sign in.</Message>}
              {error && <Message variant="danger">{error}</Message>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Password visible. Click to hide password' : 'Password hidden. Click to show password'}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                  </InputGroup>
                </Form.Group>
                <GlassButton type="submit" variant="primary" className="w-100">Sign In</GlassButton>
              </Form>
              <Row className="pt-3">
                <Col>New Customer? <Link to="/register">Register</Link></Col>
              </Row>
            </GlassSurface>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
