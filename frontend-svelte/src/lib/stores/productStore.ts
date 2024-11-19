import { writable } from 'svelte/store';

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  unit_price: number;
  purchase_price: number;
  current_stock: number;
  brand?: {
    id: number;
    name: string;
  };
  category?: {
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

  return {
    subscribe,
    
    // Fetch products with optional filters
    async fetchProducts(filters?: Record<string, string>) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`/api/products/?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        update(state => ({ ...state, products, loading: false }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Create new product
    async createProduct(productData: Partial<Product>): Promise<Product> {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await fetch('/api/products/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(productData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to create product');
        }

        const newProduct = await response.json();
        update(state => ({
          ...state,
          products: [...state.products, newProduct],
          loading: false
        }));
        return newProduct;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Update existing product
    async updateProduct(productId: number, productData: Partial<Product>): Promise<Product> {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await fetch(`/api/products/${productId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(productData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to update product');
        }

        const updatedProduct = await response.json();
        update(state => ({
          ...state,
          products: state.products.map(p => p.id === productId ? updatedProduct : p),
          loading: false
        }));
        return updatedProduct;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Delete product
    async deleteProduct(productId: number) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await fetch(`/api/products/${productId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        update(state => ({
          ...state,
          products: state.products.filter(p => p.id !== productId),
          loading: false
        }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Fetch categories
    async fetchCategories() {
      try {
        const response = await fetch('/api/categories/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categories = await response.json();
        update(state => ({ ...state, categories }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error }));
      }
    },

    // Fetch brands
    async fetchBrands() {
      try {
        const response = await fetch('/api/brands/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }

        const brands = await response.json();
        update(state => ({ ...state, brands }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error }));
      }
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const productStore = createProductStore();
