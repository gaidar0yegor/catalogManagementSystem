import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { apiService } from '../../services/api';
import type { Stock, StockMovement } from '../../services/api';

interface StockState {
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
    stocks: [],
    movements: [],
    lowStockItems: [],
    highStockItems: [],
    dailySummary: null,
    weeklySummary: null,
    loading: false,
    error: null,
};

// Async thunks with proper error handling and typing
export const fetchStocks = createAsyncThunk<Stock[], void, { rejectValue: string }>(
    'stock/fetchStocks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.getStocks();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stocks');
        }
    }
);

export const fetchStockMovements = createAsyncThunk<StockMovement[], void, { rejectValue: string }>(
    'stock/fetchMovements',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-movements/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock movements');
        }
    }
);

export const createStockMovement = createAsyncThunk<StockMovement, Partial<StockMovement>, { rejectValue: string }>(
    'stock/createMovement',
    async (movementData, { rejectWithValue }) => {
        try {
            const response = await apiService.createStockMovement(movementData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create stock movement');
        }
    }
);

export const fetchDailySummary = createAsyncThunk(
    'stock/fetchDailySummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-movements/daily_summary/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily summary');
        }
    }
);

export const fetchWeeklySummary = createAsyncThunk(
    'stock/fetchWeeklySummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-movements/weekly_summary/');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly summary');
        }
    }
);

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stocks
            .addCase(fetchStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStocks.fulfilled, (state, action) => {
                state.loading = false;
                state.stocks = action.payload;
                state.lowStockItems = action.payload.filter(
                    stock => stock.quantity <= stock.minimum_threshold
                );
                state.highStockItems = action.payload.filter(
                    stock => stock.quantity >= stock.maximum_threshold
                );
            })
            .addCase(fetchStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            // Fetch Stock Movements
            .addCase(fetchStockMovements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStockMovements.fulfilled, (state, action) => {
                state.loading = false;
                state.movements = action.payload;
            })
            .addCase(fetchStockMovements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            // Create Stock Movement
            .addCase(createStockMovement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStockMovement.fulfilled, (state, action) => {
                state.loading = false;
                state.movements = [...state.movements, action.payload];
                // Refresh stocks after movement creation
                state.stocks = state.stocks.map(stock => 
                    stock.product === action.payload.product
                        ? { ...stock, quantity: stock.quantity + (
                            action.payload.movement_type === 'IN' ? action.payload.quantity :
                            action.payload.movement_type === 'OUT' ? -action.payload.quantity :
                            0
                        )}
                        : stock
                );
            })
            .addCase(createStockMovement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            // Fetch Daily Summary
            .addCase(fetchDailySummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDailySummary.fulfilled, (state, action) => {
                state.loading = false;
                state.dailySummary = action.payload;
            })
            .addCase(fetchDailySummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            // Fetch Weekly Summary
            .addCase(fetchWeeklySummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeeklySummary.fulfilled, (state, action) => {
                state.loading = false;
                state.weeklySummary = action.payload;
            })
            .addCase(fetchWeeklySummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export const { clearError, resetState } = stockSlice.actions;
export default stockSlice.reducer;
