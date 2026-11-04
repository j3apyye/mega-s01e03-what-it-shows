import { hydrate } from 'svelte';

const pages = import.meta.glob('/src/routes/kb/**/+page.svx');
const target = document.getElementById('app');
const load = pages[target.dataset.source];
if (!load) throw new Error(`Unknown knowledge-base page: ${target.dataset.source}`);
const page = await load();
hydrate(page.default, { target });
