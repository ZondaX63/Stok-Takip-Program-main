import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';
import './Auth.css';

// Keyframe animations
const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled Components
const WelcomeBox = styled(Paper)(({ theme }) => ({
  padding: '50px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(15px)',
  borderRadius: '20px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
  width: '100%',
  maxWidth: '600px',
  textAlign: 'center',
  border: '1px solid rgba(255, 255, 255, 0.4)',
}));

const WelcomeTitle = styled(Typography)({
  fontSize: '4rem',
  fontWeight: 700,
  color: '#764ba2',
  animation: `${fadeInDown} 1s ease-out`,
});

const WelcomeSubtitle = styled(Typography)({
  fontSize: '1.5rem',
  color: '#555',
  animation: `${fadeInUp} 1s ease-out`,
});

const WelcomeButtonGroup = styled(Box)({
  display: 'flex',
  gap: '2rem',
  justifyContent: 'center',
  animation: `${zoomIn} 1s ease-out`,
});

const StyledButton = styled('button')(({ theme }) => ({
  fontSize: '1rem',
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  margin: '0 8px',
  background: '#764ba2',
  color: '#fff',
  fontWeight: 600,
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: '0 2px 8px rgba(118,75,162,0.08)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 16px rgba(118,75,162,0.18)',
    background: '#667eea',
  },
  '&.outlined': {
    background: '#fff',
    color: '#764ba2',
    border: '2px solid #764ba2',
  },
}));

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="auth-container">
      <WelcomeBox elevation={10}>
        <WelcomeTitle variant="h2" sx={{ mb: 2 }}>
          Stok Takip
        </WelcomeTitle>
        <WelcomeSubtitle variant="h5" sx={{ mb: 4 }}>
          İşletmeniz için modern ve akıllı çözüm.
        </WelcomeSubtitle>
        <WelcomeButtonGroup>
          <StyledButton onClick={() => handleNavigation('/login')} aria-label="Login" sx={{ animation: `${fadeInDown} 1s ease-out` }}>
            Login
          </StyledButton>
          <StyledButton onClick={() => handleNavigation('/register')} aria-label="Register" className="outlined" sx={{ animation: `${fadeInUp} 1s ease-out` }}>
            Register
          </StyledButton>
        </WelcomeButtonGroup>
      </WelcomeBox>
    </div>
  );
}
