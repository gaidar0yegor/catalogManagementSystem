<script lang="ts">
  import StockList from './lib/components/StockList.svelte';
  import StockMovementForm from './lib/components/StockMovementForm.svelte';
  import { stockStore } from './lib/stores/stockStore';

  let activeTab: 'list' | 'movement' = 'list';

  function handleMovementSuccess() {
    stockStore.fetchStocks();
    activeTab = 'list';
  }
</script>

<main class="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Stock Management System</h1>
  </header>

  <div class="mb-6">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          class="py-4 px-1 {activeTab === 'list' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => activeTab = 'list'}
        >
          Stock List
        </button>
        <button
          class="py-4 px-1 {activeTab === 'movement' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
          on:click={() => activeTab = 'movement'}
        >
          Stock Movement
        </button>
      </nav>
    </div>
  </div>

  <div class="mt-6">
    {#if activeTab === 'list'}
      <StockList />
    {:else if activeTab === 'movement'}
      <StockMovementForm onSuccess={handleMovementSuccess} />
    {/if}
  </div>
</main>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.50);
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
