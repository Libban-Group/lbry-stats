import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import * as dotenv from 'dotenv';

dotenv.config();

// https://astro.build/config
export default defineConfig({
    integrations: [mdx()],
});