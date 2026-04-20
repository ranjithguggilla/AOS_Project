import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

interface Product { _id: string; name: string; price: number; category: string; }

export default function ProductListPage() {
  const { userInfo } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const fetchProducts = () => axios.get('/api/products').then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`/api/products/${id}`, { headers });
    fetchProducts();
  };

  if (!userInfo?.isAdmin) return <Message variant="danger">Access Denied</Message>;
  if (loading) return <Loader />;

  return (
    <>
      <h2>Products</h2>
      <Link to="/admin/products/new/edit"><Button variant="success" className="mb-3"><FaPlus /> ADD</Button></Link>
      <Table striped bordered hover responsive>
        <thead><tr><th>ID</th><th>NAME</th><th>PRICE</th><th>CATEGORY</th><th></th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p._id.slice(-8)}</td>
              <td>{p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.category}</td>
              <td>
                <Link to={`/admin/products/${p._id}/edit`}><Button size="sm" variant="primary" className="me-2"><FaEdit /> Edit</Button></Link>
                <Button size="sm" variant="danger" onClick={() => deleteProduct(p._id)}><FaTrash /> Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
