import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

function excerpt(body: string = '') {
  return body.replace(/```[\s\S]*?```/g, ' ').replace(/!\[.*?\]\(.*?\)/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]*>/g, ' ').replace(/[#*_>`~|]/g, '').replace(/\s+/g, ' ').trim();
}

export const GET: APIRoute = async () => {
  const pages = await getCollection('pages');
  const cards = await getCollection('cards', ({ data }) => !data.draft);
  const gallery = await getCollection('gallery', ({ data }) => !data.draft);
  const publications = await getCollection('publications', ({ data }) => !data.draft);
  const entries = [
    ...pages.sort((a, b) => a.id === 'home' ? -1 : b.id === 'home' ? 1 : a.id.localeCompare(b.id)).map(page => ({ title: page.id === 'home' ? 'Home — About me' : page.data.title, description: page.data.description, text: [excerpt(page.body), ...page.data.tags, ...page.data.photos.flatMap(photo => [photo.caption || '', photo.alt, ...photo.tags])].join(' '), url: page.id === 'home' ? '/' : `/${page.id}/`, external: false })),
    ...cards.sort((a, b) => a.data.order - b.data.order).map(card => ({ title: card.data.title, description: card.data.description, text: [excerpt(card.body), ...card.data.tags].join(' '), url: card.data.href || `/interests/${card.id}/`, external: /^https?:\/\//.test(card.data.href || '') })),
    ...gallery.map(item => ({ title: item.data.title, description: item.data.description, text: [excerpt(item.body), item.data.date, item.data.imageAlt || '', ...item.data.tags].join(' '), url: item.data.href || (item.body?.trim() ? `/gallery/${item.id}/` : '/gallery/'), external: /^https?:\/\//.test(item.data.href || '') })),
    ...(publications.length ? [{ title: 'Publications', description: 'Publications by Jin Cao.', text: '', url: '/publications/', external: false }] : []),
    ...publications.map(item => ({ title: item.data.title, description: item.data.description, text: [excerpt(item.body), ...item.data.authors, item.data.venue || '', String(item.data.year), ...item.data.tags].join(' '), url: `/publications/${item.id}/`, external: false })),
  ];
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json' } });
};
