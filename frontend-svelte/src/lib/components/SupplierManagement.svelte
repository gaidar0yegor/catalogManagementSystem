<script lang="ts">
  import { onMount } from 'svelte';
  import { supplierStore, type Supplier } from '../stores/supplierStore';

  let suppliers: Supplier[] = [];
  let loading = false;
  let error: string | null = null;
  let showForm = false;
  let editingSupplier: Supplier = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'USD',
    payment_terms: '',
    is_active: true,
    created_at: '',
    updated_at: ''
  };
  let searchQuery = '';

  // Subscribe to supplier store
  supplierStore.subscribe(state => {
    suppliers = state.suppliers;
    loading = state.loading;
    error = state.error;
  });

  // Handle search
  function handleSearch() {
    supplierStore.fetchSuppliers(searchQuery);
  }

  // Handle add new supplier
  function handleAddNew() {
    editingSupplier = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      currency: 'USD',
      payment_terms: '',
      is_active: true,
      created_at: '',
      updated_at: ''
    };
    showForm = true;
  }

  // Handle edit supplier
  function handleEdit(supplier: Supplier) {
    editingSupplier = { ...supplier };
    showForm = true;
  }

  // Handle save supplier
  async function handleSave(event: SubmitEvent) {
    event.preventDefault();
    
    try {
      if (editingSupplier.id) {
        await supplierStore.updateSupplier(editingSupplier.id, editingSupplier);
      } else {
        const { id, created_at, updated_at, ...supplierData } = editingSupplier;
        await supplierStore.createSupplier(supplierData);
      }
      showForm = false;
      editingSupplier = {
        id: 0,
        name: '',
        email: '',
        phone: '',
        address: '',
        currency: 'USD',
        payment_terms: '',
        is_active: true,
        created_at: '',
        updated_at: ''
      };
    } catch (err) {
      // Error is handled by the store
      console.error('Failed to save supplier:', err);
    }
  }

  // Handle delete supplier
  async function handleDelete(supplierId: number) {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }
    try {
      await supplierStore.deleteSupplier(supplierId);
    } catch (err) {
      // Error is handled by the store
      console.error('Failed to delete supplier:', err);
    }
  }

  // Handle form cancel
  function handleCancel() {
    showForm = false;
    editingSupplier = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      currency: 'USD',
      payment_terms: '',
      is_active: true,
      created_at: '',
      updated_at: ''
    };
  }

  onMount(() => {
    supplierStore.fetchSuppliers();
  });
</script>

<div class="bg-white shadow-sm rounded-lg p-6">
  <div class="mb-6 flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Supplier Management</h2>
    <button
      on:click={handleAddNew}
      class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      Add New Supplier
    </button>
  </div>

  <div class="mb-6">
    <input
      type="text"
      placeholder="Search suppliers..."
      bind:value={searchQuery}
      on:input={handleSearch}
      class="w-full md:w-1/2 px-4 py-2 border rounded-md"
    />
  </div>

  {#if loading}
    <div class="text-center py-4">Loading...</div>
  {:else if error}
    <div class="text-red-600 py-4">{error}</div>
  {:else if suppliers.length === 0}
    <div class="text-gray-500 py-4">No suppliers found</div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each suppliers as supplier (supplier.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{supplier.name}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{supplier.email}</div>
                <div class="text-sm text-gray-500">{supplier.phone}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.currency}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {supplier.product_count || 0} products
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900 mr-2"
                  on:click={() => handleEdit(supplier)}
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  on:click={() => handleDelete(supplier.id)}
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

<!-- Supplier Form Modal -->
{#if showForm}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        {editingSupplier.id ? 'Edit Supplier' : 'Add New Supplier'}
      </h3>

      <form on:submit={handleSave} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            id="name"
            bind:value={editingSupplier.name}
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            bind:value={editingSupplier.email}
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
            bind:value={editingSupplier.phone}
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            id="address"
            bind:value={editingSupplier.address}
            rows="3"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        <div>
          <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
          <select
            id="currency"
            bind:value={editingSupplier.currency}
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        <div>
          <label for="payment_terms" class="block text-sm font-medium text-gray-700">Payment Terms</label>
          <textarea
            id="payment_terms"
            bind:value={editingSupplier.payment_terms}
            rows="2"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        <div class="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            bind:checked={editingSupplier.is_active}
            class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label for="is_active" class="ml-2 block text-sm text-gray-900">Active</label>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            on:click={handleCancel}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            {editingSupplier.id ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
