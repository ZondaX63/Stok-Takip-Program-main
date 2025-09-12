import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Typography, Paper, Alert } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import './Auth.css';

// Keyframe animations (Could be moved to a shared file later)
const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const AuthBox = styled(Paper)(({ theme }) => ({
  padding: '40px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
  textAlign: 'center',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  animation: `${fadeInUp} 0.8s ease-out`,
}));

const AuthTitle = styled(Typography)({
  marginBottom: '20px',
  color: '#333',
  fontWeight: 700,
  animation: `${fadeInDown} 0.8s ease-out`,
});

const StyledButton = styled('button')(({ theme }) => ({
  fontSize: '1rem',
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: '#764ba2',
  color: '#fff',
  fontWeight: 600,
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: '0 2px 8px rgba(118,75,162,0.08)',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 16px rgba(118,75,162,0.18)',
    background: '#667eea',
  },
}));

const AuthLink = styled(Link)(({ theme }) => ({
    marginTop: '20px',
    color: '#555',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
        color: '#000',
        textDecoration: 'underline',
    }
}));


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email || !password) {
        setError('Lütfen tüm alanları doldurun.');
        return;
    }

    setLoading(true);
    try {
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        navigate('/panel');
        window.location.reload();
    } catch (err) {
        const errorMessage =
            err.response?.data?.errors?.map(e => e.msg).join(' ') ||
            err.response?.data?.msg ||
            'Giriş başarısız!';
        setError(errorMessage);
        console.error('Login error:', err.response ? err.response.data : err);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="auth-container">
      <AuthBox elevation={10}>
        <AuthTitle variant="h4">
            Giriş Yap
        </AuthTitle>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            variant="outlined"
          />
          <StyledButton type="submit" disabled={loading} aria-label="Login">
            {loading ? 'Giriş Yapılıyor...' : 'Giriş'}
          </StyledButton>
          <Typography variant="body2">
            Hesabın yok mu?{' '}
            <AuthLink to="/register">
              Kayıt Ol
            </AuthLink>
          </Typography>
        </form>
      </AuthBox>
    </div>
  );
}
