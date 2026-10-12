import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Tenant, Product, ProductApiResponse, Stock as StockType, ApiResponse, Depot, Category } from '../types';

class ApiService {
  private api: AxiosInstance;
  private currentTenant: Tenant = 'ibaraka';

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || window.location.origin,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add tenant header
    this.api.interceptors.request.use(
      (config) => {
        config.headers['X-Tenant-ID'] = this.currentTenant;
        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        
        if (error.response?.status === 401) {
          // Handle unauthorized access
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setTenant(tenant: Tenant) {
    this.currentTenant = tenant;
  }

  getTenant(): Tenant {
    return this.currentTenant;
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  private parseNumericId(...values: any[]): number | undefined {
    for (const value of values) {
      if (value == null) continue;
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) return parsed;
      }
      if (typeof value === 'object') {
        const nestedId = this.parseNumericId(value.id, value.categoryId, value.category_id, value.category?.id);
        if (nestedId !== undefined) return nestedId;
      }
    }
    return undefined;
  }

  // Helper function to transform API product to frontend format
  private transformProduct(apiProduct: ProductApiResponse | any): Product {
    const categoryId = this.parseNumericId(
      apiProduct?.category_id,
      apiProduct?.categoryId,
      apiProduct?.category?.id,
      apiProduct?.category_id,
      apiProduct?.category?.categoryId,
      apiProduct?.category,
      apiProduct?.categoryObj,
      apiProduct?.category?.value
    );

    return {
      id: apiProduct.id,
      name: (apiProduct.name as any) || (apiProduct as any).nom || '',
      description: apiProduct.description,
      categoryId,
      reference: apiProduct.reference || '',
      barcode: (apiProduct as any).codeBarre || apiProduct.codeBarre || '',
      status: apiProduct.statut || (apiProduct as any).status,
    };
  }

  // Helper function to transform products array
  private transformProducts(apiProducts: ProductApiResponse[] | ProductApiResponse | any): Product[] {
    const products = Array.isArray(apiProducts) ? apiProducts : [apiProducts];
    return products.map(p => this.transformProduct(p));
  }

  // Helper function to transform API category to frontend format
  private transformCategory(apiCategory: any) {
    if (!apiCategory) {
      return apiCategory;
    }

    return {
      id: apiCategory.id ?? apiCategory.categoryId ?? apiCategory.category_id,
      name: apiCategory.name || apiCategory.nom || '',
      description: apiCategory.description,
      isActive: apiCategory.isActive ?? apiCategory.actif ?? true,
      createdAt: apiCategory.createdAt || apiCategory.created_at,
      updatedAt: apiCategory.updatedAt || apiCategory.updated_at,
    };
  }

  private transformCategories(apiCategories: any) {
    const categories = Array.isArray(apiCategories) ? apiCategories : [apiCategories];
    return categories.map((category) => this.transformCategory(category));
  }

  // Helper function to transform API depot to frontend format
  private transformDepot(apiDepot: any) {
    if (!apiDepot) {
      return apiDepot;
    }

    return {
      id: apiDepot.id ?? apiDepot.depotId,
      name: apiDepot.name || apiDepot.nom || apiDepot.libelle || '',
      address: apiDepot.address || apiDepot.adresse || '',
      city: apiDepot.city || apiDepot.ville || '',
      country: apiDepot.country || apiDepot.pays || '',
      postalCode: apiDepot.postalCode || apiDepot.codePostal || apiDepot.postal_code || '',
      phone: apiDepot.phone || apiDepot.telephone || '',
      email: apiDepot.email || apiDepot.mail || '',
      isActive: apiDepot.isActive ?? apiDepot.actif ?? true,
      createdAt: apiDepot.createdAt || apiDepot.created_at,
      updatedAt: apiDepot.updatedAt || apiDepot.updated_at,
    };
  }

  private transformDepots(apiDepots: any) {
    const depots = Array.isArray(apiDepots) ? apiDepots : [apiDepots];
    return depots.map((depot) => this.transformDepot(depot));
  }

  // Stock API methods
  async getStocks(productId?: number): Promise<ApiResponse<StockType[]>> {
    const url = productId ? `/Stock?productId=${productId}` : '/Stock';
    const response = await this.get<any>(url);

    if (response && response.data) {
      const stocks = this.transformStocks(response.data);
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: stocks,
      };
    }

    if (Array.isArray(response)) {
      const stocks = this.transformStocks(response);
      return {
        success: true,
        message: 'Success',
        data: stocks,
      };
    }

    return response;
  }

  /**
   * OpenAPI operationId: listStockByProductId
   * Wrapper that lists stocks, optionally scoped to a product and tenant
   */
  async listStockByProductId(productId?: number) {
    const url = productId ? `/Stock?productId=${productId}` : '/Stock';
    const response = await this.get<any>(url);
    if (response && response.data) {
      const stocks = this.transformStocks(response.data);
      return { success: response.success ?? true, message: response.message ?? 'Success', data: stocks };
    }
    if (Array.isArray(response)) {
      const stocks = this.transformStocks(response);
      return { success: true, message: 'Success', data: stocks };
    }
    return response;
  }

  private transformStock(apiStock: any): StockType {
    if (!apiStock) return apiStock;

    // helper to extract numeric id from various shapes
    const extractId = (v: any) => {
      if (v == null) return undefined;
      if (typeof v === 'number') return v;
      if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v);
        return Number.isNaN(n) ? undefined : n;
      }
      if (typeof v === 'object') {
        if ('id' in v && (typeof v.id === 'number' || typeof v.id === 'string')) return extractId(v.id);
        if ('depotId' in v) return extractId(v.depotId);
        if ('location' in v) return extractId(v.location);
      }
      return undefined;
    };

    const locationId = extractId(apiStock.location ?? apiStock.depotId ?? apiStock.depot_id ?? apiStock.depot ?? apiStock.location);
    const depotId = extractId(apiStock.depotId ?? apiStock.depot_id ?? apiStock.location ?? apiStock.depot ?? apiStock.location);

    const transformed: any = {
      id: apiStock.id ?? apiStock.stockId,
      productId: apiStock.productId ?? apiStock.product_id,
      quantity: apiStock.quantity ?? apiStock.qty ?? 0,
      reservedQuantity: apiStock.reservedQuantity ?? apiStock.reserved_quantity ?? 0,
      availableQuantity: apiStock.availableQuantity ?? apiStock.available_quantity ?? 0,
      location: locationId,
      depotId: depotId,
      lastUpdated: apiStock.lastUpdated || apiStock.updatedAt || apiStock.updated_at,
    };

    return transformed as StockType;
  }

  private transformStocks(apiStocks: any): StockType[] {
    const stocks = Array.isArray(apiStocks) ? apiStocks : [apiStocks];
    return stocks.map((s: any) => this.transformStock(s));
  }

  async getStock(id: number): Promise<ApiResponse<StockType>> {
    const response = await this.get<any>(`/Stock/${id}`);

    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformStock(response.data),
      };
    }

    return response;
  }

  /**
   * OpenAPI operationId: getStockById
   */
  async getStockById(id: number) {
    return this.getStock(id);
  }

  async createStock(stockData: any): Promise<ApiResponse<StockType>> {
    const response = await this.post<any>('/Stock', stockData);
    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformStock(response.data),
      };
    }
    if (response && response.id) {
      return { success: true, message: 'Success', data: this.transformStock(response) };
    }
    return response;
  }

  /**
   * OpenAPI operationId: createStock
   */
  async createStockOp(stockData: any) {
    return this.createStock(stockData);
  }

  async updateStock(id: number, stockData: any): Promise<ApiResponse<StockType>> {
    const response = await this.put<any>(`/Stock/${id}`, stockData);
    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformStock(response.data),
      };
    }
    return response;
  }

  /**
   * OpenAPI operationId: updateStockById
   */
  async updateStockById(id: number, stockData: any) {
    return this.updateStock(id, stockData);
  }

  async adjustStock(id: number, adjustData: any): Promise<ApiResponse<StockType>> {
    const response = await this.patch<any>(`/Stock/${id}`, adjustData);
    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformStock(response.data),
      };
    }
    return response;
  }

  /**
   * OpenAPI operationId: adjustStockById
   */
  async adjustStockById(id: number, adjustData: any) {
    return this.adjustStock(id, adjustData);
  }
  async deleteStock(id: number): Promise<ApiResponse<null>> {
    return this.delete(`/Stock/${id}`);
  }

  /**
   * OpenAPI operationId: deleteStockById
   */
  async deleteStockById(id: number) {
    return this.deleteStock(id);
  }

  // Product API methods
  async getProducts(categoryId?: number): Promise<ApiResponse<Product[]>> {
    try {
      const url = categoryId ? `/Product?categoryId=${categoryId}` : '/Product';
      const response = await this.get<any>(url);
      
      console.log('Products Response:', response);
      
      // Handle the ProductResponse format from backend
      if (response && response.data) {
        const products = this.transformProducts(response.data);
        return {
          success: response.success ?? true,
          message: response.message ?? 'Success',
          data: products,
        };
      } else if (Array.isArray(response)) {
        // If response is directly an array
        const products = this.transformProducts(response);
        return {
          success: true,
          message: 'Success',
          data: products,
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    const response = await this.get<any>(`/Product/${id}`);
    
    // Handle the ProductResponse format from backend
    if (response && response.data) {
      const product = this.transformProduct(response.data);
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: product,
      };
    }
    
    return response;
  }

  private normalizeProductPayload(productData: any, fallbackName?: string) {
    const categoryId =
      productData.categoryId ??
      productData.category_id ??
      productData.category?.id ??
      productData.categoryIdValue ??
      productData.category_id_value;

    const safeName = productData.name ?? fallbackName ?? '';
    const safeDescription = productData.description ?? '';
    const safeReference = productData.reference ?? '';
    const safeBarcode = productData.barcode ?? productData.codeBarre ?? '';
    const safeStatus = productData.status ?? productData.statut ?? '';

    return {
      name: safeName,
      description: safeDescription,
      category_id: categoryId,
      categoryId,
      reference: safeReference,
      codeBarre: safeBarcode,
      statut: safeStatus,
    };
  }

  async createProduct(productData: any): Promise<ApiResponse<Product>> {
    try {
      const payload = this.normalizeProductPayload(productData);
      
      console.log('Creating product with payload:', payload);
      const response = await this.post<any>('/Product', payload);
      
      console.log('Create Product Response:', response);
      
      if (response && response.data) {
        const product = this.transformProduct(response.data);
        return {
          success: response.success ?? true,
          message: response.message ?? 'Product created successfully',
          data: product,
        };
      } else if (response && response.id) {
        // If response is directly the product
        const product = this.transformProduct(response);
        return {
          success: true,
          message: 'Product created successfully',
          data: product,
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in createProduct:', error);
      const errorData = (error as any).response?.data;
      if (errorData) {
        console.error('Backend error details:', errorData);
        throw new Error(JSON.stringify(errorData));
      }
      throw error;
    }
  }

  async updateProduct(id: number, productData: any): Promise<ApiResponse<Product>> {
    const currentProduct = await this.getProduct(id).catch(() => null) as { data?: Product } | null;
    const fallbackName = currentProduct?.data?.name || '';
    const payload = this.normalizeProductPayload(productData, fallbackName);
    const response = await this.put<any>(`/Product/${id}`, payload);

    if (response && response.data) {
      const product = this.transformProduct(response.data);
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: product,
      };
    }
    
    return response;
  }

  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    return this.delete(`/Product/${id}`);
  }

  // Depot API methods
  async getDepots(): Promise<ApiResponse<Depot[]>> {
    const response = await this.get<any>('/Depot');

    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformDepots(response.data),
      };
    }

    if (Array.isArray(response)) {
      return {
        success: true,
        message: 'Success',
        data: this.transformDepots(response),
      };
    }

    return response;
  }

  async getDepot(id: number): Promise<ApiResponse<Depot>> {
    const response = await this.get<any>(`/Depot/${id}`);

    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformDepot(response.data),
      };
    }

    return response;
  }

  async createDepot(depotData: any): Promise<ApiResponse<Depot>> {
    const payload = {
      name: depotData.name,
      address: depotData.address,
      city: depotData.city,
      country: depotData.country,
      postalCode: depotData.postalCode,
      phone: depotData.phone,
      email: depotData.email,
      isActive: depotData.isActive,
    };

    const response = await this.post<any>('/Depot', payload);

    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformDepot(response.data),
      };
    }

    if (response && response.id) {
      return {
        success: true,
        message: 'Success',
        data: this.transformDepot(response),
      };
    }

    return response;
  }

  async updateDepot(id: number, depotData: any): Promise<ApiResponse<Depot>> {
    const payload = {
      name: depotData.name,
      address: depotData.address,
      city: depotData.city,
      country: depotData.country,
      postalCode: depotData.postalCode,
      phone: depotData.phone,
      email: depotData.email,
      isActive: depotData.isActive,
    };

    const response = await this.put<any>(`/Depot/${id}`, payload);

    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformDepot(response.data),
      };
    }

    return response;
  }

  async deleteDepot(id: number): Promise<ApiResponse<null>> {
    return this.delete(`/Depot/${id}`);
  }

  // Category API methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.get<any>('/Category');
    if (response && response.data) {
      return {
        success: response.success ?? true,
        message: response.message ?? 'Success',
        data: this.transformCategories(response.data),
      };
    }
    if (Array.isArray(response)) {
      return {
        success: true,
        message: 'Success',
        data: this.transformCategories(response),
      };
    }
    return response;
  }

  async getCategory(id: number) {
    return this.get(`/Category/${id}`);
  }

  async createCategory(categoryData: any) {
    return this.post('/Category', categoryData);
  }

  async updateCategory(id: number, categoryData: any) {
    return this.put(`/Category/${id}`, categoryData);
  }

  async deleteCategory(id: number) {
    return this.delete(`/Category/${id}`);
  }

  async getProductsByCategory(categoryId: number) {
    return this.get(`/Category/${categoryId}/products`);
  }
}

export const apiService = new ApiService();
export default apiService;
