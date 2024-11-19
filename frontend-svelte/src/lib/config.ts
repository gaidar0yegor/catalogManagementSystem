const API_URL = import.meta.env.VITE_API_URL || '/api';

export const config = {
    apiUrl: API_URL,
    endpoints: {
        // Auth endpoints
        login: `${API_URL}/token/`,
        refresh: `${API_URL}/token/refresh/`,
        
        // Dashboard endpoints
        dashboard: `${API_URL}/dashboard/metrics/`,
        
        // Stock endpoints
        stocks: `${API_URL}/stock/`,
        stockMovements: `${API_URL}/stock-movements/`,
        dailySummary: `${API_URL}/stock-movements/daily_summary/`,
        weeklySummary: `${API_URL}/stock-movements/weekly_summary/`,
        
        // Product endpoints
        products: `${API_URL}/products/`,
        categories: `${API_URL}/categories/`,
        brands: `${API_URL}/brands/`,
        
        // Import endpoints
        importConfigs: `${API_URL}/import-configs/`,
        scraperConfigs: `${API_URL}/scraper-configs/`,
        uploadHistory: `${API_URL}/upload-history/`,
        
        // Supplier endpoints
        suppliers: `${API_URL}/suppliers/`,
        
        // Notification endpoints
        notifications: `${API_URL}/notifications/`
    }
};
