import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, BuildOptions } from 'esbuild';
import { dTSPathAliasPlugin } from 'esbuild-plugin-d-ts-path-alias';

import { devDependencies, peerDependencies } from '../package.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTERNAL_PACKAGES = Object.keys({ ...devDependencies, ...peerDependencies });
const DIST_DIR = 'dist';
const DIST_DIR_PATH = path.resolve(process.cwd(), DIST_DIR);

const isDev = process.env.NODE_ENV === 'development';

const baseOptions: BuildOptions = {
  platform: 'browser',
  target: 'es2020',
  external: EXTERNAL_PACKAGES,
  entryPoints: ['./src/index.ts'],
  bundle: true,
  treeShaking: true,
  sourcemap: isDev,
  minify: false,
};

await fs.rm(DIST_DIR, { force: true, recursive: true });

const esmBuild = build({
  ...baseOptions,
  splitting: true,
  format: 'esm',
  plugins: [dTSPathAliasPlugin({ debug: true, outputPath: `${DIST_DIR}/types` })],
  outdir: `${DIST_DIR}/esm`,
});

const cjsDevBuild = build({
  ...baseOptions,
  format: 'cjs',
  outdir: `${DIST_DIR}/cjs/dev`,
});

const cjsProdBuild = build({
  ...baseOptions,
  format: 'cjs',
  minify: true,
  outdir: `${DIST_DIR}/cjs/prod`,
});

await Promise.all([esmBuild, cjsDevBuild, cjsProdBuild]);

await fs.copyFile(
  path.resolve(__dirname, './index-cjs.build.js'),
  path.resolve(DIST_DIR_PATH, 'cjs/index.js'),
);
