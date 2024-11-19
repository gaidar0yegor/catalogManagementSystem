import { writable } from 'svelte/store';
import { config } from '../config';

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  unit_price: number;
  purchase_price: number;
  current_stock: number;
  brand_id?: number;
  category_id?: number;
  supplier_id: number;
  brand?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  supplier: {
    id: number;
    name: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

function createProductStore() {
  const initialState: ProductState = {
    products: [],
    categories: [],
    brands: [],
    loading: false,
    error: null
  };

  const { subscribe, set, update } = writable<ProductState>(initialState);

  function handlePaginatedResponse<T>(data: any): T[] {
    console.log('API Response:', data);
    // Handle both paginated and non-paginated responses
    if (data.results && Array.isArray(data.results)) {
      console.log('Returning paginated results:', data.results);
      return data.results;
    }
    if (Array.isArray(data)) {
      console.log('Returning array results:', data);
      return data;
    }
    console.log('No valid data found, returning empty array');
    return [];
  }

  return {
    subscribe,
    
    // Fetch products with optional filters
    async fetchProducts(filters?: Record<string, string>) {
      update(state => ({ ...state, loading: true, error: null }));
      console.log('Fetching products with filters:', filters);
      
      try {
        const queryParams = new URLSearchParams(filters);
        const url = `${config.endpoints.products}?${queryParams.toString()}`;
        console.log('Fetching products from URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log('Products API response:', data);
        const products = handlePaginatedResponse<Product>(data);
        console.log('Processed products:', products);
        update(state => ({ ...state, products, loading: false }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching products:', error);
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Create new product
    async createProduct(productData: Partial<Product>): Promise<Product> {
      update(state => ({ ...state, loading: true, error: null }));
      console.log('Creating product with data:', productData);
      
      try {
        const response = await fetch(config.endpoints.products, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...productData,
            brand: productData.brand_id,
            category: productData.category_id,
            supplier: productData.supplier_id
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to create product');
        }

        const newProduct = await response.json();
        console.log('Created product:', newProduct);
        update(state => ({
          ...state,
          products: [...state.products, newProduct],
          loading: false
        }));
        return newProduct;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error creating product:', error);
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Update existing product
    async updateProduct(productId: number, productData: Partial<Product>): Promise<Product> {
      update(state => ({ ...state, loading: true, error: null }));
      console.log('Updating product:', productId, 'with data:', productData);
      
      try {
        const response = await fetch(`${config.endpoints.products}${productId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...productData,
            brand: productData.brand_id,
            category: productData.category_id,
            supplier: productData.supplier_id
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to update product');
        }

        const updatedProduct = await response.json();
        console.log('Updated product:', updatedProduct);
        update(state => ({
          ...state,
          products: state.products.map(p => p.id === productId ? updatedProduct : p),
          loading: false
        }));
        return updatedProduct;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error updating product:', error);
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Delete product
    async deleteProduct(productId: number) {
      update(state => ({ ...state, loading: true, error: null }));
      console.log('Deleting product:', productId);
      
      try {
        const response = await fetch(`${config.endpoints.products}${productId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        console.log('Product deleted successfully');
        update(state => ({
          ...state,
          products: state.products.filter(p => p.id !== productId),
          loading: false
        }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error deleting product:', error);
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Fetch categories
    async fetchCategories() {
      console.log('Fetching categories from:', config.endpoints.categories);
      try {
        const response = await fetch(config.endpoints.categories, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        console.log('Categories API response:', data);
        const categories = handlePaginatedResponse<Category>(data);
        console.log('Processed categories:', categories);
        update(state => ({ ...state, categories }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching categories:', error);
        update(state => ({ ...state, error }));
      }
    },

    // Fetch brands
    async fetchBrands() {
      console.log('Fetching brands from:', config.endpoints.brands);
      try {
        const response = await fetch(config.endpoints.brands, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }

        const data = await response.json();
        console.log('Brands API response:', data);
        const brands = handlePaginatedResponse<Brand>(data);
        console.log('Processed brands:', brands);
        update(state => ({ ...state, brands }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching brands:', error);
        update(state => ({ ...state, error }));
      }
    },

    // Reset store
    reset() {
      console.log('Resetting product store');
      set(initialState);
    }
  };
}

export const productStore = createProductStore();
