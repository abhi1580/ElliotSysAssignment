import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import type { RootState } from '../store';
import { TextField, Button, Box, Typography, CircularProgress, Alert, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch<any>(loginUser({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') navigate('/');
  };

  if (isAuthenticated) navigate('/');

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Login'}</Button>
          <Button color="secondary" onClick={() => navigate('/register')}>Don't have an account? Register</Button>
        </Box>
      </Paper>
    </Container>
  );
} 