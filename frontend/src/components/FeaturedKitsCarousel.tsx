import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb } from 'react-icons/fa';

export type DifficultyTier = 'Beginner' | 'Intermediate' | 'Advanced';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  difficulty: string;
}

const TIERS: { id: DifficultyTier; label: string }[] = [
  { id: 'Beginner', label: 'Beginner' },
  { id: 'Intermediate', label: 'Intermediate' },
  { id: 'Advanced', label: 'Advanced' },
];

function tierFromDifficulty(d: string): DifficultyTier | null {
  const t = d?.trim();
  if (t === 'Beginner' || t === 'Intermediate' || t === 'Advanced') return t;
  return null;
}

export default function FeaturedKitsCarousel({ products }: { products: Product[] }) {
  const [tier, setTier] = useState<DifficultyTier>('Beginner');
  const trackRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => products.filter((p) => tierFromDifficulty(p.difficulty) === tier),
    [products, tier]
  );

  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: 0, behavior: 'auto' });
  }, [tier]);

  /** dir -1 = prev (‹): scroll track left. dir 1 = next (›): scroll track right. Both wrap at ends. */
  const scrollByDir = useCallback(
    (dir: -1 | 1) => {
      const el = trackRef.current;
      if (!el || filtered.length === 0) return;
      const card = el.querySelector<HTMLElement>('.featured-kit-card');
      const styles = getComputedStyle(el);
      const gap = parseFloat(styles.gap || '16') || 16;
      const step = (card?.offsetWidth ?? 300) + gap;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      if (max < 1) return;

      const epsilon = 3;
      const atStart = el.scrollLeft <= epsilon;
      const atEnd = el.scrollLeft >= max - epsilon;

      if (dir > 0) {
        // Right chevron: show next cards (increase scrollLeft). At end → loop to start.
        if (atEnd) {
          el.scrollLeft = 0;
        } else {
          el.scrollBy({ left: step, behavior: 'smooth' });
        }
      } else {
        // Left chevron: show previous cards (decrease scrollLeft). At start → loop to end.
        if (atStart) {
          el.scrollLeft = max;
        } else {
          el.scrollBy({ left: -step, behavior: 'smooth' });
        }
      }
    },
    [filtered.length]
  );

  return (
    <div className="featured-carousel">
      <header className="featured-carousel__header">
        <p className="featured-carousel__eyebrow">BitForge picks</p>
        <h2 id="featured-heading" className="featured-carousel__title">
          Featured Kits
        </h2>
        <div className="featured-carousel__tiers" role="tablist" aria-label="Kit difficulty">
          {TIERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tier === id}
              className={`featured-tier-pill ${tier === id ? 'is-active' : ''}`}
              onClick={() => setTier(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="featured-carousel__viewport-wrap">
        <button
          type="button"
          className="featured-carousel__arrow featured-carousel__arrow--prev"
          aria-label="Previous kits"
          onClick={() => scrollByDir(-1)}
          disabled={filtered.length === 0}
        >
          <span className="featured-carousel__chevron" aria-hidden="true">
            ‹
          </span>
        </button>
        <div ref={trackRef} className="featured-carousel__track">
          {filtered.map((p) => (
            <article key={p._id} className="featured-kit-card">
              <Link to={`/product/${p._id}`} className="featured-kit-card__image-wrap">
                <img src={p.image} alt="" className="featured-kit-card__image" loading="lazy" />
              </Link>
              <div className="featured-kit-card__content">
                <div className="featured-kit-card__labels">
                  <span className="featured-kit-card__new">NEW</span>
                  <span
                    className="featured-kit-innovation"
                    role="img"
                    aria-label="Innovation and creation"
                  >
                    <FaLightbulb className="featured-kit-innovation-icon" aria-hidden />
                  </span>
                </div>
                <h3 className="featured-kit-card__name">
                  <Link to={`/product/${p._id}`} className="featured-kit-card__name-link">
                    {p.name}
                  </Link>
                </h3>
                <p className="featured-kit-card__price-line">
                  From <strong>${p.price.toFixed(2)}</strong>
                </p>
                <Link to={`/product/${p._id}`} className="featured-kit-card__cta">
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="featured-carousel__arrow featured-carousel__arrow--next"
          aria-label="Next kits"
          onClick={() => scrollByDir(1)}
          disabled={filtered.length === 0}
        >
          <span className="featured-carousel__chevron" aria-hidden="true">
            ›
          </span>
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="featured-carousel__empty text-muted text-center py-3 mb-0">No kits in this range yet.</p>
      )}
    </div>
  );
}
