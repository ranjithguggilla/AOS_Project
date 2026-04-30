import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

interface AuthCtx {
  userInfo: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const s = localStorage.getItem('userInfo');
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    if (userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo));
    else localStorage.removeItem('userInfo');
  }, [userInfo]);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post('/api/users/login', { email, password });
    setUserInfo(data);
  };

  const register = async (name: string, email: string, password: string) => {
    await axios.post('/api/users/register', { name, email, password });
  };

  const logout = () => setUserInfo(null);

  return (
    <AuthContext.Provider value={{ userInfo, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
