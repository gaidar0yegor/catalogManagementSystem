<script lang="ts">
  import { onMount } from 'svelte';
  import { productStore } from '../stores/productStore';
  import type { Product, Category, Brand } from '../stores/productStore';
  import ProductForm from './ProductForm.svelte';

  let searchQuery = '';
  let selectedFilters = {
    category: '',
    brand: '',
    supplier: ''
  };

  let products: Product[] = [];
  let categories: Category[] = [];
  let brands: Brand[] = [];
  let loading = false;
  let error: string | null = null;

  // Form state
  let showForm = false;
  let editingProduct: Partial<Product> | undefined = undefined;

  // Subscribe to product store
  productStore.subscribe(state => {
    products = state.products;
    categories = state.categories;
    brands = state.brands;
    loading = state.loading;
    error = state.error;
  });

  // Handle search input
  function handleSearch(): void {
    const filters: Record<string, string> = {};
    if (searchQuery) {
      filters.search = searchQuery;
    }
    if (selectedFilters.category) {
      filters.category = selectedFilters.category;
    }
    if (selectedFilters.brand) {
      filters.brand = selectedFilters.brand;
    }
    if (selectedFilters.supplier) {
      filters.supplier = selectedFilters.supplier;
    }
    productStore.fetchProducts(filters);
  }

  // Handle filter changes
  function handleFilterChange(): void {
    handleSearch();
  }

  // Handle add new product
  function handleAddNew(): void {
    editingProduct = {};
    showForm = true;
  }

  // Handle edit product
  function handleEdit(product: Product): void {
    editingProduct = { ...product };
    showForm = true;
  }

  // Handle delete product
  async function handleDelete(productId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    await productStore.deleteProduct(productId);
    productStore.fetchProducts();
  }

  // Handle form success
  function handleFormSuccess(): void {
    showForm = false;
    editingProduct = undefined;
    productStore.fetchProducts();
  }

  // Handle form cancel
  function handleFormCancel(): void {
    showForm = false;
    editingProduct = undefined;
  }

  onMount(() => {
    // Fetch initial data
    productStore.fetchProducts();
    productStore.fetchCategories();
    productStore.fetchBrands();
  });
</script>

<div class="bg-white shadow-sm rounded-lg p-6">
  <div class="mb-6 flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Product Catalog</h2>
    <div class="space-x-4">
      <button
        on:click={handleAddNew}
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Add New Product
      </button>
    </div>
  </div>

  <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- Search -->
    <div class="col-span-1 md:col-span-2">
      <input
        type="text"
        placeholder="Search products..."
        bind:value={searchQuery}
        on:input={handleSearch}
        class="w-full px-4 py-2 border rounded-md"
      />
    </div>

    <!-- Filters -->
    <div class="col-span-1">
      <select
        bind:value={selectedFilters.category}
        on:change={handleFilterChange}
        class="w-full px-4 py-2 border rounded-md"
      >
        <option value="">All Categories</option>
        {#each categories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>
    </div>

    <div class="col-span-1">
      <select
        bind:value={selectedFilters.brand}
        on:change={handleFilterChange}
        class="w-full px-4 py-2 border rounded-md"
      >
        <option value="">All Brands</option>
        {#each brands as brand}
          <option value={brand.id}>{brand.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if loading}
    <div class="text-center py-4">Loading...</div>
  {:else if error}
    <div class="text-red-600 py-4">{error}</div>
  {:else if products.length === 0}
    <div class="text-gray-500 py-4">No products found</div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each products as product (product.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand?.name || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.current_stock || 0}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.unit_price}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900 mr-2"
                  on:click={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  on:click={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Modal for Product Form -->
{#if showForm}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <ProductForm
        product={editingProduct}
        isEdit={!!editingProduct?.id}
        on:success={handleFormSuccess}
        on:cancel={handleFormCancel}
      />
    </div>
  </div>
{/if}
