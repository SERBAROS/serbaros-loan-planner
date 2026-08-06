import { ReactNode, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({ title, subtitle, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Accordion
      expanded={open}
      onChange={() => setOpen((v) => !v)}
      disableGutters
      elevation={0}
      square
      sx={{
        border: '1px solid var(--border-soft)',
        borderRadius: '6px !important',
        overflow: 'hidden',
        marginBottom: 'var(--space-sm)',
        background: 'var(--surface)',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--brass)' }} />}
        sx={{ '&:hover': { background: 'var(--surface-raised)' }, paddingX: '18px' }}
      >
        <span className="collapsible-section-title">{title}</span>
        {subtitle && !open && <span className="collapsible-section-subtitle">{subtitle}</span>}
      </AccordionSummary>
      <AccordionDetails className="collapsible-section-body" sx={{ borderTop: '1px solid var(--border-soft)', paddingX: '18px', paddingTop: '4px' }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
