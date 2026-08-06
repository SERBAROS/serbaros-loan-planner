import { ReactNode, useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({ title, subtitle, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button type="button" className="collapsible-section-header" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={`collapsible-section-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">
          ▸
        </span>
        <span className="collapsible-section-title">{title}</span>
        {subtitle && !open && <span className="collapsible-section-subtitle">{subtitle}</span>}
      </button>
      {open && <div className="collapsible-section-body">{children}</div>}
    </div>
  );
}
