import { Link, useLocation } from 'react-router-dom';
import {
  SHOP_CATEGORIES,
  normalizeShopCategory,
  shopCategoryLabel,
  type ShopCategory,
} from '../constants/shopCategories';

export default function CategoryChipsBar() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const activeCategory: ShopCategory | null =
    pathname === '/shop' ? normalizeShopCategory(params.get('category')) : null;

  return (
    <div className="category-chips-bar">
      <div className="category-chips-bar-inner app-shell px-3">
        <nav className="category-chips-scroll" aria-label="Shop by kit category">
          {SHOP_CATEGORIES.map((c) => {
            const href = c === 'all' ? '/shop' : `/shop?category=${encodeURIComponent(c)}`;
            const isActive = activeCategory !== null && activeCategory === c;
            return (
              <Link
                key={c}
                to={href}
                className={`category-chip${isActive ? ' category-chip-active' : ''}`}
              >
                {shopCategoryLabel(c)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
