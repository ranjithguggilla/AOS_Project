import { useCallback, useEffect, useState } from 'react';
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
  const [msg, setMsg] = useState<{ variant?: string; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const loadOrders = useCallback(() => {
    if (!userInfo?.token) return Promise.resolve();
    return axios
      .get<Order[]>('/api/orders', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]));
  }, [userInfo?.token]);

  useEffect(() => {
    if (!userInfo?.isAdmin || !userInfo?.token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [userInfo?.isAdmin, userInfo?.token, loadOrders]);

  const handleDeletePending = async (order: Order) => {
    if (order.isPaid) return;
    const ok = window.confirm(
      `Delete unpaid order #${order._id.slice(-8)} ($${order.totalPrice.toFixed(2)})?\n` +
        'Inventory will be restored. This cannot be undone.'
    );
    if (!ok) return;
    setMsg(null);
    setDeletingId(order._id);
    try {
      await axios.delete(`/api/orders/${order._id}`, {
        headers: { Authorization: `Bearer ${userInfo!.token}` },
      });
      setMsg({ variant: 'success', text: 'Order deleted and stock restored.' });
      await loadOrders();
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } }; message?: string };
      setMsg({
        variant: 'danger',
        text: ax.response?.data?.message || ax.message || 'Could not delete order.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!userInfo?.isAdmin) return <Message variant="danger">Access Denied</Message>;
  if (loading) return <Loader />;

  return (
    <>
      <h2>Orders</h2>
      <p className="text-muted small mb-3">
        Unpaid orders can be removed here; product quantities are returned to stock.
      </p>
      {msg && <Message variant={msg.variant === 'success' ? 'success' : 'danger'}>{msg.text}</Message>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>USER</th>
            <th>DATE</th>
            <th>TOTAL</th>
            <th>PAID</th>
            <th>DELIVERED</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id.slice(-8)}</td>
              <td>{o.userName || o.userEmail || o.user?.slice(-8) || '-'}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>${o.totalPrice.toFixed(2)}</td>
              <td>
                {o.isPaid ? (
                  <span className="text-success">{new Date(o.paidAt!).toLocaleDateString()}</span>
                ) : (
                  <span className="text-danger">NO</span>
                )}
              </td>
              <td>
                {o.isDelivered ? (
                  <span className="text-success">{new Date(o.deliveredAt!).toLocaleDateString()}</span>
                ) : (
                  <span className="text-danger">NO</span>
                )}
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <Link to={`/order/${o._id}`} className="btn btn-sm btn-light">
                    Details
                  </Link>
                  {!o.isPaid && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={deletingId === o._id}
                      onClick={() => handleDeletePending(o)}
                    >
                      {deletingId === o._id ? '…' : 'Delete'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
