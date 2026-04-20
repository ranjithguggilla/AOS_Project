import { Routes, Route, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import CategoryChipsBar from './components/CategoryChipsBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import OrderPage from './pages/OrderPage';
import UserListPage from './pages/admin/UserListPage';
import UserEditPage from './pages/admin/UserEditPage';
import ProductListPage from './pages/admin/ProductListPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import OrderListPage from './pages/admin/OrderListPage';

export default function App() {
  const location = useLocation();
  const showShopCategoryChips = location.pathname === '/shop';

  return (
    <>
      <Header />
      {showShopCategoryChips && <CategoryChipsBar />}
      <main className="py-3">
        <Container className="app-shell px-3">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/users/:id/edit" element={<UserEditPage />} />
            <Route path="/admin/products" element={<ProductListPage />} />
            <Route path="/admin/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/admin/orders" element={<OrderListPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </>
  );
}
