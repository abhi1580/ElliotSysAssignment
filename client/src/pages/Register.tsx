import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import type { RootState } from '../store';
import { TextField, Button, Box, Typography, CircularProgress, Alert, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    setLocalError('');
    const res = await dispatch<any>(registerUser({ email, password }));
    if (res.meta.requestStatus === 'fulfilled') navigate('/');
  };

  if (token) navigate('/');

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h5" mb={2}>Register</Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
          <TextField label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required fullWidth />
          {(error || localError) && <Alert severity="error">{error || localError}</Alert>}
          <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Register'}</Button>
          <Button color="secondary" onClick={() => navigate('/login')}>Already have an account? Login</Button>
        </Box>
      </Paper>
    </Container>
  );
} 