import { Menu, MenuItem, Avatar, Box, Divider, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function ProfileMenu({ anchorEl, onClose }: ProfileMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const open = Boolean(anchorEl);
  const initials = (user?.nombre || user?.email || '?').trim().charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    onClose();
    navigate('/entrar');
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            minWidth: 240,
            marginTop: '8px',
          },
        },
      }}
    >
      <Box sx={{ padding: '16px', textAlign: 'center' }}>
        <Avatar sx={{ width: 48, height: 48, margin: '0 auto 10px', backgroundColor: 'var(--brass)', color: 'var(--ink)', fontWeight: 700 }}>
          {initials}
        </Avatar>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--paper)' }}>
          {user?.nombre || 'Sin nombre'}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email}</Typography>
      </Box>

      <Divider sx={{ borderColor: 'var(--border-soft)' }} />

      <MenuItem
        onClick={() => {
          onClose();
          navigate('/perfil');
        }}
        sx={{ color: 'var(--paper)', gap: '10px', padding: '12px 16px' }}
      >
        <PersonOutlineIcon fontSize="small" sx={{ color: 'var(--muted)' }} />
        Editar perfil
      </MenuItem>

      <Divider sx={{ borderColor: 'var(--border-soft)' }} />

      <MenuItem onClick={handleLogout} sx={{ color: 'var(--danger)', gap: '10px', padding: '12px 16px' }}>
        <LogoutIcon fontSize="small" />
        Cerrar sesión
      </MenuItem>
    </Menu>
  );
}
