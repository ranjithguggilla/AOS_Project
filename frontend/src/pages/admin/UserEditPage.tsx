import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  useEffect(() => {
    axios.get(`/api/users/${id}`, { headers }).then(r => {
      setName(r.data.name); setEmail(r.data.email); setIsAdmin(r.data.isAdmin);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${id}`, { name, email, isAdmin }, { headers });
      navigate('/admin/users');
    } catch (err: any) { setError(err.response?.data?.message || err.message); }
  };

  if (!userInfo?.isAdmin) return <Message variant="danger">Access Denied</Message>;
  if (loading) return <Loader />;

  return (
    <>
      <h2>Edit User</h2>
      {error && <Message variant="danger">{error}</Message>}
      <Form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} /></Form.Group>
        <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} /></Form.Group>
        <Form.Check type="checkbox" label="isAdmin" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} className="mb-3" />
        <Button type="submit" variant="dark">UPDATE</Button>
      </Form>
    </>
  );
}
