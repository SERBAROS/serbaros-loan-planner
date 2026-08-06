import { Tabs as MuiTabs, Tab, Chip } from '@mui/material';

interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <MuiTabs
      value={active}
      onChange={(_e, value) => onChange(value)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        borderBottom: '1px solid var(--border-soft)',
        marginBottom: '24px',
        minHeight: 'auto',
        '& .MuiTab-root': {
          textTransform: 'none',
          minHeight: 'auto',
          padding: '10px 16px',
          color: 'var(--muted)',
          fontSize: '13px',
        },
        '& .MuiTab-root.Mui-selected': { color: 'var(--brass)', fontWeight: 600 },
        '& .MuiTabs-indicator': { backgroundColor: 'var(--brass)' },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {tab.label}
              {tab.badge !== undefined && (
                <Chip
                  label={tab.badge}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: active === tab.id ? 'var(--brass)' : 'var(--surface-raised)',
                    color: active === tab.id ? 'var(--ink)' : 'var(--paper-dim)',
                  }}
                />
              )}
            </span>
          }
        />
      ))}
    </MuiTabs>
  );
}
