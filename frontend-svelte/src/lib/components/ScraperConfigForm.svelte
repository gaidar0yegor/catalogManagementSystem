<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WebScraperConfig } from '../stores/importStore';

  export let config: Partial<WebScraperConfig> = {
    selectors: {
      name: '',
      price: '',
      description: '',
      sku: '',
      brand: '',
      category: ''
    },
    is_active: true
  };
  export let isEdit = false;

  const dispatch = createEventDispatcher<{
    save: Omit<WebScraperConfig, 'id'>;
    cancel: void;
  }>();

  let selectorString = JSON.stringify(config.selectors, null, 2);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    try {
      config.selectors = JSON.parse(selectorString);
      dispatch('save', config as Omit<WebScraperConfig, 'id'>);
    } catch (err) {
      alert('Invalid selector JSON format');
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function validateJson() {
    try {
      JSON.parse(selectorString);
      return true;
    } catch {
      return false;
    }
  }

  const selectorExample = `{
  "name": ".product-name",
  "price": ".product-price",
  "description": ".product-description",
  "sku": ".product-sku",
  "brand": ".product-brand",
  "category": ".product-category"
}`;
</script>

<form on:submit={handleSubmit} class="space-y-4">
  <div>
    <label for="name" class="block text-sm font-medium text-gray-700">Configuration Name</label>
    <input
      type="text"
      id="name"
      bind:value={config.name}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      placeholder="e.g., Competitor Price Scraper"
    />
  </div>

  <div>
    <label for="url" class="block text-sm font-medium text-gray-700">Target URL</label>
    <input
      type="url"
      id="url"
      bind:value={config.url}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      placeholder="https://example.com/products"
    />
  </div>

  <div>
    <label for="selectors" class="block text-sm font-medium text-gray-700">CSS Selectors</label>
    <textarea
      id="selectors"
      bind:value={selectorString}
      rows="8"
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
      placeholder={selectorExample}
    ></textarea>
    <p class="mt-1 text-sm text-gray-500">
      Enter CSS selectors for each field in JSON format. Use valid CSS selectors to target elements.
    </p>
    {#if !validateJson()}
      <p class="mt-1 text-sm text-red-600">Invalid JSON format</p>
    {/if}
  </div>

  <div>
    <label for="schedule" class="block text-sm font-medium text-gray-700">Schedule (Cron Expression)</label>
    <input
      type="text"
      id="schedule"
      bind:value={config.schedule}
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      placeholder="0 0 * * * (daily at midnight)"
    />
    <p class="mt-1 text-sm text-gray-500">
      Leave empty for manual scraping. Use cron expressions for scheduled scraping.
    </p>
  </div>

  <div class="flex items-center">
    <input
      type="checkbox"
      id="is_active"
      bind:checked={config.is_active}
      class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
    />
    <label for="is_active" class="ml-2 block text-sm text-gray-900">Active</label>
  </div>

  <div class="mt-4 p-4 bg-gray-50 rounded-md">
    <h4 class="text-sm font-medium text-gray-900 mb-2">Selector Examples:</h4>
    <ul class="text-sm text-gray-600 space-y-1">
      <li><code>.product-name</code> - Selects elements with class "product-name"</li>
      <li><code>#price</code> - Selects element with ID "price"</li>
      <li><code>.product-list .item .price</code> - Nested selector for price within product items</li>
      <li><code>[data-sku]</code> - Selects elements with "data-sku" attribute</li>
    </ul>
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
      disabled={!validateJson()}
      class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isEdit ? 'Update' : 'Create'} Configuration
    </button>
  </div>
</form>
