import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../store/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

interface Order { _id: string; createdAt: string; totalPrice: number; isPaid: boolean; paidAt?: string; isDelivered: boolean; deliveredAt?: string; }

export default function ProfilePage() {
  const { userInfo } = useAuth();
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {};

  useEffect(() => {
    if (!userInfo) return;
    axios.get('/api/orders/myorders', { headers }).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [userInfo]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', { name, email, ...(password ? { password } : {}) }, { headers });
      setMsg('Profile updated');
    } catch (err: any) { setMsg(err.response?.data?.message || err.message); }
  };

  if (!userInfo) return <Message>Please <a href="/login">sign in</a></Message>;

  return (
    <Row>
      <Col md={3}>
        <h3>User Profile</h3>
        {msg && <Message>{msg}</Message>}
        <p className="small mb-3">
          <Link to="/settings">Settings</Link>
          <span className="text-muted"> — display and appearance</span>
        </p>
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-2"><Form.Label>Name</Form.Label><Form.Control value={name} onChange={e => setName(e.target.value)} /></Form.Group>
          <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} /></Form.Group>
          <Form.Group className="mb-2"><Form.Label>New Password</Form.Label><Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep" /></Form.Group>
          <Button type="submit">Update</Button>
        </Form>
      </Col>
      <Col md={9}>
        <h3>My Orders</h3>
        {loading ? <Loader /> : orders.length === 0 ? <Message>No orders</Message> : (
          <Table striped bordered hover responsive size="sm">
            <thead><tr><th>ID</th><th>DATE</th><th>TOTAL</th><th>PAID</th><th>DELIVERED</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td>{o._id.slice(-8)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${o.totalPrice.toFixed(2)}</td>
                  <td>{o.isPaid ? <span className="text-success">{new Date(o.paidAt!).toLocaleDateString()}</span> : <span className="text-danger">NO</span>}</td>
                  <td>{o.isDelivered ? <span className="text-success">{new Date(o.deliveredAt!).toLocaleDateString()}</span> : <span className="text-danger">NO</span>}</td>
                  <td><Link to={`/order/${o._id}`}><Button size="sm" variant="light">Details</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
}
