import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { useTenant } from '../contexts/TenantContext';
import { useMobileView } from '../contexts/MobileViewContext';
import type { Tenant } from '../types';

const tenantNames: Record<Tenant, string> = {
  acme_schema: 'Acme Corporation',
  tech_schema: 'Tech Solutions',
  ibaraka: 'Ijara Baraka',
};

export const TenantSelector: React.FC = () => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const { isMobile } = useMobileView();
  const theme = useTheme();

  const handleChange = (event: any) => {
    setCurrentTenant(event.target.value as Tenant);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 1 : 2,
        p: isMobile ? 1 : 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography
        variant={isMobile ? 'body2' : 'body1'}
        sx={{
          fontWeight: 600,
          color: theme.palette.text.secondary,
        }}
      >
        Tenant:
      </Typography>
      <FormControl
        size={isMobile ? 'small' : 'medium'}
        sx={{
          minWidth: isMobile ? 120 : 200,
        }}
      >
        <Select
          value={currentTenant}
          onChange={handleChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              py: isMobile ? 1 : 1.5,
            },
          }}
        >
          {Object.entries(tenantNames).map(([key, name]) => (
            <MenuItem key={key} value={key}>
              <Typography
                variant={isMobile ? 'body2' : 'body1'}
                sx={{
                  fontSize: isMobile ? '0.8rem' : '1rem',
                }}
              >
                {name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
