<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { currentPath } from '../stores/routeStore';

  const dispatch = createEventDispatcher<{
    navigate: string;
    collapse: { isCollapsed: boolean };
  }>();

  let isCollapsed = false;

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    dispatch('collapse', { isCollapsed });
  }

  function navigate(path: string) {
    dispatch('navigate', path);
  }

  $: currentRoute = $currentPath;
</script>

<aside class="fixed inset-y-0 left-0 bg-gray-800 {isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300">
  <div class="h-16 flex items-center justify-between px-4">
    {#if !isCollapsed}
      <span class="text-white font-semibold">Catalog Management</span>
    {/if}
    <button
      class="text-gray-300 hover:text-white"
      on:click={toggleCollapse}
    >
      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {#if isCollapsed}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        {/if}
      </svg>
    </button>
  </div>

  <nav class="mt-5 px-2">
    <button
      class="group flex items-center px-2 py-2 text-base font-medium rounded-md {currentRoute === '/dashboard' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} w-full"
      on:click={() => navigate('/dashboard')}
    >
      <svg class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      {#if !isCollapsed}
        Dashboard
      {/if}
    </button>

    <button
      class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md {currentRoute === '/products/catalog' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} w-full"
      on:click={() => navigate('/products/catalog')}
    >
      <svg class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      {#if !isCollapsed}
        Products
      {/if}
    </button>

    <button
      class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md {currentRoute === '/stock/list' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} w-full"
      on:click={() => navigate('/stock/list')}
    >
      <svg class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      {#if !isCollapsed}
        Stock
      {/if}
    </button>

    <button
      class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md {currentRoute === '/suppliers' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} w-full"
      on:click={() => navigate('/suppliers')}
    >
      <svg class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {#if !isCollapsed}
        Suppliers
      {/if}
    </button>

    <button
      class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md {currentRoute === '/import' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} w-full"
      on:click={() => navigate('/import')}
    >
      <svg class="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      {#if !isCollapsed}
        Import
      {/if}
    </button>
  </nav>
</aside>
