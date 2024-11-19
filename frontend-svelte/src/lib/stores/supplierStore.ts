import { writable } from 'svelte/store';
import { config } from '../config';

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

function createSupplierStore() {
  const initialState: SupplierState = {
    suppliers: [],
    loading: false,
    error: null
  };

  const { subscribe, set, update } = writable<SupplierState>(initialState);

  return {
    subscribe,

    // Fetch suppliers with optional search query
    async fetchSuppliers(searchQuery?: string) {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        const response = await fetch(`${config.endpoints.suppliers}?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }

        const data = await response.json();
        const suppliers = Array.isArray(data) ? data : data.results || [];
        
        update(state => ({ ...state, suppliers, loading: false }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Create new supplier
    async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch(config.endpoints.suppliers, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(supplierData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to create supplier');
        }

        const newSupplier = await response.json();
        update(state => ({
          ...state,
          suppliers: [...state.suppliers, newSupplier],
          loading: false
        }));
        return newSupplier;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Update existing supplier
    async updateSupplier(supplierId: number, supplierData: Partial<Supplier>): Promise<Supplier> {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch(`${config.endpoints.suppliers}${supplierId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(supplierData)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to update supplier');
        }

        const updatedSupplier = await response.json();
        update(state => ({
          ...state,
          suppliers: state.suppliers.map(s => s.id === supplierId ? updatedSupplier : s),
          loading: false
        }));
        return updatedSupplier;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Delete supplier
    async deleteSupplier(supplierId: number) {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch(`${config.endpoints.suppliers}${supplierId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to delete supplier');
        }

        update(state => ({
          ...state,
          suppliers: state.suppliers.filter(s => s.id !== supplierId),
          loading: false
        }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw new Error(error);
      }
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const supplierStore = createSupplierStore();
