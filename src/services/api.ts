import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Tenant, Product, ProductApiResponse } from '../types';

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

  // Helper function to transform API product to frontend format
  private transformProduct(apiProduct: ProductApiResponse): Product {
    console.log('Raw API product:', apiProduct);
    return {
      id: apiProduct.id,
      name: apiProduct.nom || '',
      description: apiProduct.description,
      categoryId: apiProduct.category_id,
      reference: apiProduct.reference || '',
      barcode: apiProduct.codeBarre || '',
      status: apiProduct.statut,
    };
  }

  // Helper function to transform products array
  private transformProducts(apiProducts: ProductApiResponse[] | ProductApiResponse): Product[] {
    const products = Array.isArray(apiProducts) ? apiProducts : [apiProducts];
    return products.map(p => this.transformProduct(p));
  }

  // Stock API methods
  async getStocks(productId?: number) {
    const url = productId ? `/Stock?productId=${productId}` : '/Stock';
    return this.get(url);
  }

  async getStock(id: number) {
    return this.get(`/Stock/${id}`);
  }

  async createStock(stockData: any) {
    return this.post('/Stock', stockData);
  }

  async updateStock(id: number, stockData: any) {
    return this.put(`/Stock/${id}`, stockData);
  }

  async adjustStock(id: number, adjustData: any) {
    return this.patch(`/Stock/${id}`, adjustData);
  }

  async deleteStock(id: number) {
    return this.delete(`/Stock/${id}`);
  }

  // Product API methods
  async getProducts(categoryId?: number) {
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

  async getProduct(id: number) {
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

  async createProduct(productData: any) {
    try {
      const payload = {
        nom: productData.name || productData.nom,
        description: productData.description,
        category_id: productData.categoryId || productData.category_id,
        reference: productData.reference,
        codeBarre: productData.barcode || productData.codeBarre,
        statut: productData.status || productData.statut,
      };
      
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

  async updateProduct(id: number, productData: any) {
    const payload = {
      nom: productData.name || productData.nom,
      description: productData.description,
      category_id: productData.categoryId || productData.category_id,
      reference: productData.reference,
      codeBarre: productData.barcode || productData.codeBarre,
      statut: productData.status || productData.statut,
    };
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

  async deleteProduct(id: number) {
    return this.delete(`/Product/${id}`);
  }

  // Depot API methods
  async getDepots() {
    return this.get('/Depot');
  }

  async getDepot(id: number) {
    return this.get(`/Depot/${id}`);
  }

  async createDepot(depotData: any) {
    return this.post('/Depot', depotData);
  }

  async updateDepot(id: number, depotData: any) {
    return this.put(`/Depot/${id}`, depotData);
  }

  async deleteDepot(id: number) {
    return this.delete(`/Depot/${id}`);
  }

  // Category API methods
  async getCategories() {
    return this.get('/Category');
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
