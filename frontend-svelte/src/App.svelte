<script lang="ts">
  import { onMount } from 'svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import StockList from './lib/components/StockList.svelte';
  import StockMovementForm from './lib/components/StockMovementForm.svelte';
  import ProductCatalog from './lib/components/ProductCatalog.svelte';
  import SupplierManagement from './lib/components/SupplierManagement.svelte';
  import ImportSystem from './lib/components/ImportSystem.svelte';
  import Dashboard from './lib/components/Dashboard.svelte';
  import Login from './lib/components/Login.svelte';
  import { stockStore } from './lib/stores/stockStore';
  import { authStore } from './lib/stores/authStore';
  import { currentPath } from './lib/stores/routeStore';

  let isAuthenticated = false;
  let loading = true;
  let isSidebarCollapsed = false;
  let currentComponent: any = Login;

  interface NavigationEvent {
    detail: string;
  }

  // Subscribe to auth state changes
  authStore.subscribe(state => {
    isAuthenticated = !!state.token;
    loading = state.loading;
    
    // Set initial component based on auth state
    if (!loading) {
      if (isAuthenticated) {
        currentComponent = Dashboard;
      } else {
        currentComponent = Login;
      }
    }
  });

  // Handle navigation
  function navigate(path: string) {
    if (!isAuthenticated) {
      currentComponent = Login;
      return;
    }

    switch (path) {
      case '/':
      case '/dashboard':
        currentComponent = Dashboard;
        break;
      case '/products/catalog':
        currentComponent = ProductCatalog;
        break;
      case '/import':
        currentComponent = ImportSystem;
        break;
      case '/suppliers':
        currentComponent = SupplierManagement;
        break;
      case '/stock/list':
        currentComponent = StockList;
        break;
      case '/stock/movement':
        currentComponent = StockMovementForm;
        break;
      default:
        currentComponent = Dashboard;
    }
    currentPath.set(path);
  }

  function handleSidebarCollapse(event: CustomEvent<{isCollapsed: boolean}>) {
    isSidebarCollapsed = event.detail.isCollapsed;
  }

  onMount(() => {
    authStore.checkAuth();
  });
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-lg text-gray-600">Loading...</div>
  </div>
{:else if !isAuthenticated}
  <div class="min-h-screen bg-gray-50">
    <svelte:component this={currentComponent} on:navigate={(e: CustomEvent<string>) => navigate(e.detail)} />
  </div>
{:else}
  <div class="flex h-screen bg-gray-50">
    <Sidebar 
      on:collapse={handleSidebarCollapse}
      on:navigate={(e: CustomEvent<string>) => navigate(e.detail)}
    />
    
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 {isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-900">Catalog Management v0.1.2</h1>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            on:click={() => authStore.logout()}
          >
            Logout
          </button>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <svelte:component this={currentComponent} on:navigate={(e: CustomEvent<string>) => navigate(e.detail)} />
      </div>
    </main>
  </div>
{/if}

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.50);
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
  }

  main {
    min-height: 100vh;
  }
</style>
