# George's homepage

My personal homepage, built with Astro.

## Run locally

Use Node.js **22.12+** (Node 24 recommended).

```sh
npm install
npm run dev
```

Visit the local URL printed by Astro. Before publishing:

```sh
npm run check
npm run build
npm run preview
```

## Edit content — Markdown only

| File | What it controls |
| --- | --- |
| `src/content/pages/home.md` | Site name, name, biography, portrait crop, email, CV link, footer social links |
| `src/content/pages/hobby.md` | Hobby page title and full Markdown content |
| `src/content/pages/gallery.md` | Gallery introduction and photographs |
| `src/content/pages/contact.md` | Contact & CV page content |
| `src/content/gallery/*.md` | Tagged gallery entries and optional detail pages |
| `src/content/publications/*.md` | Tagged publications, metadata, abstract, paper/code links |
| `src/content/cards/*.md` | Optional search entries and personal pages |

The text between `---` markers is the Markdown file's YAML frontmatter. Everything below it supports headings, lists, links, images, quotes, tables, and fenced code blocks.

### Personal details

Edit the English biography in `home.md` directly. `siteName` sets the top-left wordmark independently of your full `name`. Home shows the portrait on the left, your name centered in bold below it, followed by Email and CV links, and the introduction on the right.

The footer's `socials` list in `home.md` controls its icon links. Supported `icon` values are `github`, `youtube`, `soundcloud`, and `bilibili`; `link` is the URL. Copyright uses the current build year and your configured name.

Put a portrait at `public/images/avatar.jpg`, then set:

```yaml
avatar: /images/avatar.jpg
avatarAlt: Portrait of Jin Cao
```

The current portrait uses `public/images/Photo.jpeg`. It is cropped by the page layout, preserving the original file. Adjust the crop in `home.md`:

```yaml
avatarCrop:
  scale: 1.8 # Image width relative to the square frame
  x: 0       # Horizontal offset as a percentage of the frame
  y: -45     # Vertical offset as a percentage of the frame
```

Increase `scale` to zoom in; negative offsets move the image left or up. Omit `avatarCrop` to use the image at frame width with no offset.

### Automatic image optimization

`npm run dev` and `npm run build` first run `npm run images`. This scans JPEG, PNG, WebP, AVIF, and TIFF files under `public/images/`, then generates cached 400px, 800px, and 1280px WebP variants in `public/_optimized/` without upscaling. Animated images are left unchanged. Generated files are ignored by Git and recreated in CI; source files stay unchanged.

The homepage portrait, gallery thumbnails, and gallery detail images automatically use responsive variants. The portrait loads eagerly with high priority; gallery thumbnails load lazily. Photos inserted with raw Markdown image syntax still use their original URL. Add new images before starting the dev server, or rerun `npm run images` and restart the server after adding them. Modified images get new content-hashed URLs, and unchanged variants are reused.

Put your CV at `public/cv.pdf`, then set `cv: /cv.pdf` in `home.md`. Files in `public/` are served at the root URL. Until a CV is configured, the portrait's CV link opens the CV section of the Contact & CV page. There is no placeholder PDF or broken download link.

### Gallery

Put photographs in `public/images/` and edit the `photos` list in `gallery.md`:

```yaml
photos:
  - src: /images/photo.jpg
    alt: A description of the photograph
    caption: An introduction shown over the image on hover
    date: '2026-10-04'
    format: landscape
    # href: /gallery/my-entry/
    tags: [Photography, Travel]
```

Gallery shows a vertical timeline on the left and a masonry photo collage on the right, grouped by month with the newest dates first. Titles and descriptions appear only inside a gray overlay on hover or keyboard focus. Unlinked images can also be tapped to reveal their introduction. There are no captions beneath the images or introductory paragraphs above the timeline. Dates must be quoted `YYYY-MM-DD` strings; quick photos without dates go into an Undated group.

`format` can be `auto` (original proportions), `landscape`, `portrait`, or `square`. Fixed formats crop the displayed image without modifying the source. Mixing proportions creates the collage. Optional `href` links a quick photo to its detail page; otherwise it remains on the gallery.

For an entry with its own Markdown detail page, copy `src/content/gallery/example.md`. Set `draft: false`, edit `title`, `description`, `image`, `date`, and `tags`. The title and description appear in the hover overlay. Markdown below the frontmatter creates a `/gallery/<filename>/` detail page. Leave the body empty for a photo without a detail page, or set `href` to link to a blog post or another page. `order` breaks ties for photos with the same date. The example remains a hidden draft, so the gallery stays empty until you add real entries.

### Tags and publications

Gallery and Publications share the same tag filter. Tags are automatically collected from visible entries; **All** resets the filter. Gallery keeps tags in the filter bar, leaving the photo collage free of labels. Filtering also hides empty timeline groups. Publications additionally supports clicking an item's tag. Tag matching is case insensitive. Untagged items remain visible under All. The search index includes tags, photo descriptions, and publication metadata. Drafts are excluded from pages, filters, and search.

Copy `src/content/publications/example.md` for each paper, edit its metadata and Markdown abstract, and set `draft: false`. Publications are listed at `/publications/`, newest year first. Each file also creates `/publications/<filename>/`. `links` can contain Paper, Code, DOI, or any other label and URL. The sample is a hidden draft, so no example paper is presented as a real publication. Publications have no top navigation tab yet; add a Markdown link to `/publications/` wherever you want when you have content to share.

### Add a card

Create `src/content/cards/example.md`:

```markdown
---
title: A personal project
description: A short description of the project.
label: PERSONAL PROJECT
icon: compass
order: 3
---

## About this project

Write the full description here using **Markdown**.
```

The entry appears in search and creates an `/interests/example/` page. Home contains only the portrait and introduction. Add `href: https://example.com` to index an external link instead. Set `draft: true` to omit an entry from search and generated pages.

### Search and appearance

The search index is generated from Markdown on every build. Search covers Home, Gallery, Contact & CV, Hobby, personal pages, publications, tags, and the titles/descriptions of external entries. It does not crawl the separate notes/blog websites. Open or close it with `⌘ K` on macOS or `Ctrl K` on Windows/Linux; `Esc` closes it. The navigation button and search dialog show the appropriate shortcut for the visitor's system.

Phone layouts center the portrait and collapse navigation into a **Menu** button next to a separate search icon. The menu closes on navigation, outside clicks, opening search, or Escape. Touch devices hide keyboard shortcut hints, including iPad Safari's desktop user-agent mode.

Styles are in `src/styles/global.css`. The site follows the operating system's theme initially and remembers manual changes. The round switch is fixed at the bottom right. Layouts adapt to mobile screens and respect reduced-motion preferences. Google Fonts are optional; system fonts work if the request is unavailable.

## GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys pushes to `main` (or manual runs). In GitHub, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**. For a different default branch, update the workflow's branch filter.

`astro.config.mjs`, the existing root `CNAME`, and `public/CNAME` use `gorco.me`. Configure that custom domain in GitHub Pages and enable HTTPS when DNS is ready. The generated `dist/` includes the domain file and `.nojekyll`.

The repository is [GeorgeC6/Homepage](https://github.com/GeorgeC6/Homepage), and the local folder is `Homepage`. The custom domain serves this site at its root, so no `/Homepage/` base path is needed.

Publishing requires committing and pushing the changes and configuring GitHub Pages; it is not performed by building locally.
