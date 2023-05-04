import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, BuildOptions } from 'esbuild';
import { dTSPathAliasPlugin } from 'esbuild-plugin-d-ts-path-alias';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = 'dist';
const DIST_DIR_PATH = path.resolve(process.cwd(), DIST_DIR);

const isDev = process.env.NODE_ENV === 'development';

const baseOptions: BuildOptions = {
  platform: 'browser',
  target: 'es2020',
  entryPoints: ['./temp/esm/index.js', './temp/esm/Errors/index.js'],
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
  outdir: `${DIST_DIR}/esm`,
});

const declarationsBuild = build({
  ...baseOptions,
  entryPoints: ['./src/index.ts', './src/typings/public.ts'],
  outdir: DIST_DIR,
  write: false,
  plugins: [dTSPathAliasPlugin({ debug: true, outputPath: `${DIST_DIR}/types` })],
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

await Promise.all([esmBuild, declarationsBuild, cjsDevBuild, cjsProdBuild]);

const cjsIndex = fs.copyFile(
  path.resolve(__dirname, './index-cjs.build.js'),
  path.resolve(DIST_DIR_PATH, 'cjs/index.js'),
);

await cjsIndex;
