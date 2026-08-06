import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import type { MobileViewContext } from '../types';

const MobileViewContextProvider = createContext<MobileViewContext | undefined>(undefined);

export const useMobileView = (): MobileViewContext => {
  const context = useContext(MobileViewContextProvider);
  if (!context) {
    throw new Error('useMobileView must be used within a MobileViewProvider');
  }
  return context;
};

interface MobileViewProviderProps {
  children: ReactNode;
}

export const MobileViewProvider: React.FC<MobileViewProviderProps> = ({ children }) => {
  const theme = useTheme();
  const isMobileMediaQuery = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMobile, setIsMobile] = useState(isMobileMediaQuery);

  useEffect(() => {
    setIsMobile(isMobileMediaQuery);
  }, [isMobileMediaQuery]);

  const value: MobileViewContext = {
    isMobile,
    setIsMobile,
  };

  return (
    <MobileViewContextProvider.Provider value={value}>
      {children}
    </MobileViewContextProvider.Provider>
  );
};
