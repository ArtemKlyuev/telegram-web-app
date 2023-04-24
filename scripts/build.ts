import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, BuildOptions } from 'esbuild';
import { dTSPathAliasPlugin } from 'esbuild-plugin-d-ts-path-alias';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = 'dist';

const baseOptions: BuildOptions = {
  platform: 'browser',
  target: 'es2020',
  entryPoints: ['./src/index.ts'],
  bundle: true,
  treeShaking: true,
  sourcemap: false,
  minify: false,
};

await fs.rm(DIST_DIR, { force: true, recursive: true });

const esmBuild = build({
  ...baseOptions,
  splitting: true,
  format: 'esm',
  outdir: `${DIST_DIR}/esm`,
  plugins: [dTSPathAliasPlugin({ outputPath: `${DIST_DIR}/typings`, debug: true })],
});

const cjsDevBuild = build({
  ...baseOptions,
  format: 'cjs',
  outfile: `${DIST_DIR}/cjs/telegram-web-app.development.js`,
});

const cjsProdBuild = build({
  ...baseOptions,
  format: 'cjs',
  minify: true,
  outfile: `${DIST_DIR}/cjs/telegram-web-app.production.min.js`,
});

await Promise.all([esmBuild, cjsDevBuild, cjsProdBuild]);

await fs.copyFile(
  path.resolve(__dirname, './index-cjs.build.js'),
  path.resolve(process.cwd(), `${DIST_DIR}/cjs/index.js`)
);
