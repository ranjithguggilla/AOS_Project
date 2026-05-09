import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import type { CartCustomization } from '../store/cartTypes';
import { makeCartLineId } from '../store/cartTypes';
import GlassButton from '../components/glass/GlassButton';
import GlassSurface from '../components/glass/GlassSurface';

interface Product {
  _id: string; name: string; price: number; image: string; category: string; difficulty: string; description: string; countInStock: number;
}
interface Review {
  _id: string; userName: string; rating: number; comment: string; createdAt: string;
}
interface ComponentItem {
  _id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  voltage_volts: number;
}
interface CustomizeResult {
  kit_id: string;
  kit_name: string;
  total: number;
  bom: { name: string; sku: string; price: number }[];
  warnings: string[];
  cache_hit?: boolean;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { addToCart } = useCart();
  const loginPath = `/login?redirect=${encodeURIComponent(`/product/${id ?? ''}`)}`;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [productError, setProductError] = useState('');
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [customizeResult, setCustomizeResult] = useState<CustomizeResult | null>(null);
  const [customizeLoading, setCustomizeLoading] = useState(false);
  const [customizeError, setCustomizeError] = useState('');

  useEffect(() => {
    setSelectedModules([]);
    setCustomizeResult(null);
    setCustomizeError('');
    setMsg('');
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setProductError('');
      try {
        const p = await axios.get(`/api/products/${id}`);
        if (mounted) setProduct(p.data);
      } catch (e: any) {
        if (mounted) {
          setProduct(null);
          setProductError(e.response?.data?.message || 'Failed to load product');
        }
      }

      try {
        const r = await axios.get(`/api/reviews/${id}`);
        if (mounted) setReviews(r.data);
      } catch {
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    const loadComponents = async () => {
      try {
        const c = await axios.get('/api/products/components');
        if (mounted) setComponents(c.data);
      } catch {
        if (mounted) setComponents([]);
      }
    };
    load();
    loadComponents();
    return () => { mounted = false; };
  }, [id]);

  const toggleModule = (componentId: string) => {
    const sid = String(componentId);
    setCustomizeResult(null);
    setSelectedModules((prev) => {
      const next = new Set(prev.map(String));
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return [...next];
    });
  };

  /** Module IDs to price — prefer live checkbox selection; else use last BOM for this kit (same kit_id). */
  const resolveModuleIdsForCart = (): string[] => {
    if (!product) return [];
    if (selectedModules.length > 0) {
      return [...new Set(selectedModules.map(String))];
    }
    if (
      customizeResult &&
      String(customizeResult.kit_id ?? '') === String(product._id) &&
      customizeResult.bom.length > 1 &&
      components.length > 0
    ) {
      const addonSkus = customizeResult.bom.slice(1).map((b) => b.sku);
      const ids = components.filter((c) => addonSkus.includes(c.sku)).map((c) => String(c._id));
      if (ids.length === addonSkus.length) return ids;
    }
    return [];
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setMsg('');
    if (!userInfo) {
      navigate(loginPath);
      return;
    }
    try {
      let unitPrice = product.price;
      let customization: CartCustomization | undefined;
      let cartLineId = makeCartLineId(product._id, []);

      const moduleIds = resolveModuleIdsForCart();

      if (moduleIds.length > 0) {
        const { data } = await axios.post('/api/products/customize', {
          kit_id: product._id,
          component_ids: moduleIds,
        });
        unitPrice = Number(data.total);
        if (Number.isNaN(unitPrice)) {
          setMsg('Invalid price from server — try "Build BOM & Price" again.');
          return;
        }
        cartLineId = makeCartLineId(product._id, moduleIds);
        customization = {
          componentIds: [...moduleIds],
          bom: data.bom,
          basePrice: product.price,
        };
      }

      const added = addToCart({
        productId: product._id,
        cartLineId,
        name: product.name,
        image: product.image,
        price: unitPrice,
        qty,
        ...(customization ? { customization } : {}),
      });
      setMsg(added ? 'Added to cart!' : 'Please sign in to continue.');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setMsg(err.response?.data?.message || err.message || 'Could not add to cart');
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo) return;
    try {
      await axios.post('/api/reviews', { product: id, rating, comment, userName: userInfo.name }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const { data } = await axios.get(`/api/reviews/${id}`);
      setReviews(data);
      setComment('');
      setMsg('Review submitted!');
    } catch (e: any) { setMsg(e.response?.data?.message || e.message); }
  };

  const handleCustomize = async () => {
    if (!product) return;
    setCustomizeLoading(true);
    setCustomizeError('');
    try {
      const { data } = await axios.post('/api/products/customize', {
        kit_id: product._id,
        component_ids: selectedModules.map(String),
      });
      setCustomizeResult(data);
    } catch (e: any) {
      setCustomizeResult(null);
      setCustomizeError(e.response?.data?.message || 'Failed to customize this kit');
    } finally {
      setCustomizeLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <Message variant="danger">{productError || 'Product not found'}</Message>;

  return (
    <>
      <Row className="my-3 g-3">
        <Col md={5}>
          <GlassSurface className="p-2 product-image-surface interactive-lift">
            <Image src={product.image} fluid rounded />
          </GlassSurface>
        </Col>
        <Col md={4}>
          <GlassSurface className="p-0 product-info-surface interactive-lift">
            <ListGroup variant="flush">
              <ListGroup.Item><h3>{product.name}</h3></ListGroup.Item>
              <ListGroup.Item><strong>${product.price.toFixed(2)}</strong></ListGroup.Item>
              {product.description?.trim() && (
                <ListGroup.Item className="text-muted">{product.description}</ListGroup.Item>
              )}
            </ListGroup>
          </GlassSurface>
        </Col>
        <Col md={3}>
          <GlassSurface className="p-0 product-buy-surface interactive-lift">
            <ListGroup>
              <ListGroup.Item>Status: {product.countInStock > 0 ? <span className="text-success">In Stock</span> : <span className="text-danger">Out of Stock</span>}</ListGroup.Item>
              {product.countInStock > 0 && (
                <ListGroup.Item>
                  <Form.Select value={qty} onChange={e => setQty(Number(e.target.value))}>
                    {[...Array(Math.min(product.countInStock, 10)).keys()].map(x => <option key={x + 1} value={x + 1}>{x + 1}</option>)}
                  </Form.Select>
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <GlassButton className="w-100" disabled={product.countInStock === 0} onClick={() => void handleAddToCart()}>
                  {userInfo ? 'Add to Cart' : 'Sign in to Add to Cart'}
                </GlassButton>
              </ListGroup.Item>
            </ListGroup>
          </GlassSurface>
          {!userInfo && (
            <Message variant="warning">
              To protect your account and order history, please <Link to={loginPath}>sign in</Link> or{' '}
              <Link to="/register">create an account</Link> before adding items to cart.
            </Message>
          )}
          {msg && <Message variant="info">{msg}</Message>}
        </Col>
      </Row>
      <Row className="my-4 g-3">
        <Col md={6}>
          <h4>Reviews</h4>
          <GlassSurface className="p-3 interactive-lift">
            {reviews.length === 0 && <Message>No reviews yet</Message>}
            {reviews.map(r => (
              <ListGroup.Item key={r._id} className="mb-2">
                <strong>{r.userName}</strong>
                <Rating value={r.rating} />
                <p>{r.comment}</p>
                <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
              </ListGroup.Item>
            ))}
          </GlassSurface>
        </Col>
        <Col md={6}>
          <h4>Customize This Kit</h4>
          <GlassSurface className="p-3 interactive-lift">
            <ListGroup className="mb-3 customizer-scroll" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {components.map((c) => (
                <ListGroup.Item key={c._id}>
                  <Form.Check
                    type="checkbox"
                    id={`module-${c._id}`}
                    checked={selectedModules.map(String).includes(String(c._id))}
                    onChange={() => toggleModule(String(c._id))}
                    label={`${c.name} (${c.sku}) — $${c.price.toFixed(2)}`}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
            <GlassButton onClick={handleCustomize} disabled={customizeLoading}>
              {customizeLoading ? 'Customizing...' : 'Build BOM & Price'}
            </GlassButton>
            {customizeError && <Message variant="danger">{customizeError}</Message>}
            {customizeResult && (
              <div className="mt-3">
                <Message variant="success">
                  Total customized price: <strong>${customizeResult.total.toFixed(2)}</strong>
                  {customizeResult.cache_hit ? ' (cached)' : ''}
                </Message>
                <h6>BOM</h6>
                <ListGroup className="mb-2">
                  {customizeResult.bom.map((item, idx) => (
                    <ListGroup.Item key={`${item.sku}-${idx}`}>
                      {item.name} ({item.sku}) — ${item.price.toFixed(2)}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {customizeResult.warnings?.length > 0 && (
                  <Message variant="warning">{customizeResult.warnings.join(' | ')}</Message>
                )}
              </div>
            )}
          </GlassSurface>
        </Col>
      </Row>
      <Row className="my-2">
        <Col md={6}>
          <h4>Write a Review</h4>
          <GlassSurface className="p-3 interactive-lift">
            {!userInfo ? <Message>Please <a href="/login">sign in</a> to write a review</Message> : (
              <Form onSubmit={handleReview}>
                <Form.Group className="mb-2">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select value={rating} onChange={e => setRating(Number(e.target.value))}>
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} - {['Poor','Fair','Good','Very Good','Excellent'][v-1]}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control as="textarea" rows={3} value={comment} onChange={e => setComment(e.target.value)} />
                </Form.Group>
                <GlassButton type="submit">Submit</GlassButton>
              </Form>
            )}
          </GlassSurface>
        </Col>
      </Row>
    </>
  );
}
