import { writable } from 'svelte/store';
import axios from 'axios';

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

    return {
        subscribe,
        fetchProducts: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await axios.get('/api/products/');
                update(state => ({
                    ...state,
                    products: response.data,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching products:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.detail || error.message || 'Failed to fetch products'
                }));
            }
        },

        fetchStocks: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await axios.get('/api/stocks/');
                const stocks: Stock[] = response.data;
                update(state => ({
                    ...state,
                    stocks,
                    lowStockItems: stocks.filter((stock: Stock) => stock.quantity <= stock.minimum_threshold),
                    highStockItems: stocks.filter((stock: Stock) => stock.quantity >= stock.maximum_threshold),
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching stocks:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.detail || error.message || 'Failed to fetch stocks'
                }));
            }
        },

        fetchStockMovements: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await axios.get('/api/stock-movements/');
                update(state => ({
                    ...state,
                    movements: response.data,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching stock movements:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.detail || error.message || 'Failed to fetch stock movements'
                }));
            }
        },

        createStockMovement: async (movementData: Partial<StockMovement>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await axios.post('/api/stock-movements/', movementData);
                const newMovement = response.data;
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
                    error: error.response?.data?.detail || error.message || 'Failed to create stock movement'
                }));
            }
        },

        fetchDailySummary: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await axios.get('/api/stock-movements/daily_summary/');
                update(state => ({
                    ...state,
                    dailySummary: response.data,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching daily summary:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.detail || error.message || 'Failed to fetch daily summary'
                }));
            }
        },

        fetchWeeklySummary: async () => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await axios.get('/api/stock-movements/weekly_summary/');
                update(state => ({
                    ...state,
                    weeklySummary: response.data,
                    loading: false
                }));
            } catch (error: any) {
                console.error('Error fetching weekly summary:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.response?.data?.detail || error.message || 'Failed to fetch weekly summary'
                }));
            }
        },

        reset: () => set(initialState)
    };
}

export const stockStore = createStockStore();
