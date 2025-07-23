import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { CssBaseline, Button, Box } from '@mui/material';
import { logoutUser, checkAuth } from './features/auth/authSlice';
import { useEffect } from 'react';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await dispatch<any>(logoutUser());
    navigate('/login');
  };
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <h2>Dashboard</h2>
      <Button variant="contained" color="secondary" onClick={handleLogout}>Logout</Button>
    </Box>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    dispatch<any>(checkAuth());
  }, [dispatch]);
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
