import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Tenant, TenantContext } from '../types';

const TenantContextProvider = createContext<TenantContext | undefined>(undefined);

export const useTenant = (): TenantContext => {
  const context = useContext(TenantContextProvider);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant>('acme_schema');

  const value: TenantContext = {
    currentTenant,
    setCurrentTenant,
  };

  return (
    <TenantContextProvider.Provider value={value}>
      {children}
    </TenantContextProvider.Provider>
  );
};
