import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('edutrack_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('edutrack_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('edutrack_token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const requestRegisterOtp = async (payload) => {
    const response = await api.post('/auth/register/send-otp', payload);
    return response.data;
  };

  const verifyRegisterOtp = async (payload) => {
    const response = await api.post('/auth/register/verify-otp', payload);
    return response.data;
  };

  const resendRegisterOtp = async (email) => {
    const response = await api.post('/auth/register/resend-otp', { email });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('edutrack_token');
    setUser(null);
  };

  const updateUser = (nextUser) => setUser(nextUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        requestRegisterOtp,
        verifyRegisterOtp,
        resendRegisterOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
