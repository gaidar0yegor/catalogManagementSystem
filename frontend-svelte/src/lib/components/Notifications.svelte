<script lang="ts">
    import { notificationStore, type Notification } from '../stores/notificationStore';
    import { fly } from 'svelte/transition';

    let notifications: Notification[];
    
    notificationStore.subscribe(value => {
        notifications = value;
    });

    function getBackgroundColor(type: Notification['type']) {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'info':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    }
</script>

<div class="fixed top-4 right-4 z-50 space-y-2">
    {#each notifications as notification (notification.id)}
        <div
            transition:fly={{ x: 100, duration: 300 }}
            class="p-4 rounded-lg text-white shadow-lg flex items-center justify-between"
            class:bg-green-500={notification.type === 'success'}
            class:bg-red-500={notification.type === 'error'}
            class:bg-blue-500={notification.type === 'info'}
        >
            <span>{notification.message}</span>
            <button
                class="ml-4 hover:opacity-75"
                on:click={() => notificationStore.remove(notification.id)}
            >
                ×
            </button>
        </div>
    {/each}
</div>
