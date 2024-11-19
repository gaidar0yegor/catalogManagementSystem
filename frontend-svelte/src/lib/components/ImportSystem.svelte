<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { importStore, type ImportConfig, type WebScraperConfig, type ImportHistory } from '../stores/importStore';
  import FtpConfigForm from './FtpConfigForm.svelte';
  import ScraperConfigForm from './ScraperConfigForm.svelte';

  let activeTab: 'file' | 'ftp' | 'scraper' | 'history' = 'file';
  let importConfigs: ImportConfig[] = [];
  let scraperConfigs: WebScraperConfig[] = [];
  let importHistory: ImportHistory[] = [];
  let loading = false;
  let error: string | null = null;
  let successMessage: string | null = null;
  let refreshInterval: number;

  // Form visibility state
  let showFtpForm = false;
  let showScraperForm = false;
  let editingFtpConfig: Partial<ImportConfig> | undefined;
  let editingScraperConfig: Partial<WebScraperConfig> | undefined;

  // File import state
  let selectedFile: File | null = null;
  let headerRow = 1;
  let dataStartRow = 2;
  let columnMapping: Record<string, string> = {};
  let previewData: any[] = [];

  // Subscribe to import store
  importStore.subscribe(state => {
    importConfigs = state.importConfigs;
    scraperConfigs = state.scraperConfigs;
    importHistory = state.importHistory;
    loading = state.loading;
    error = state.error;
  });

  // Clear messages after 5 seconds
  function clearMessages() {
    setTimeout(() => {
      error = null;
      successMessage = null;
    }, 5000);
  }

  // Refresh import history without changing tab
  async function refreshHistory() {
    try {
      await importStore.fetchImportHistory();
    } catch (err) {
      console.error('Error refreshing history:', err);
    }
  }

  // Switch to history tab (only used after successful upload)
  function switchToHistory() {
    activeTab = 'history';
  }

  // Handle file download
  async function handleDownload(id: number, fileName: string | undefined) {
    if (!fileName) {
      error = 'No file name available for download';
      clearMessages();
      return;
    }

    try {
      await importStore.downloadFile(id, fileName);
    } catch (err) {
      console.error('Download error:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred';
      clearMessages();
    }
  }

  // Handle file selection
  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    selectedFile = input.files[0];
    error = null;
    successMessage = null;

    try {
      loading = true;
      await importStore.uploadFile(selectedFile);
      successMessage = `File "${selectedFile.name}" uploaded successfully`;
      // After successful upload, refresh history and switch to history tab
      await refreshHistory();
      switchToHistory();
      // Reset form
      selectedFile = null;
      input.value = '';
      previewData = [];
      columnMapping = {};
    } catch (err) {
      console.error('Upload error:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      loading = false;
      clearMessages();
    }
  }

  // Handle file import
  async function handleFileImport() {
    if (!selectedFile) return;
    error = null;
    successMessage = null;

    try {
      loading = true;
      await importStore.importProducts(selectedFile, columnMapping);
      successMessage = `File "${selectedFile.name}" imported successfully`;
      // After successful import, refresh history and switch to history tab
      await refreshHistory();
      switchToHistory();
      // Reset form
      selectedFile = null;
      previewData = [];
      columnMapping = {};
    } catch (err) {
      console.error('Import error:', err);
      error = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      loading = false;
      clearMessages();
    }
  }

  onMount(async () => {
    await Promise.all([
      importStore.fetchImportConfigs(),
      importStore.fetchScraperConfigs(),
      importStore.fetchImportHistory()
    ]);

    // Set up auto-refresh interval
    refreshInterval = setInterval(refreshHistory, 30000);
  });

  onDestroy(() => {
    // Clean up interval when component is destroyed
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<div class="bg-white shadow-sm rounded-lg p-6">
  <h2 class="text-2xl font-bold text-gray-900 mb-6">Import System</h2>

  <!-- Success Message -->
  {#if successMessage}
    <div class="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{successMessage}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
  {#if error}
    <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="mb-6">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          class="py-4 px-1 {activeTab === 'file' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => activeTab = 'file'}
        >
          File Import
        </button>
        <button
          class="py-4 px-1 {activeTab === 'ftp' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => activeTab = 'ftp'}
        >
          FTP/SFTP
        </button>
        <button
          class="py-4 px-1 {activeTab === 'scraper' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => activeTab = 'scraper'}
        >
          Web Scraper
        </button>
        <button
          class="py-4 px-1 {activeTab === 'history' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => activeTab = 'history'}
        >
          Import History
        </button>
      </nav>
    </div>
  </div>

  {#if loading}
    <div class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Processing...</span>
      </div>
    </div>
  {:else}
    {#if activeTab === 'file'}
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Import File</label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            on:change={handleFileSelect}
            class="mt-1 block w-full"
          />
          <p class="mt-1 text-sm text-gray-500">
            Upload a CSV or Excel file containing product data.
          </p>
        </div>

        {#if selectedFile}
          <div class="flex justify-end">
            <button
              on:click={handleFileImport}
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Import Data
            </button>
          </div>
        {/if}
      </div>
    {:else if activeTab === 'history'}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each importHistory as history}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(history.upload_date).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {history.upload_type}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {history.file_name || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${history.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    history.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                    {history.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {history.records_processed} processed, {history.records_failed} failed
                  {#if history.error_message}
                    <div class="text-red-600 text-xs mt-1">{history.error_message}</div>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    on:click={() => handleDownload(history.id, history.file_name)}
                    class="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-2 rounded-md inline-flex items-center"
                  >
                    <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Download
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if activeTab === 'ftp'}
      <!-- Rest of the FTP section remains the same -->
    {:else if activeTab === 'scraper'}
      <!-- Rest of the Scraper section remains the same -->
    {/if}
  {/if}
</div>
