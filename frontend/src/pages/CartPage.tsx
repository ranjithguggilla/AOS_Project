import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import Message from '../components/Message';

export default function CartPage() {
  const { cartItems, removeFromCart, updateCartQty, clearCart, shippingAddress, saveShippingAddress, paymentMethod, savePaymentMethod } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(shippingAddress.address);
  const [city, setCity] = useState(shippingAddress.city);
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode);
  const [country, setCountry] = useState(shippingAddress.country);
  const [method, setMethod] = useState(paymentMethod);
  const [error, setError] = useState('');

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = +(subtotal * 0.15).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const placeOrder = async () => {
    if (!userInfo) { navigate('/login'); return; }
    saveShippingAddress({ address, city, postalCode, country });
    savePaymentMethod(method);
    try {
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems.map(i => ({ name: i.name, qty: i.qty, image: i.image, price: i.price, product: i.productId })),
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: method,
      }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      clearCart();
      navigate(`/order/${data._id}`);
    } catch (e: any) { setError(e.response?.data?.message || e.message); }
  };

  if (cartItems.length === 0) return <Message>Your cart is empty. <a href="/shop">Go Shopping</a></Message>;

  return (
    <Row>
      <Col md={8}>
        <h2>Shopping Cart</h2>
        <ListGroup variant="flush">
          {cartItems.map(item => (
            <ListGroup.Item key={item.productId}>
              <Row className="align-items-center">
                <Col md={2}><Image src={item.image} fluid rounded /></Col>
                <Col md={3}>{item.name}</Col>
                <Col md={2}>${item.price.toFixed(2)}</Col>
                <Col md={2}>
                  <Form.Select value={item.qty} onChange={e => updateCartQty(item.productId, Number(e.target.value))}>
                    {[...Array(10).keys()].map(x => <option key={x+1} value={x+1}>{x+1}</option>)}
                  </Form.Select>
                </Col>
                <Col md={1}><Button variant="light" onClick={() => removeFromCart(item.productId)}><FaTrash /></Button></Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {step >= 2 && (
          <div className="mt-4">
            <h4>Shipping</h4>
            <Form>
              <Form.Group className="mb-2"><Form.Label>Address</Form.Label><Form.Control value={address} onChange={e => setAddress(e.target.value)} /></Form.Group>
              <Form.Group className="mb-2"><Form.Label>City</Form.Label><Form.Control value={city} onChange={e => setCity(e.target.value)} /></Form.Group>
              <Form.Group className="mb-2"><Form.Label>Postal Code</Form.Label><Form.Control value={postalCode} onChange={e => setPostalCode(e.target.value)} /></Form.Group>
              <Form.Group className="mb-2"><Form.Label>Country</Form.Label><Form.Control value={country} onChange={e => setCountry(e.target.value)} /></Form.Group>
            </Form>
            <h4 className="mt-3">Payment Method</h4>
            <Form.Check type="radio" label="Stripe Sandbox" id="stripe" name="payment" value="stripe_sandbox" checked={method === 'stripe_sandbox'} onChange={e => setMethod(e.target.value)} />
            <Form.Check type="radio" label="PayPal" id="paypal" name="payment" value="paypal" checked={method === 'paypal'} onChange={e => setMethod(e.target.value)} />
          </div>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item><h4>Order Summary</h4></ListGroup.Item>
            <ListGroup.Item>Items: ${subtotal.toFixed(2)}</ListGroup.Item>
            <ListGroup.Item>Shipping: ${shipping.toFixed(2)}</ListGroup.Item>
            <ListGroup.Item>Tax: ${tax.toFixed(2)}</ListGroup.Item>
            <ListGroup.Item><strong>Total: ${total.toFixed(2)}</strong></ListGroup.Item>
            <ListGroup.Item>
              {error && <Message variant="danger">{error}</Message>}
              {step === 1 ? (
                <Button className="w-100" onClick={() => { if (!userInfo) { navigate('/login'); return; } setStep(2); }}>Proceed to Checkout</Button>
              ) : (
                <Button className="w-100" onClick={placeOrder} disabled={!address || !city || !postalCode || !country}>Place Order</Button>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
}
