import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../store/AuthContext';
import Message from '../components/Message';
import GlassSurface from '../components/glass/GlassSurface';
import GlassButton from '../components/glass/GlassButton';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    try { await register(name, email, password); navigate('/'); } catch (err: any) { setError(err.response?.data?.message || err.message); }
  };

  return (
    <Row className="justify-content-md-center auth-page">
      <Col xs={12} lg={10}>
        <Row className="g-3 auth-split-row">
          <Col md={5}>
            <GlassSurface className="auth-brand-card interactive-lift h-100">
              <p className="auth-eyebrow mb-2">Get Started</p>
              <h2 className="auth-brand-title">Create, customize, and track every build.</h2>
              <p className="text-muted mb-3">
                Your account unlocks personalized kits, faster checkout, and a complete activity history.
              </p>
              <ul className="auth-benefits mb-0">
                <li>Save your preferred kit module combinations</li>
                <li>Track order, payment, and delivery status</li>
                <li>Post reviews and learn from the community</li>
              </ul>
            </GlassSurface>
          </Col>
          <Col md={7}>
            <GlassSurface className="auth-card interactive-lift">
              <div className="auth-header">
                <h2>Create Account</h2>
                <p className="text-muted mb-0">Join BitForge and start customizing DIY kits.</p>
              </div>
              {error && <Message variant="danger">{error}</Message>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Confirm Password</Form.Label><Form.Control type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></Form.Group>
                <GlassButton type="submit" variant="primary" className="w-100">Create Account</GlassButton>
              </Form>
              <Row className="pt-3"><Col>Have an account? <Link to="/login">Login</Link></Col></Row>
            </GlassSurface>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
