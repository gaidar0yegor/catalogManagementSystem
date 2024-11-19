<script lang="ts">
  import { onMount } from 'svelte';
  import axios, { AxiosError } from 'axios';
  import { config } from '../config';
  import { authStore } from '../stores/authStore';

  interface DashboardMetrics {
    totalProducts: number;
    activeSuppliers: number;
    lowStockItems: number;
    totalValue: number;
    recentImports: Array<{
      id: number;
      date: string;
      type: string;
      status: string;
      processed: number;
      failed: number;
    }>;
    recentActivity: Array<{
      id: number;
      date: string;
      type: string;
      description: string;
    }>;
    alerts: Array<{
      id: number;
      type: string;
      message: string;
      severity: 'info' | 'warning' | 'error';
    }>;
  }

  interface ApiErrorResponse {
    error?: string;
    detail?: string;
  }

  let metrics: DashboardMetrics = {
    totalProducts: 0,
    activeSuppliers: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentImports: [],
    recentActivity: [],
    alerts: []
  };

  let loading = true;
  let error: string | null = null;
  let unsubscribe: () => void;
  let authenticated = false;

  async function fetchDashboardMetrics() {
    try {
      loading = true;
      error = null;

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Fetching dashboard metrics from:', config.endpoints.dashboard);
      console.log('Using token:', token.substring(0, 10) + '...');

      const response = await axios.get<DashboardMetrics>(config.endpoints.dashboard, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Dashboard metrics response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Ensure all required fields are present
      const requiredFields = ['totalProducts', 'activeSuppliers', 'lowStockItems', 'totalValue'];
      for (const field of requiredFields) {
        if (!(field in response.data)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      metrics = {
        ...metrics,
        ...response.data,
        // Ensure arrays are present even if backend doesn't provide them
        recentImports: response.data.recentImports || [],
        recentActivity: response.data.recentActivity || [],
        alerts: response.data.alerts || []
      };

      console.log('Updated metrics:', metrics);
    } catch (err) {
      console.error('Dashboard metrics error:', err);
      
      if (err instanceof Error) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        console.error('Error details:', {
          isAxiosError: axios.isAxiosError(err),
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          message: err.message
        });

        if (axios.isAxiosError(err)) {
          if (axiosError.response?.status === 401) {
            // Try to refresh the token
            try {
              console.log('Attempting to refresh token...');
              await authStore.checkAuth();
              // If successful, retry the fetch
              console.log('Token refresh successful, retrying fetch...');
              return fetchDashboardMetrics();
            } catch (refreshErr) {
              console.error('Token refresh failed:', refreshErr);
              error = 'Session expired. Please log in again.';
            }
          } else {
            error = axiosError.response?.data?.error || 
                   axiosError.response?.data?.detail || 
                   err.message;
          }
        } else {
          error = err.message;
        }
      } else {
        error = 'An unknown error occurred';
      }
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    console.log('Dashboard component mounted');
    // Subscribe to auth store to know when we're authenticated
    unsubscribe = authStore.subscribe(state => {
      console.log('Auth state changed:', state);
      authenticated = !!state.token;
      if (authenticated) {
        console.log('User is authenticated, fetching metrics...');
        fetchDashboardMetrics();
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });

  function formatCurrency(value: number): string {
    try {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (err) {
      console.error('Error formatting currency:', err);
      return `$${value}`;
    }
  }

  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  }
</script>

{#if loading}
  <div class="flex justify-center items-center h-64">
    <div class="text-lg text-gray-600">Loading dashboard...</div>
  </div>
{:else if error}
  <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">{error}</p>
        <button 
          class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          on:click={fetchDashboardMetrics}
        >
          Retry
        </button>
      </div>
    </div>
  </div>
{:else if !authenticated}
  <div class="flex justify-center items-center h-64">
    <div class="text-lg text-gray-600">Please log in to view the dashboard.</div>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{metrics.totalProducts}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Active Suppliers</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{metrics.activeSuppliers}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{metrics.lowStockItems}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Stock Value</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.totalValue)}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts and Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Alerts -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium text-gray-900">System Alerts</h3>
        </div>
        <div class="border-t border-gray-200">
          <div class="divide-y divide-gray-200">
            {#each metrics.alerts as alert}
              <div class="px-4 py-4 sm:px-6">
                <div class={`rounded-md p-4 ${
                  alert.severity === 'error' ? 'bg-red-50' :
                  alert.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class={`h-5 w-5 ${
                        alert.severity === 'error' ? 'text-red-400' :
                        alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                      }`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class={`text-sm font-medium ${
                        alert.severity === 'error' ? 'text-red-800' :
                        alert.severity === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                      }`}>
                        {alert.type}
                      </h3>
                      <div class={`mt-2 text-sm ${
                        alert.severity === 'error' ? 'text-red-700' :
                        alert.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                      }`}>
                        <p>{alert.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div class="border-t border-gray-200">
          <div class="flow-root">
            <ul class="-mb-8">
              {#each metrics.recentActivity as activity, index}
                <li>
                  <div class="relative pb-8">
                    {#if index !== metrics.recentActivity.length - 1}
                      <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    {/if}
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                          <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-500">{activity.description}</p>
                        </div>
                        <div class="text-right text-sm whitespace-nowrap text-gray-500">
                          <time datetime={activity.date}>{formatDate(activity.date)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Imports -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium text-gray-900">Recent Imports</h3>
      </div>
      <div class="border-t border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each metrics.recentImports as import_}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(import_.date)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {import_.type}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${import_.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      import_.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                      {import_.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {import_.processed} processed, {import_.failed} failed
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
{/if}
