import { writable } from 'svelte/store';
import { config } from '../config';

// Types
export interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    unit_price: number;
}

export interface Stock {
    id: number;
    product: number;
    product_name: string;
    quantity: number;
    location: string;
    last_checked: string;
    minimum_threshold: number;
    maximum_threshold: number;
}

export interface StockMovement {
    id: number;
    product: number;
    product_name: string;
    movement_type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    reference_number: string;
    timestamp: string;
    performed_by: number;
    performed_by_username: string;
    notes: string;
}

interface StockState {
    products: Product[];
    stocks: Stock[];
    movements: StockMovement[];
    lowStockItems: Stock[];
    highStockItems: Stock[];
    dailySummary: any;
    weeklySummary: any;
    loading: boolean;
    error: string | null;
}

const initialState: StockState = {
    products: [],
    stocks: [],
    movements: [],
    lowStockItems: [],
    highStockItems: [],
    dailySummary: null,
    weeklySummary: null,
    loading: false,
    error: null,
};

function createStockStore() {
    const { subscribe, set, update } = writable<StockState>(initialState);

    function handlePaginatedResponse<T>(data: any): T[] {
        if (data.results && Array.isArray(data.results)) {
            return data.results;
        }
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    }

    return {
        subscribe,
        fetchProducts: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await fetch(config.endpoints.products, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                const products = handlePaginatedResponse<Product>(data);
                update(state => ({
                    ...state,
                    products,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching products:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Failed to fetch products'
                }));
            }
        },

        fetchStocks: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await fetch(config.endpoints.stocks, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch stocks');
                const data = await response.json();
                console.log('Stock API response:', data);
                const stocks = handlePaginatedResponse<Stock>(data);
                console.log('Processed stocks:', stocks);
                
                // Only filter if stocks is an array
                const lowStockItems = Array.isArray(stocks) 
                    ? stocks.filter(stock => stock.quantity <= stock.minimum_threshold)
                    : [];
                const highStockItems = Array.isArray(stocks)
                    ? stocks.filter(stock => stock.quantity >= stock.maximum_threshold)
                    : [];

                update(state => ({
                    ...state,
                    stocks,
                    lowStockItems,
                    highStockItems,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching stocks:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Failed to fetch stocks'
                }));
            }
        },

        fetchStockMovements: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await fetch(config.endpoints.stockMovements, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch stock movements');
                const data = await response.json();
                const movements = handlePaginatedResponse<StockMovement>(data);
                update(state => ({
                    ...state,
                    movements,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching stock movements:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Failed to fetch stock movements'
                }));
            }
        },

        createStockMovement: async (movementData: Partial<StockMovement>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await fetch(config.endpoints.stockMovements, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(movementData)
                });
                if (!response.ok) throw new Error('Failed to create stock movement');
                const newMovement = await response.json();
                update(state => {
                    const updatedStocks = state.stocks.map(stock =>
                        stock.product === newMovement.product
                            ? {
                                ...stock,
                                quantity: stock.quantity + (
                                    newMovement.movement_type === 'IN' ? newMovement.quantity :
                                    newMovement.movement_type === 'OUT' ? -newMovement.quantity :
                                    0
                                )
                            }
                            : stock
                    );
                    return {
                        ...state,
                        movements: [...state.movements, newMovement],
                        stocks: updatedStocks,
                        loading: false
                    };
                });
            } catch (error: any) {
                console.error('Error creating stock movement:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Failed to create stock movement'
                }));
            }
        },

        fetchDailySummary: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await fetch(config.endpoints.dailySummary, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch daily summary');
                const data = await response.json();
                update(state => ({
                    ...state,
                    dailySummary: data,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching daily summary:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Failed to fetch daily summary'
                }));
            }
        },

        fetchWeeklySummary: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await fetch(config.endpoints.weeklySummary, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch weekly summary');
                const data = await response.json();
                update(state => ({
                    ...state,
                    weeklySummary: data,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching weekly summary:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Failed to fetch weekly summary'
                }));
            }
        },

        reset: () => set(initialState)
    };
}

export const stockStore = createStockStore();
