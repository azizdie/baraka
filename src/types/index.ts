// Backend API response format
export interface ProductApiResponse {
  id?: number;
  name: string;
  description?: string;
  category_id?: number;
  reference?: string;
  codeBarre?: string;
  statut?: string;
}

// Frontend normalized format
export interface Product {
  id?: number;
  name: string;
  description?: string;
  categoryId?: number;
  unitId?: number;
  statusId?: number;
  reference?: string;
  barcode?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stock {
  id?: number;
  productId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  location: number;
  lastUpdated?: string;
}

export interface Depot {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface StockRequest {
  productId: number;
  quantity: number;
  reservedQuantity?: number;
  location?: number;
}

export interface StockAdjustRequest {
  quantityChange?: number;
  reservedChange?: number;
  location?: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  categoryId?: number;
  unitId?: number;
  statusId?: number;
  reference?: string;
  barcode?: string;
}

export interface DepotRequest {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export type Tenant = 'acme_schema' | 'tech_schema' | 'ibaraka';

export interface TenantContext {
  currentTenant: Tenant;
  setCurrentTenant: (tenant: Tenant) => void;
}

export interface MobileViewContext {
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}

export interface StockWithDetails extends Stock {
  product?: Product;
  depot?: Depot;
}

export interface ProductWithStock extends Product {
  stock?: Stock[];
  category?: Category;
}
