import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import type { CartItem } from '../store/cartTypes';
import Message from '../components/Message';

function CartLineBom({ item }: { item: CartItem }) {
  const bom = item.customization?.bom;
  if (!bom?.length) {
    return (
      <div className="mt-2 small text-muted">
        Standard kit — no add-on modules selected.
      </div>
    );
  }
  return (
    <div className="cart-bom-breakdown mt-2 ps-3 border-start border-2" style={{ borderColor: 'rgba(13, 110, 253, 0.35)' }}>
      <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ letterSpacing: '0.04em', fontSize: '0.65rem' }}>
        Kit & add-ons (per unit)
      </div>
      <ul className="list-unstyled small mb-0">
        {bom.map((row, idx) => (
          <li key={`${row.sku}-${idx}`} className="d-flex justify-content-between gap-3 py-1 border-bottom border-light">
            <span>
              <span className="text-dark">{row.name}</span>
              <span className="text-muted ms-1">({row.sku})</span>
            </span>
            <span className="text-nowrap">${row.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-between small fw-semibold mt-2 pt-1">
        <span className="text-muted">Configured price (each)</span>
        <span>${item.price.toFixed(2)}</span>
      </div>
      {item.qty > 1 && (
        <div className="d-flex justify-content-between small mt-1">
          <span className="text-muted">Line total × {item.qty}</span>
          <span>${(item.price * item.qty).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function OrderSummaryLineItems({ cartItems }: { cartItems: CartItem[] }) {
  return (
    <div className="order-summary-lines">
      <h6 className="mb-3 text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
        Items in your cart
      </h6>
      {cartItems.map((item) => (
        <div key={item.cartLineId} className="mb-4 pb-3 border-bottom border-light">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
            <div>
              <span className="fw-semibold">{item.name}</span>
              <span className="text-muted small ms-1">× {item.qty}</span>
            </div>
            <span className="fw-semibold text-nowrap">${(item.price * item.qty).toFixed(2)}</span>
          </div>
          {item.customization?.bom && item.customization.bom.length > 0 ? (
            <ul className="list-unstyled small mb-0 mt-2 ps-2">
              {item.customization.bom.map((row, idx) => (
                <li key={`${item.cartLineId}-${row.sku}-${idx}`} className="d-flex justify-content-between gap-2 py-1">
                  <span className="text-muted">
                    {row.name} <span className="opacity-75">({row.sku})</span>
                  </span>
                  <span className="text-muted text-nowrap">${row.price.toFixed(2)}</span>
                </li>
              ))}
              <li className="d-flex justify-content-between small fw-semibold mt-1 pt-1 border-top border-light">
                <span className="text-muted">Kit price each</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            </ul>
          ) : (
            <div className="small text-muted mt-1">Base kit only · ${item.price.toFixed(2)} each</div>
          )}
        </div>
      ))}
    </div>
  );
}

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
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err.response?.data?.message || err.message || 'Order failed');
    }
  };

  if (cartItems.length === 0) return <Message>Your cart is empty. <a href="/shop">Go Shopping</a></Message>;

  return (
    <Row>
      <Col md={8}>
        <h2 className="mb-4">Shopping Cart</h2>
        <ListGroup variant="flush">
          {cartItems.map(item => (
            <ListGroup.Item key={item.cartLineId} className="py-4">
              <Row className="g-3">
                <Col xs={4} md={3} lg={2}>
                  <Image src={item.image} fluid rounded className="w-100" style={{ maxWidth: 120 }} />
                </Col>
                <Col xs={8} md={9} lg={10}>
                  <Row className="align-items-start">
                    <Col md={7}>
                      <div className="fw-semibold fs-6">{item.name}</div>
                      <CartLineBom item={item} />
                    </Col>
                    <Col md={5} className="mt-3 mt-md-0">
                      <Row className="align-items-center text-md-end g-2">
                        <Col xs={6} md={12} className="text-muted small text-md-end">Unit price</Col>
                        <Col xs={6} md={12} className="fw-semibold">${item.price.toFixed(2)}</Col>
                        <Col xs={6} md={12} className="mt-2">
                          <Form.Select
                            size="sm"
                            value={item.qty}
                            onChange={e => updateCartQty(item.cartLineId, Number(e.target.value))}
                            className="ms-md-auto"
                            style={{ maxWidth: 140 }}
                          >
                            {[...Array(10).keys()].map(x => <option key={x + 1} value={x + 1}>Qty: {x + 1}</option>)}
                          </Form.Select>
                        </Col>
                        <Col xs={6} md={12}>
                          <Button variant="outline-danger" size="sm" onClick={() => removeFromCart(item.cartLineId)} className="mt-1">
                            <FaTrash className="me-1" aria-hidden />
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
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
        <Card className="shadow-sm border-0" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
          <ListGroup variant="flush">
            <ListGroup.Item className="py-3">
              <h4 className="mb-0">Order Summary</h4>
            </ListGroup.Item>
            <ListGroup.Item className="py-3 bg-light bg-opacity-50">
              <OrderSummaryLineItems cartItems={cartItems} />
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2">
              <span>Merchandise</span>
              <span className="fw-medium">${subtotal.toFixed(2)}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-2">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between py-3">
              <strong>Total</strong>
              <strong>${total.toFixed(2)}</strong>
            </ListGroup.Item>
            <ListGroup.Item className="py-3">
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
