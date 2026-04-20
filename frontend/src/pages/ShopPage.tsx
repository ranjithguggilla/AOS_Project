import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Form } from 'react-bootstrap';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';
import GlassSurface from '../components/glass/GlassSurface';
import { isShopCategoryToken, normalizeShopCategory } from '../constants/shopCategories';

interface Product {
  _id: string; name: string; price: number; image: string; category: string; difficulty: string;
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = normalizeShopCategory(searchParams.get('category'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchProducts = async (cat: string, kw: string) => {
    setLoading(true);
    try {
      let url = '/api/products';
      if (kw) url = `/api/products/search?keyword=${encodeURIComponent(kw)}`;
      else if (cat !== 'all') url = `/api/products?category=${cat}`;
      const { data } = await axios.get(url);
      setProducts(data);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(category, keyword);
  }, [category]);

  useEffect(() => {
    const raw = searchParams.get('category');
    if (raw !== null && raw !== '' && !isShopCategoryToken(raw)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('category');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchProducts(category, keyword); };

  return (
    <>
      <h2>Shop</h2>
      <GlassSurface className="p-3 mb-3 interactive-lift">
        <Form onSubmit={handleSearch} className="d-flex mb-0">
          <Form.Control placeholder="Search kits..." value={keyword} onChange={e => setKeyword(e.target.value)} />
          <GlassButton type="submit" variant="outline-primary" className="ms-2">Search</GlassButton>
        </Form>
      </GlassSurface>
      {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : (
        <Row className="featured-grid">
          {products.map(p => (
            <Col key={p._id} sm={12} md={6} lg={4} className="mb-4">
              <GlassCard className="premium-card">
                <Card.Img variant="top" src={p.image} style={{ height: 180, objectFit: 'cover' }} className="premium-card-image" />
                <Card.Body>
                  <Card.Title className="shop-card-title">{p.name}</Card.Title>
                  <p className="shop-card-price mb-3">${p.price.toFixed(2)}</p>
                  <Link to={`/product/${p._id}`} className="shop-view-details">
                    View details
                  </Link>
                </Card.Body>
              </GlassCard>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
