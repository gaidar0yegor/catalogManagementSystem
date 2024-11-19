import { writable } from 'svelte/store';

export interface Notification {
    type: 'success' | 'error' | 'info';
    message: string;
    id: number;
}

function createNotificationStore() {
    const { subscribe, update } = writable<Notification[]>([]);

    return {
        subscribe,
        add: (type: 'success' | 'error' | 'info', message: string) => {
            const id = Date.now();
            update(notifications => [
                ...notifications,
                { type, message, id }
            ]);

            // Auto-remove after 3 seconds
            setTimeout(() => {
                update(notifications => 
                    notifications.filter(notification => notification.id !== id)
                );
            }, 3000);
        },
        remove: (id: number) => {
            update(notifications => 
                notifications.filter(notification => notification.id !== id)
            );
        }
    };
}

export const notificationStore = createNotificationStore();
