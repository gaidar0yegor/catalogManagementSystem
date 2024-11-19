import { writable } from 'svelte/store';

export interface ImportConfig {
  id: number;
  name: string;
  import_type: 'FTP' | 'SFTP' | 'SCRAPER';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  remote_path?: string;
  schedule?: string;
  is_active: boolean;
  last_run?: string;
}

export interface WebScraperConfig {
  id: number;
  name: string;
  url: string;
  selectors: Record<string, string>;
  schedule?: string;
  is_active: boolean;
  last_run?: string;
}

export interface ImportHistory {
  id: number;
  upload_type: 'FILE' | 'API' | 'SCRAPE' | 'FTP';
  file_name?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  records_processed: number;
  records_failed: number;
  error_message?: string;
  upload_date: string;
}

interface ImportState {
  importConfigs: ImportConfig[];
  scraperConfigs: WebScraperConfig[];
  importHistory: ImportHistory[];
  loading: boolean;
  error: string | null;
}

function createImportStore() {
  const initialState: ImportState = {
    importConfigs: [],
    scraperConfigs: [],
    importHistory: [],
    loading: false,
    error: null
  };

  const { subscribe, set, update } = writable<ImportState>(initialState);

  return {
    subscribe,

    // Download file
    async downloadFile(id: number, fileName: string) {
      try {
        const response = await fetch(`/api/upload-history/${id}/download/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to download file');
        }

        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('Error downloading file:', err);
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error }));
        throw err;
      }
    },

    // Upload file
    async uploadFile(file: File) {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-history/upload-file/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to upload file');
        }

        const result = await response.json();
        
        // Update the import history immediately with the new upload
        const newHistory: ImportHistory = {
          id: result.upload_id,
          upload_type: 'FILE',
          file_name: file.name,
          status: result.status,
          records_processed: result.records_processed,
          records_failed: result.records_failed,
          upload_date: new Date().toISOString()
        };

        update(state => ({
          ...state,
          importHistory: [newHistory, ...state.importHistory],
          loading: false
        }));

        return result;
      } catch (err) {
        console.error('Error uploading file:', err);
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw err;
      }
    },

    // Import products from file
    async importProducts(file: File, columnMapping: Record<string, string>) {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('column_mapping', JSON.stringify(columnMapping));

        const response = await fetch('/api/upload-history/import-products/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to import products');
        }

        const result = await response.json();

        // Update the import history immediately with the new import
        const newHistory: ImportHistory = {
          id: result.upload_id,
          upload_type: 'FILE',
          file_name: file.name,
          status: result.status,
          records_processed: result.records_processed,
          records_failed: result.records_failed,
          upload_date: new Date().toISOString()
        };

        update(state => ({
          ...state,
          importHistory: [newHistory, ...state.importHistory],
          loading: false
        }));

        return result;
      } catch (err) {
        console.error('Error importing products:', err);
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
        throw err;
      }
    },

    // Fetch import configurations
    async fetchImportConfigs() {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch('/api/import-configs/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch import configurations');
        }

        const importConfigs = await response.json();
        update(state => ({ ...state, importConfigs, loading: false }));
      } catch (err) {
        console.error('Error fetching import configs:', err);
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Fetch scraper configurations
    async fetchScraperConfigs() {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch('/api/scraper-configs/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch scraper configurations');
        }

        const scraperConfigs = await response.json();
        update(state => ({ ...state, scraperConfigs, loading: false }));
      } catch (err) {
        console.error('Error fetching scraper configs:', err);
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Fetch import history
    async fetchImportHistory() {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch('/api/upload-history/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch import history');
        }

        const importHistory = await response.json();
        update(state => ({ 
          ...state, 
          importHistory: importHistory.sort((a: ImportHistory, b: ImportHistory) => 
            new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
          ),
          loading: false 
        }));
      } catch (err) {
        console.error('Error fetching import history:', err);
        const error = err instanceof Error ? err.message : 'An unknown error occurred';
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const importStore = createImportStore();
