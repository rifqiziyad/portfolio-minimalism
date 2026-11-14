#!/usr/bin/env node
/**
 * Hybrid light build script powered by esbuild.
 * Performs full AST minification + variable mangling for CSS and JS,
 * splits JS into Core + Async Chunks (showcase, mobile, carousel),
 * injects SHA-256 cache-busting hashes into index.html, and runs node --check.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CSS_FILES = [
  'css/fonts.css',
  'css/variables.css',
  'css/global.css',
  'css/preloader.css',
  'css/cursor.css',
  'css/header.css',
  'css/hero.css',
  'css/portfolio.css',
  'css/portfolio-mobile.css',
  'css/carousel.css',
  'css/career.css',
  'css/skills.css',
  'css/education.css',
  'css/contact.css',
  'css/footer.css'
];

const CORE_JS_FILES = [
  'js/core/scroll.js',
  'js/core/renderer.js',
  'js/renderers/portfolio.js',
  'js/renderers/career.js',
  'js/renderers/skills.js',
  'js/renderers/education.js',
  'js/components/preloader.js',
  'js/components/crystal-backgrounds.js',
  'js/components/cursor.js',
  'js/components/navigation.js',
  'js/animations/hero.js',
  'js/animations/project-info.js',
  'js/animations/outline-text.js',
  'js/animations/scroll-reveal.js',
  'js/animations/parallax.js',
  'js/animations/skills.js',
  'js/animations/contact.js',
  'js/main.js'
];

const ASYNC_JS_CHUNKS = {
  showcase: {
    outFile: 'js/chunk-showcase.min.js',
    files: ['js/animations/project-showcase.js']
  },
  mobile: {
    outFile: 'js/chunk-mobile.min.js',
    files: ['js/animations/project-mobile.js']
  },
  carousel: {
    outFile: 'js/chunk-carousel.min.js',
    files: ['js/components/carousel.js']
  }
};

function shortHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

async function buildCssBundle() {
  const combined = CSS_FILES
    .map((relPath) => fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8'))
    .join('\n');

  const result = await esbuild.transform(combined, {
    loader: 'css',
    minify: true,
    target: 'es2020'
  });

  const bundlePath = path.join(ROOT_DIR, 'css/bundle.min.css');
  fs.writeFileSync(bundlePath, result.code, 'utf8');
  return {
    bundlePath,
    bytes: Buffer.byteLength(result.code, 'utf8'),
    hash: shortHash(result.code)
  };
}

async function buildJsGroup(files, outRelPath, preamble = '') {
  const combined = files
    .map((relPath) => {
      const src = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8').trim();
      return src.endsWith(';') ? src : `${src};`;
    })
    .join('\n');

  const source = preamble ? `${preamble}\n${combined}` : combined;
  const result = await esbuild.transform(source, {
    loader: 'js',
    minify: true,
    target: 'es2020'
  });

  const bundlePath = path.join(ROOT_DIR, outRelPath);
  fs.writeFileSync(bundlePath, result.code, 'utf8');
  execFileSync(process.execPath, ['--check', bundlePath], { stdio: 'inherit' });

  return {
    relPath: outRelPath,
    bundlePath,
    bytes: Buffer.byteLength(result.code, 'utf8'),
    hash: shortHash(result.code)
  };
}

function updateIndexCacheBusting(cssHash, coreJsHash) {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(
    /href="css\/bundle\.min\.css(?:\?v=[a-f0-9]+)?"/,
    `href="css/bundle.min.css?v=${cssHash}"`
  );
  html = html.replace(
    /src="js\/bundle\.min\.js(?:\?v=[a-f0-9]+)?"/,
    `src="js/bundle.min.js?v=${coreJsHash}"`
  );
  fs.writeFileSync(indexPath, html, 'utf8');
}

async function main() {
  const css = await buildCssBundle();

  const chunkManifest = {};
  const chunkResults = [];
  for (const [key, cfg] of Object.entries(ASYNC_JS_CHUNKS)) {
    const res = await buildJsGroup(cfg.files, cfg.outFile);
    chunkManifest[key] = `${res.relPath}?v=${res.hash}`;
    chunkResults.push(res);
  }

  const preamble = `window.__PORTFOLIO_CHUNKS__=${JSON.stringify(chunkManifest)};`;
  const coreJs = await buildJsGroup(CORE_JS_FILES, 'js/bundle.min.js', preamble);

  updateIndexCacheBusting(css.hash, coreJs.hash);

  console.log(`Built ${path.relative(ROOT_DIR, css.bundlePath)}?v=${css.hash} (${(css.bytes / 1024).toFixed(1)} KB) [esbuild]`);
  console.log(`Built ${path.relative(ROOT_DIR, coreJs.bundlePath)}?v=${coreJs.hash} (${(coreJs.bytes / 1024).toFixed(1)} KB) — core [esbuild]`);
  for (const ch of chunkResults) {
    console.log(`Built ${ch.relPath}?v=${ch.hash} (${(ch.bytes / 1024).toFixed(1)} KB) — async chunk [esbuild]`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
