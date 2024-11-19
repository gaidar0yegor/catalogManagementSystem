<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Product, Category, Brand, Supplier } from '../stores/productStore';
  import { productStore } from '../stores/productStore';
  import { supplierStore } from '../stores/supplierStore';
  import { config } from '../config';

  export let product: Partial<Product> = {
    name: '',
    sku: '',
    barcode: '',
    description: '',
    unit_price: 0,
    purchase_price: 0,
    brand_id: undefined,
    category_id: undefined,
    supplier_id: undefined,
    is_active: true
  };
  export let isEdit = false;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error: string | null = null;
  let categories: Category[] = [];
  let brands: Brand[] = [];
  let suppliers: Supplier[] = [];

  // Subscribe to stores
  productStore.subscribe(state => {
    categories = state.categories;
    brands = state.brands;
  });

  supplierStore.subscribe(state => {
    suppliers = state.suppliers;
  });

  // Fetch data when component mounts
  productStore.fetchCategories();
  productStore.fetchBrands();
  supplierStore.fetchSuppliers();

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      // Validate required fields
      if (!product.name || !product.sku || !product.supplier_id) {
        throw new Error('Please fill in all required fields');
      }

      // Convert string IDs to numbers and ensure required fields
      const formattedProduct = {
        ...product,
        brand_id: product.brand_id ? Number(product.brand_id) : undefined,
        category_id: product.category_id ? Number(product.category_id) : undefined,
        supplier_id: Number(product.supplier_id),
        unit_price: Number(product.unit_price),
        purchase_price: Number(product.purchase_price),
        is_active: product.is_active ?? true
      };

      console.log('Form data before submission:', product);
      console.log('Formatted product data:', formattedProduct);

      // Make direct API call to debug
      const response = await fetch(config.endpoints.products, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formattedProduct.name,
          sku: formattedProduct.sku,
          barcode: formattedProduct.barcode,
          description: formattedProduct.description,
          unit_price: formattedProduct.unit_price,
          purchase_price: formattedProduct.purchase_price,
          brand: formattedProduct.brand_id,
          category: formattedProduct.category_id,
          supplier: formattedProduct.supplier_id,
          is_active: formattedProduct.is_active
        })
      });

      const responseData = await response.json();
      console.log('API Response:', response.status, responseData);

      if (!response.ok) {
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }

      dispatch('success');
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error submitting product:', error);
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
        <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
        <input
          type="text"
          id="name"
          bind:value={product.name}
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label for="sku" class="block text-sm font-medium text-gray-700">SKU *</label>
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
        <label for="supplier" class="block text-sm font-medium text-gray-700">Supplier *</label>
        <select
          id="supplier"
          bind:value={product.supplier_id}
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">Select Supplier</option>
          {#each suppliers as supplier}
            <option value={supplier.id}>{supplier.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="brand" class="block text-sm font-medium text-gray-700">Brand</label>
        <select
          id="brand"
          bind:value={product.brand_id}
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
          bind:value={product.category_id}
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
        <label for="unit_price" class="block text-sm font-medium text-gray-700">List Price *</label>
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
        <label for="purchase_price" class="block text-sm font-medium text-gray-700">Purchase Price *</label>
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
      <label for="description" class="block text-sm font-medium text-gray-700">Description *</label>
      <textarea
        id="description"
        bind:value={product.description}
        rows="4"
        required
        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      ></textarea>
    </div>

    <!-- Active Status -->
    <div class="flex items-center">
      <input
        type="checkbox"
        id="is_active"
        bind:checked={product.is_active}
        class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      />
      <label for="is_active" class="ml-2 block text-sm text-gray-900">Active</label>
    </div>

    {#if error}
      <div class="text-red-600 text-sm">{error}</div>
    {/if}

    <div class="text-sm text-gray-500">* Required fields</div>

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
