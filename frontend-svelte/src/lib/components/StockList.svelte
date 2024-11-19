<script lang="ts">
  import { onMount } from 'svelte';
  import { stockStore, type Stock } from '../stores/stockStore';
  import { authStore } from '../stores/authStore';

  let stocks: Stock[] = [];
  let loading = false;
  let error: string | null = null;
  let isAuthenticated = false;

  stockStore.subscribe(state => {
    stocks = state.stocks;
    loading = state.loading;
    error = state.error;
  });

  authStore.subscribe(state => {
    isAuthenticated = !!state.token;
  });

  onMount(() => {
    if (isAuthenticated) {
      stockStore.fetchStocks();
    }
  });
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-lg">
  <div class="px-4 py-5 sm:px-6">
    <h3 class="text-lg leading-6 font-medium text-gray-900">Stock Items</h3>
  </div>

  {#if loading}
    <div class="p-4 text-center">Loading...</div>
  {:else if error}
    <div class="p-4 text-center text-red-600">{error}</div>
  {:else if stocks.length === 0}
    <div class="p-4 text-center text-gray-500">No stock items found</div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each stocks as stock (stock.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {stock.product_name}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {stock.quantity}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {stock.location}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(stock.last_checked).toLocaleDateString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if stock.quantity <= stock.minimum_threshold}
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Low Stock
                  </span>
                {:else if stock.quantity >= stock.maximum_threshold}
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Overstocked
                  </span>
                {:else}
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Normal
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
