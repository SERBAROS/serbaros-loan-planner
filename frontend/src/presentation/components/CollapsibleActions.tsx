import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ActionItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: 'download' | 'edit' | 'delete';
}

interface CollapsibleActionsProps {
  actions: ActionItem[];
  /** Ancho bajo el cual se colapsa a menú — 760px cubre tanto el caso de
   * escritorio angosto como móvil. */
  breakpoint?: number;
}

const ICONS = {
  download: <DownloadIcon fontSize="small" />,
  edit: <EditIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />,
};

export default function CollapsibleActions({ actions, breakpoint = 760 }: CollapsibleActionsProps) {
  const isNarrow = useMediaQuery(`(max-width:${breakpoint}px)`);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!isNarrow) {
    return (
      <div className="loan-actions">
        {actions.map((a) => (
          <button
            key={a.label}
            className={a.danger ? 'btn btn-danger' : 'btn'}
            onClick={a.onClick}
            disabled={a.disabled}
          >
            {a.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Más opciones" sx={{ color: 'var(--muted)' }}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-soft)', minWidth: 200 } } }}
      >
        {actions.map((a) => (
          <MenuItem
            key={a.label}
            disabled={a.disabled}
            onClick={() => {
              setAnchorEl(null);
              a.onClick();
            }}
            sx={{ color: a.danger ? 'var(--danger)' : 'var(--paper)', gap: '10px' }}
          >
            {a.icon && <ListItemIcon sx={{ color: a.danger ? 'var(--danger)' : 'var(--muted)', minWidth: 'auto' }}>{ICONS[a.icon]}</ListItemIcon>}
            <ListItemText>{a.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
