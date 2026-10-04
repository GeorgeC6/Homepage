import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gorco.me',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
