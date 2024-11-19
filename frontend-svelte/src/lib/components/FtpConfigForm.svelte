<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ImportConfig } from '../stores/importStore';

  export let config: Partial<ImportConfig> = {
    import_type: 'FTP',
    is_active: true
  };
  export let isEdit = false;

  const dispatch = createEventDispatcher<{
    save: Omit<ImportConfig, 'id'>;
    cancel: void;
  }>();

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    dispatch('save', config as Omit<ImportConfig, 'id'>);
  }

  function handleCancel() {
    dispatch('cancel');
  }
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
      placeholder="e.g., Daily Product Import"
    />
  </div>

  <div>
    <label for="import_type" class="block text-sm font-medium text-gray-700">Connection Type</label>
    <select
      id="import_type"
      bind:value={config.import_type}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    >
      <option value="FTP">FTP</option>
      <option value="SFTP">SFTP</option>
    </select>
  </div>

  <div>
    <label for="host" class="block text-sm font-medium text-gray-700">Host</label>
    <input
      type="text"
      id="host"
      bind:value={config.host}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      placeholder="ftp.example.com"
    />
  </div>

  <div>
    <label for="port" class="block text-sm font-medium text-gray-700">Port</label>
    <input
      type="number"
      id="port"
      bind:value={config.port}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      placeholder="21"
    />
  </div>

  <div>
    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
    <input
      type="text"
      id="username"
      bind:value={config.username}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
  </div>

  <div>
    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
    <input
      type="password"
      id="password"
      bind:value={config.password}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
  </div>

  <div>
    <label for="remote_path" class="block text-sm font-medium text-gray-700">Remote Path</label>
    <input
      type="text"
      id="remote_path"
      bind:value={config.remote_path}
      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      placeholder="/products/import"
    />
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
      Leave empty for manual imports. Use cron expressions for scheduled imports.
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
      {isEdit ? 'Update' : 'Create'} Configuration
    </button>
  </div>
</form>
