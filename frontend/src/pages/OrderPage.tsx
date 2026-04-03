import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../store/AuthContext';
import Loader from '../components/Loader';
import Message from '../components/Message';

interface OrderData {
  _id: string; user: string; userName: string; userEmail: string;
  orderItems: { name: string; qty: number; image: string; price: number; product: string }[];
  shippingAddress: { address: string; city: string; postalCode: string; country: string };
  paymentMethod: string; taxPrice: number; shippingPrice: number; totalPrice: number;
  isPaid: boolean; paidAt?: string; isDelivered: boolean; deliveredAt?: string;
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { userInfo } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const headers = userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {};

  const fetchOrder = () => axios.get(`/api/orders/${id}`, { headers }).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchOrder(); }, [id]);

  const handlePay = async () => {
    try {
      await axios.post('/api/payments/process', { orderId: id }, { headers });
      fetchOrder();
      setMsg('Payment successful!');
    } catch (e: any) { setMsg(e.response?.data?.message || e.message); }
  };

  const handleDeliver = async () => {
    try {
      await axios.put(`/api/orders/${id}/deliver`, {}, { headers });
      fetchOrder();
    } catch (e: any) { setMsg(e.response?.data?.message || e.message); }
  };

  if (loading) return <Loader />;
  if (!order) return <Message variant="danger">Order not found</Message>;

  const itemsPrice = order.orderItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <h2>Order {order._id.slice(-8)}</h2>
      {msg && <Message>{msg}</Message>}
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h4>Shipping</h4>
              <p><strong>Name:</strong> {order.userName}</p>
              <p><strong>Email:</strong> {order.userEmail}</p>
              <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              {order.isDelivered ? <Message variant="success">Delivered on {new Date(order.deliveredAt!).toLocaleDateString()}</Message> : <Message variant="warning">Not Delivered Yet</Message>}
            </ListGroup.Item>
            <ListGroup.Item>
              <h4>Payment Method</h4>
              <p><strong>Method:</strong> {order.paymentMethod}</p>
              {order.isPaid ? <Message variant="success">Paid at {new Date(order.paidAt!).toLocaleString()}</Message> : <Message variant="danger">Not Paid</Message>}
            </ListGroup.Item>
            <ListGroup.Item>
              <h4>Order Items</h4>
              <ListGroup variant="flush">
                {order.orderItems.map((item, i) => (
                  <ListGroup.Item key={i}>
                    <Row className="align-items-center">
                      <Col md={2}><Image src={item.image} fluid rounded /></Col>
                      <Col>{item.name}</Col>
                      <Col md={4}>{item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item><h4>Order Summary</h4></ListGroup.Item>
              <ListGroup.Item>Items: ${itemsPrice.toFixed(2)}</ListGroup.Item>
              <ListGroup.Item>Shipping: ${order.shippingPrice.toFixed(2)}</ListGroup.Item>
              <ListGroup.Item>Tax: ${order.taxPrice.toFixed(2)}</ListGroup.Item>
              <ListGroup.Item><strong>Total: ${order.totalPrice.toFixed(2)}</strong></ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item><Button className="w-100" onClick={handlePay}>Pay Now</Button></ListGroup.Item>
              )}
              {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item><Button className="w-100" variant="success" onClick={handleDeliver}>Mark as Delivered</Button></ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
}
