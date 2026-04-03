import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

interface Order {
  _id: string;
  userName?: string;
  userEmail?: string;
  user: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
}

export default function OrderListPage() {
  const { userInfo } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  useEffect(() => {
    axios.get('/api/orders', { headers }).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!userInfo?.isAdmin) return <Message variant="danger">Access Denied</Message>;
  if (loading) return <Loader />;

  return (
    <>
      <h2>Orders</h2>
      <Table striped bordered hover responsive>
        <thead><tr><th>ID</th><th>USER</th><th>DATE</th><th>TOTAL</th><th>PAID</th><th>DELIVERED</th><th></th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id.slice(-8)}</td>
              <td>{o.userName || o.userEmail || o.user?.slice(-8) || '-'}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>${o.totalPrice.toFixed(2)}</td>
              <td>{o.isPaid ? <span className="text-success">{new Date(o.paidAt!).toLocaleDateString()}</span> : <span className="text-danger">NO</span>}</td>
              <td>{o.isDelivered ? <span className="text-success">{new Date(o.deliveredAt!).toLocaleDateString()}</span> : <span className="text-danger">NO</span>}</td>
              <td><Link to={`/order/${o._id}`}><Button size="sm" variant="light">Details</Button></Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
