import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Button, Card, Badge, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../store/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
  product: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  taxPrice: number;
  shippingPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  orderItems: OrderItem[];
}

function formatPaymentMethod(method: string) {
  const m = method || '';
  if (m === 'paypal') return 'PayPal';
  if (m === 'stripe_sandbox') return 'Card (test / Stripe sandbox)';
  return m.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function orderStatusBadge(order: Order): { bg: string; label: string; detail: string } {
  if (order.isDelivered) {
    return order.deliveredAt
      ? {
          bg: 'success',
          label: 'Delivered',
          detail: `Delivered ${new Date(order.deliveredAt).toLocaleString()}`,
        }
      : { bg: 'success', label: 'Delivered', detail: 'Completed' };
  }
  if (order.isPaid) {
    return order.paidAt
      ? {
          bg: 'info',
          label: 'Paid',
          detail: `Paid ${new Date(order.paidAt).toLocaleString()} · preparing shipment`,
        }
      : { bg: 'info', label: 'Paid', detail: 'Preparing shipment' };
  }
  return {
    bg: 'warning',
    label: 'Awaiting payment',
    detail: 'Complete checkout payment on the order page',
  };
}

function itemsSubtotal(order: Order) {
  return order.orderItems.reduce((s, i) => s + i.price * i.qty, 0);
}

export default function ProfilePage() {
  const { userInfo } = useAuth();
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const headers = userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {};

  useEffect(() => {
    setName(userInfo?.name || '');
    setEmail(userInfo?.email || '');
  }, [userInfo?.name, userInfo?.email]);

  useEffect(() => {
    if (!userInfo?.token) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    setOrdersError('');
    axios
      .get<Order[]>('/api/orders/myorders', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch((e: { response?: { data?: { message?: string } }; message?: string }) => {
        setOrders([]);
        setOrdersError(e.response?.data?.message || e.message || 'Could not load orders.');
      })
      .finally(() => setOrdersLoading(false));
  }, [userInfo?.token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/users/profile', { name, email, ...(password ? { password } : {}) }, { headers });
      setMsg('Profile updated');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setMsg(ax.response?.data?.message || ax.message || 'Update failed');
    }
  };

  if (!userInfo) {
    return (
      <Message>
        Please <a href="/login">sign in</a> to view your account and orders.
      </Message>
    );
  }

  return (
    <Row className="g-4">
      <Col lg={4}>
        <h2 className="h4 mb-3">Account</h2>
        {msg && <Message>{msg}</Message>}
        <p className="small mb-3">
          <Link to="/profile#your-orders">Your orders</Link>
          <span className="text-muted"> — status and purchase history</span>
        </p>
        <p className="small mb-3">
          <Link to="/settings">Settings</Link>
          <span className="text-muted"> — display and appearance</span>
        </p>
        <h3 className="h5">Profile</h3>
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>New password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </Form.Group>
          <Button type="submit">Update profile</Button>
        </Form>
      </Col>

      <Col lg={8}>
        <section id="your-orders" className="profile-orders-section" style={{ scrollMarginTop: '88px' }}>
          <h2 className="h4 mb-1">Your orders</h2>
          <p className="text-muted small mb-4">
            Purchase history, fulfillment status, and shipping details. Select an order for full detail, payment,
            and tracking.
          </p>
          {ordersError && <Message variant="danger">{ordersError}</Message>}
          {ordersLoading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <Card className="shadow-sm border-0" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <Card.Body className="text-muted">You have not placed any orders yet. </Card.Body>
              <Card.Footer className="bg-transparent border-0 pt-0">
                <Link to="/shop" className="btn btn-primary btn-sm">
                  Browse shop
                </Link>
              </Card.Footer>
            </Card>
          ) : (
            <ListGroup variant="flush" className="d-flex flex-column gap-3">
              {orders.map((order) => {
                const status = orderStatusBadge(order);
                const subtotal = itemsSubtotal(order);
                const placed = new Date(order.createdAt);
                return (
                  <ListGroup.Item key={order._id} as="div" className="p-0 border-0">
                    <Card className="shadow-sm border-0 h-100" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                      <Card.Header className="bg-light bg-opacity-50 d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
                        <div>
                          <span className="fw-semibold me-2">Order #{order._id.slice(-8)}</span>
                          <span className="text-muted small">{placed.toLocaleString()}</span>
                        </div>
                        <Badge bg={status.bg}>{status.label}</Badge>
                      </Card.Header>
                      <Card.Body className="py-3">
                        <p className="small text-muted mb-2">{status.detail}</p>
                        <div className="mb-3">
                          <div className="small fw-semibold text-uppercase text-muted mb-1">Items purchased</div>
                          <ul className="small mb-0 ps-3">
                            {order.orderItems.map((item, idx) => (
                              <li key={`${order._id}-${idx}-${item.product}`}>
                                {item.name}{' '}
                                <span className="text-muted">
                                  ×{item.qty} @ ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Row className="g-3 small">
                          <Col sm={6}>
                            <div className="fw-semibold text-muted text-uppercase mb-1">Ship to</div>
                            <div>
                              {order.shippingAddress?.address}
                              <br />
                              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                              <br />
                              {order.shippingAddress?.country}
                            </div>
                          </Col>
                          <Col sm={6}>
                            <div className="fw-semibold text-muted text-uppercase mb-1">Payment</div>
                            <div>{formatPaymentMethod(order.paymentMethod)}</div>
                          </Col>
                        </Row>
                        <hr className="my-3" />
                        <div className="d-flex flex-wrap justify-content-between gap-2 small">
                          <span>
                            Merchandise <span className="text-muted">(incl. configured kits)</span>
                          </span>
                          <span className="fw-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex flex-wrap justify-content-between gap-2 small">
                          <span>Shipping</span>
                          <span>${order.shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="d-flex flex-wrap justify-content-between gap-2 small">
                          <span>Tax</span>
                          <span>${order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="d-flex flex-wrap justify-content-between gap-2 mt-2 fw-semibold">
                          <span>Total paid / due</span>
                          <span>${order.totalPrice.toFixed(2)}</span>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-transparent border-0 pt-0 pb-3 d-flex flex-wrap gap-2">
                        <Link to={`/order/${order._id}`} className="btn btn-primary btn-sm">
                          {order.isPaid ? 'Order details' : 'View order & pay'}
                        </Link>
                      </Card.Footer>
                    </Card>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </section>
      </Col>
    </Row>
  );
}
