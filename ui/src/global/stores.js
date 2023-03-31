import { writable } from 'svelte/store';

export const user = writable();
export const archived_registers = writable();
export const active_registers = writable();
export const loader = writable();