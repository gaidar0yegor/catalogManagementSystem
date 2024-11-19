<script lang="ts">
  import { onMount } from 'svelte';
  import { stockStore, type Stock, type StockMovement } from '../stores/stockStore';

  let loading = false;
  let error: string | null = null;
  let stocks: Stock[] = [];
  let showMovementForm = false;
  let selectedStock: Stock | null = null;

  // Movement form data
  let movementData: {
    product: string;
    movement_type: 'IN' | 'OUT' | 'ADJUST';
    quantity: number;
    reference_number: string;
    notes: string;
  } = {
    product: '',
    movement_type: 'IN',
    quantity: 0,
    reference_number: '',
    notes: ''
  };

  // Subscribe to stock store
  stockStore.subscribe(state => {
    stocks = state.stocks;
    loading = state.loading;
    error = state.error;
  });

  function handleAddMovement(stock: Stock) {
    selectedStock = stock;
    movementData = {
      product: stock.product.toString(),
      movement_type: 'IN',
      quantity: 0,
      reference_number: '',
      notes: ''
    };
    showMovementForm = true;
  }

  async function handleSubmitMovement() {
    if (!movementData.quantity || movementData.quantity <= 0) {
      error = 'Please enter a valid quantity';
      return;
    }

    try {
      await stockStore.createStockMovement({
        product: parseInt(movementData.product),
        movement_type: movementData.movement_type,
        quantity: movementData.quantity,
        reference_number: movementData.reference_number,
        notes: movementData.notes
      });
      showMovementForm = false;
      selectedStock = null;
      await stockStore.fetchStocks();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create stock movement';
    }
  }

  onMount(() => {
    stockStore.fetchStocks();
  });
</script>

<div class="bg-white shadow-sm rounded-lg p-6">
  <div class="mb-6 flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Stock Items</h2>
  </div>

  {#if loading}
    <div class="text-center py-4">Loading...</div>
  {:else if error}
    <div class="text-red-600 py-4">{error}</div>
  {:else if stocks.length === 0}
    <div class="text-gray-500 py-4">No stock items found</div>
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each stocks as stock (stock.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{stock.product_name}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {stock.quantity}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {stock.location}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(stock.last_checked).toLocaleString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if stock.quantity <= stock.minimum_threshold}
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Low Stock
                  </span>
                {:else if stock.quantity >= stock.maximum_threshold}
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    High Stock
                  </span>
                {:else}
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Normal
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900"
                  on:click={() => handleAddMovement(stock)}
                >
                  Add Movement
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Stock Movement Modal -->
{#if showMovementForm && selectedStock}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        Add Stock Movement for {selectedStock.product_name}
      </h3>

      <form on:submit|preventDefault={handleSubmitMovement} class="space-y-4">
        <div>
          <label for="movement_type" class="block text-sm font-medium text-gray-700">Movement Type</label>
          <select
            id="movement_type"
            bind:value={movementData.movement_type}
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="ADJUST">Adjustment</option>
          </select>
        </div>

        <div>
          <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            id="quantity"
            bind:value={movementData.quantity}
            min="1"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label for="reference_number" class="block text-sm font-medium text-gray-700">Reference Number</label>
          <input
            type="text"
            id="reference_number"
            bind:value={movementData.reference_number}
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            bind:value={movementData.notes}
            rows="3"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            on:click={() => {
              showMovementForm = false;
              selectedStock = null;
            }}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Save Movement
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
