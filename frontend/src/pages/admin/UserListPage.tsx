import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

interface User { _id: string; name: string; email: string; isAdmin: boolean; }

export default function UserListPage() {
  const { userInfo } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const fetchUsers = () => axios.get('/api/users', { headers }).then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/users/${id}`, { headers });
    fetchUsers();
  };

  if (!userInfo?.isAdmin) return <Message variant="danger">Access Denied</Message>;
  if (loading) return <Loader />;

  return (
    <>
      <h2>Users</h2>
      <Table striped bordered hover responsive>
        <thead><tr><th>ID</th><th>NAME</th><th>EMAIL</th><th>ADMIN</th><th></th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u._id.slice(-8)}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.isAdmin ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />}</td>
              <td>
                <Link to={`/admin/users/${u._id}/edit`}><Button size="sm" variant="primary" className="me-2"><FaEdit /> Edit</Button></Link>
                <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}><FaTrash /> Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
