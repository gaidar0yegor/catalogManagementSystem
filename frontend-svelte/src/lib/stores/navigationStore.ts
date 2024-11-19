import { writable } from 'svelte/store';

export type NavigationPath = 
  | '/dashboard'
  | '/products/catalog'
  | '/import'
  | '/suppliers'
  | '/stock/list'
  | '/stock/movement';

export interface NavigationState {
  currentPath: NavigationPath;
  components: Record<NavigationPath, {
    component: any;
    props?: Record<string, unknown>;
  }>;
}

const { subscribe, set, update } = writable<NavigationState>({
  currentPath: '/dashboard',
  components: {} as Record<NavigationPath, {
    component: any;
    props?: Record<string, unknown>;
  }>
});

export const navigationStore = {
  subscribe,
  navigate: (path: NavigationPath) => 
    update(state => ({ ...state, currentPath: path })),
  registerComponents: (components: Record<NavigationPath, {
    component: any;
    props?: Record<string, unknown>;
  }>) => update(state => ({ ...state, components }))
};
