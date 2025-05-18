import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Facebook, Google } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useDispatch, useSelector } from 'react-redux';
import { getClientProfile, login } from '../redux/Slice/AuthSlice'; // Adjust path if needed
import { useNavigate } from 'react-router-dom';

const particlesInit = async engine => {
  await loadFull(engine);
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

function SignInForm({ role }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user,cusprofile } = useSelector(state => state.auth);
  console.log("CUS_PROFILE:",cusprofile);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ email: '', password: '', server: '' });

  const validate = () => {
    let ok = true;
    let errs = { email: '', password: '', server: '' };
    if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email';
      ok = false;
    }
    if (password.length < 6) {
      errs.password = 'Password must be ≥ 6 characters';
      ok = false;
    }
    setError(errs);
    return ok;
  };
  

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(err => ({ ...err, server: '' }));

    try {
      if (role === 'client') {
        await dispatch(login({ Email: email, Password: password })).unwrap();
        await dispatch(getClientProfile()).unwrap();
      } else {
        if (email === 'admin@example.com' && password === 'password') {
          localStorage.setItem('admin_token', 'admin_token_123');
        } else {
          throw new Error('Invalid Admin credentials');
        }
      }
    } catch (err) {
      setError(errs => ({
        ...errs,
        server: err?.message || 'Login failed',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((isLoggedIn && role === 'client') || (role === 'admin' && localStorage.getItem('admin_token'))) {
      navigate('/matbook');
    }
  }, [isLoggedIn, role, navigate]);

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Paper elevation={12} sx={{
        p: 4,
        width: 500,
        mx: 'auto',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 3,
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
      }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          {role === 'admin' ? 'Admin Portal' : 'Client Portal'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={!!error.email}
            helperText={error.email}
            fullWidth
          />
          <TextField
            label="Password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!error.password}
            helperText={error.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                color="primary"
              />
            }
            label="Remember me"
          />
          {error.server && (
            <Typography color="error" variant="body2" align="center">
              {error.server}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 'bold', fontSize: 16 }}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2">Or sign in with</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
              <IconButton color="primary" sx={{ '&:hover': { color: '#3b5998' } }}>
                <Facebook />
              </IconButton>
              <IconButton color="error" sx={{ '&:hover': { color: '#DB4437' } }}>
                <Google />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
}

export default function SignIn() {
  const [tab, setTab] = useState(0);
  const handleTab = (_, v) => setTab(v);

  return (
    <Box sx={{
      position: 'relative',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: 'black'
    }}>
      <Particles
        init={particlesInit}
        options={{
          fullScreen: { enable: true },
          particles: {
            number: { value: 80 },
            size: { value: 3 },
            move: { speed: 1.5 },
            links: { enable: true, distance: 120, opacity: 0.2 },
            color: { value: '#ffffff' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(33,150,243,0.5), rgba(0,188,212,0.5))',
        }}
      />
      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%' }}>
          <Tabs value={tab} onChange={handleTab} variant="fullWidth">
            <Tab label="Admin" />
            <Tab label="Client" />
          </Tabs>
        </Paper>

        <Box sx={{ width: '100%', mt: 4 }}>
          <SignInForm key={tab} role={tab === 0 ? 'admin' : 'client'} />
        </Box>
      </Container>
    </Box>
  );
}
