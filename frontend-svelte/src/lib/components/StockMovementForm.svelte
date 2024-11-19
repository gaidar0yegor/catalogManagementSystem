<script lang="ts">
  import { onMount } from 'svelte';
  import { stockStore, type Product } from '../stores/stockStore';
  
  export let onSuccess: () => void;

  let products: Product[] = [];
  let loading = false;
  let error: string | null = null;
  let success = false;

  let selectedProduct: number | null = null;
  let quantity = 0;
  let movementType: 'IN' | 'OUT' | 'ADJUST' = 'IN';
  let notes = '';

  stockStore.subscribe(state => {
    products = state.products;
    loading = state.loading;
    error = state.error;
  });

  async function handleSubmit() {
    if (!selectedProduct || !quantity) {
      error = 'Please fill in all required fields';
      return;
    }

    try {
      await stockStore.createStockMovement({
        product: selectedProduct,
        quantity,
        movement_type: movementType,
        notes
      });
      
      success = true;
      error = null;
      selectedProduct = null;
      quantity = 0;
      notes = '';
      
      onSuccess();
    } catch (err: any) {
      error = err.message;
      success = false;
    }
  }

  onMount(() => {
    stockStore.fetchProducts();
  });
</script>

<div class="bg-white shadow sm:rounded-lg">
  <div class="px-4 py-5 sm:p-6">
    <h3 class="text-lg leading-6 font-medium text-gray-900">Create Stock Movement</h3>
    
    <form class="mt-5 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div>
        <label for="product" class="block text-sm font-medium text-gray-700">Product</label>
        <select
          id="product"
          bind:value={selectedProduct}
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={null}>Select a product</option>
          {#each products as product}
            <option value={product.id}>{product.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="movement-type" class="block text-sm font-medium text-gray-700">Movement Type</label>
        <select
          id="movement-type"
          bind:value={movementType}
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
          bind:value={quantity}
          min="0"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          bind:value={notes}
          rows="3"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      {#if error}
        <div class="text-sm text-red-600">{error}</div>
      {/if}

      {#if success}
        <div class="text-sm text-green-600">Stock movement created successfully!</div>
      {/if}

      <div class="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Create Movement'}
        </button>
      </div>
    </form>
  </div>
</div>
