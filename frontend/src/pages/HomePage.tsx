import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import FeaturedKitsCarousel from '../components/FeaturedKitsCarousel';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  difficulty: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(() => []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('/api/products')
      .then((r) => setProducts(r.data))
      .catch((e) => {
        const msg =
          e.response?.data?.message ||
          (typeof e.response?.data === 'string' ? e.response.data : null) ||
          e.message;
        setError(
          e.response?.status
            ? `Request failed (${e.response.status}): ${msg}`
            : `${msg} — is the API gateway running on port 8080?`
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero-editorial" aria-labelledby="hero-heading">
        <div className="hero-edu-split">
          <header className="hero-edu-left">
            <h1 id="hero-heading" className="hero-editorial-title mb-0">
              <span className="hero-brand-bit">Bit</span>
              <span className="hero-brand-forge">Forge</span>
            </h1>
            <p className="hero-lockup-caption">DIY Maker Kits Marketplace</p>
          </header>
          <div className="hero-edu-right">
            <p className="hero-editorial-tagline">Build. Learn. Create.</p>
            <div className="hero-edu-actions">
              <Link to="/shop" className="hero-link hero-link-apple">
                Shop kits
                <span className="hero-link-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
              <Link to="/register" className="hero-link hero-link-apple hero-link-apple-secondary">
                Join the community
                <span className="hero-link-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-featured" aria-labelledby="featured-heading">
        <div className="home-featured-breakout">
          {loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> : <FeaturedKitsCarousel products={products} />}
        </div>
      </section>
    </>
  );
}
