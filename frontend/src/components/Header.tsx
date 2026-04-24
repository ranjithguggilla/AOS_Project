import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaUserPlus } from 'react-icons/fa';
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

  const primaryNav = (
    <Nav className="navbar-mid-links flex-row">
      <Nav.Link as={Link} to="/" style={{ cursor: 'pointer' }}>
        Home
      </Nav.Link>
      <Nav.Link as={Link} to="/shop" style={{ cursor: 'pointer' }}>
        Shop
      </Nav.Link>
    </Nav>
  );

  return (
    <Navbar expand="lg" collapseOnSelect className="minimal-site-header py-2">
      {/* Inner wrapper: Bootstrap forces .navbar > .container { display:flex } — one full-width child avoids 3-way space-between swallowing the grid */}
      <Container className="app-shell px-3">
        <div className="bitforge-navbar-inner w-100 navbar-shell">
          <Navbar.Brand
            as={Link}
            to="/"
            className="nav-brand-mark navbar-shell-brand text-decoration-none align-items-center d-inline-flex flex-shrink-0"
          >
            <span className="hero-brand-bit">Bit</span>
            <span className="hero-brand-forge">Forge</span>
            <span className="visually-hidden"> — DIY Maker Kits Marketplace</span>
          </Navbar.Brand>
          <div className="navbar-shell-mid d-none d-lg-flex align-items-center justify-content-center">
            {primaryNav}
          </div>
          <div className="navbar-shell-end d-flex align-items-center justify-content-end flex-shrink-0">
          <Navbar.Toggle aria-controls="site-nav-collapse" />
          <Navbar.Collapse id="site-nav-collapse" className="nav-collapse-balanced">
            <div className="nav-center-cluster d-lg-none w-100">{primaryNav}</div>
            <Nav className="nav-end-cluster align-items-lg-center">
              <Nav.Link
                as={Link}
                to="/cart"
                className="d-flex align-items-center"
                style={{ cursor: 'pointer' }}
              >
                <span className="nav-end-icon-slot">
                <FaShoppingCart className="nav-end-icon" aria-hidden />
              </span>
                Cart
                {totalItems > 0 && (
                  <Badge pill bg="success" className="ms-1">
                    {totalItems}
                  </Badge>
                )}
              </Nav.Link>
              {userInfo ? (
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center">
                      <span className="nav-end-icon-slot">
                        <FaUser className="nav-end-icon" aria-hidden />
                      </span>{' '}
                      {accountLabel}
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
                  <Nav.Link
                    as={Link}
                    to="/register"
                    className="d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="nav-end-icon-slot">
                      <FaUserPlus className="nav-end-icon" aria-hidden />
                    </span>
                    Register
                  </Nav.Link>
                  <Link to="/login" className="nav-link d-flex align-items-center" style={{ cursor: 'pointer' }}>
                    <span className="nav-end-icon-slot">
                      <FaUser className="nav-end-icon" aria-hidden />
                    </span>
                    Sign In
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
          </div>
        </div>
      </Container>
    </Navbar>
  );
}
