import React, { useState } from 'react';
import { Box, Typography, TextField, Paper, Alert, CircularProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

// Keyframe animations
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

const StyledButton = styled('button')(({ theme, disabled }) => ({
  fontSize: '1rem',
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: '#764ba2',
  color: '#fff',
  fontWeight: 600,
  transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
  boxShadow: '0 2px 8px rgba(118,75,162,0.08)',
  '&:hover': {
    transform: disabled ? 'none' : 'scale(1.02)',
    boxShadow: disabled ? 'none' : '0 4px 16px rgba(118,75,162,0.18)',
    background: disabled ? '#764ba2' : '#667eea',
  },
}));

const AuthLink = styled(Link)({
    marginTop: '20px',
    color: '#555',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
        color: '#000',
        textDecoration: 'underline',
    }
});

export default function RegisterPage() {
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form fields
    if (!form.companyName || !form.name || !form.email || !form.password) {
        setError('Lütfen tüm alanları doldurun.');
        setLoading(false);
        return;
    }

    try {
        const res = await api.post('/auth/register', form);
        localStorage.setItem('token', res.data.token);
        navigate('/panel/products');
    } catch (err) {
        setError(err.response?.data?.msg || 'Kayıt başarısız');
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="auth-container">
      <AuthBox elevation={10}>
        <AuthTitle variant="h4">
            Yeni Hesap Oluştur
        </AuthTitle>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField label="Şirket Adı" name="companyName" value={form.companyName} onChange={handleChange} fullWidth margin="normal" required variant="outlined"/>
          <TextField label="Ad Soyad" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required variant="outlined" />
          <TextField label="E-posta" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required type="email" variant="outlined" />
          <TextField label="Şifre" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required type="password" variant="outlined" />
          <StyledButton type="submit" disabled={loading} aria-label="Register">
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Kayıt Ol'}
          </StyledButton>
          <Typography variant="body2">
            Zaten bir hesabın var mı?{' '}
            <AuthLink to="/login">
                Giriş Yap
            </AuthLink>
          </Typography>
        </form>
      </AuthBox>
    </div>
  );
}
