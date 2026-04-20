import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';

export default function Header() {
  const { userInfo, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const accountLabel = userInfo?.name?.trim() || 'Account';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" collapseOnSelect className="minimal-site-header py-2">
      <Container className="app-shell px-3">
        <Navbar.Brand
          as={Link}
          to="/"
          className="nav-brand-mark text-decoration-none align-items-baseline d-inline-flex"
        >
          <span className="hero-brand-bit">Bit</span>
          <span className="hero-brand-forge">Forge</span>
          <span className="visually-hidden"> — DIY Maker Kits Marketplace</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="site-nav-collapse" />
        <Navbar.Collapse id="site-nav-collapse" className="nav-collapse-balanced">
          <div className="nav-center-cluster">
            <Nav>
              <Nav.Link as={Link} to="/" style={{ cursor: 'pointer' }}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/shop" style={{ cursor: 'pointer' }}>
                Shop
              </Nav.Link>
            </Nav>
          </div>
          <Nav className="nav-end-cluster align-items-lg-center">
            <Nav.Link as={Link} to="/cart" style={{ cursor: 'pointer' }}>
              <FaShoppingCart /> Cart
              {totalItems > 0 && (
                <Badge pill bg="success" className="ms-1">
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>
            {userInfo ? (
              <NavDropdown
                title={
                  <span>
                    <FaUser className="me-1" /> {accountLabel}
                  </span>
                }
                id="account-menu"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings" active={pathname === '/settings'}>
                  Settings
                </NavDropdown.Item>
                {userInfo.isAdmin && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/users">
                      Users
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/products">
                      Products
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/orders">
                      Orders
                    </NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/register" style={{ cursor: 'pointer' }}>
                  Register
                </Nav.Link>
                <Link to="/login" className="nav-link d-flex align-items-center" style={{ cursor: 'pointer' }}>
                  <FaUser className="me-1" /> Sign In
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
