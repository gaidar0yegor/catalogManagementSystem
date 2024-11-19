<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Product, Category, Brand } from '../stores/productStore';
  import { productStore } from '../stores/productStore';
  import { config } from '../config';

  export let product: Partial<Product> = {};
  export let isEdit = false;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error: string | null = null;
  let categories: Category[] = [];
  let brands: Brand[] = [];

  // Subscribe to store for categories and brands
  productStore.subscribe(state => {
    categories = state.categories;
    brands = state.brands;
  });

  // Fetch categories and brands when component mounts
  productStore.fetchCategories();
  productStore.fetchBrands();

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      if (isEdit && product.id) {
        await productStore.updateProduct(product.id, product);
      } else {
        await productStore.createProduct(product);
      }
      dispatch('success');
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="bg-white shadow-sm rounded-lg p-6">
  <h2 class="text-2xl font-bold text-gray-900 mb-6">
    {isEdit ? 'Edit Product' : 'Add New Product'}
  </h2>

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          bind:value={product.name}
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label for="sku" class="block text-sm font-medium text-gray-700">SKU</label>
        <input
          type="text"
          id="sku"
          bind:value={product.sku}
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label for="barcode" class="block text-sm font-medium text-gray-700">Barcode</label>
        <input
          type="text"
          id="barcode"
          bind:value={product.barcode}
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label for="brand" class="block text-sm font-medium text-gray-700">Brand</label>
        <select
          id="brand"
          bind:value={product.brand}
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">Select Brand</option>
          {#each brands as brand}
            <option value={brand.id}>{brand.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
        <select
          id="category"
          bind:value={product.category}
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">Select Category</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Pricing -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="unit_price" class="block text-sm font-medium text-gray-700">List Price</label>
        <input
          type="number"
          id="unit_price"
          bind:value={product.unit_price}
          min="0"
          step="0.01"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label for="purchase_price" class="block text-sm font-medium text-gray-700">Purchase Price</label>
        <input
          type="number"
          id="purchase_price"
          bind:value={product.purchase_price}
          min="0"
          step="0.01"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        bind:value={product.description}
        rows="4"
        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      ></textarea>
    </div>

    {#if error}
      <div class="text-red-600 text-sm">{error}</div>
    {/if}

    <!-- Form Actions -->
    <div class="flex justify-end space-x-4">
      <button
        type="button"
        on:click={handleCancel}
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
      </button>
    </div>
  </form>
</div>
