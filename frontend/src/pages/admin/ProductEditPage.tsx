import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('robotics');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  useEffect(() => {
    if (isNew) return;
    axios.get(`/api/products/${id}`).then(r => {
      const p = r.data;
      setName(p.name); setPrice(p.price); setCountInStock(p.countInStock);
      setDescription(p.description); setImage(p.image); setCategory(p.category); setDifficulty(p.difficulty);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name, price, countInStock, description, image, category, difficulty, slug: name.toLowerCase().replace(/\s+/g, '-') };
    try {
      if (isNew) await axios.post('/api/products', body, { headers });
      else await axios.put(`/api/products/${id}`, body, { headers });
      navigate('/admin/products');
    } catch (err: any) { setError(err.response?.data?.message || err.message); }
  };

  if (!userInfo?.isAdmin) return <Message variant="danger">Access Denied</Message>;
  if (loading) return <Loader />;

  return (
    <>
      <h2>{isNew ? 'Add Product' : 'Edit Product'}</h2>
      {error && <Message variant="danger">{error}</Message>}
      <Form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <Form.Group className="mb-2"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} required /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Price</Form.Label><Form.Control type="number" step="0.01" value={price} onChange={e => setPrice(+e.target.value)} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Count In Stock</Form.Label><Form.Control type="number" value={countInStock} onChange={e => setCountInStock(+e.target.value)} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></Form.Group>
        <Form.Group className="mb-2"><Form.Label>Image URL</Form.Label><Form.Control value={image} onChange={e => setImage(e.target.value)} /></Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Category</Form.Label>
          <Form.Select value={category} onChange={e => setCategory(e.target.value)}>
            {['robotics','eco','audio','crafts','sensor'].map(c => <option key={c} value={c}>{c}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Difficulty</Form.Label>
          <Form.Select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {['Beginner','Intermediate','Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
          </Form.Select>
        </Form.Group>
        <Button type="submit" variant="dark">{isNew ? 'CREATE' : 'UPDATE'}</Button>
      </Form>
    </>
  );
}
