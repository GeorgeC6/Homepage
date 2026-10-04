import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tags = z.array(z.string().trim().min(1)).default([]);
const links = z.array(z.object({ label: z.string(), href: z.string() })).default([]);
const galleryDate = z.iso.date();
const galleryFormat = z.enum(['auto', 'landscape', 'portrait', 'square']).default('auto');

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    name: z.string().optional(),
    siteName: z.string().optional(),
    avatar: z.string().optional(),
    avatarAlt: z.string().optional(),
    avatarCrop: z.object({
      scale: z.number().min(1).max(4).default(1),
      x: z.number().min(-300).max(100).default(0),
      y: z.number().min(-500).max(100).default(0),
    }).optional(),
    email: z.email().optional(),
    cv: z.string().optional(),
    github: z.url().optional(),
    socials: z.array(z.object({
      icon: z.enum(['github', 'youtube', 'soundcloud', 'bilibili']),
      link: z.url(),
    })).default([]),
    tags,
    links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    photos: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      date: galleryDate.optional(),
      href: z.string().optional(),
      format: galleryFormat,
      tags,
    })).default([]),
  }),
});

const cards = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cards' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    label: z.string(),
    href: z.string().optional(),
    icon: z.enum(['book', 'pen', 'compass']).default('book'),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    tags,
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    date: galleryDate,
    format: galleryFormat,
    imageAlt: z.string().optional(),
    href: z.string().optional(),
    tags,
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    authors: z.array(z.string()).default([]),
    year: z.number().int(),
    venue: z.string().optional(),
    tags,
    links,
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages, cards, gallery, publications };
