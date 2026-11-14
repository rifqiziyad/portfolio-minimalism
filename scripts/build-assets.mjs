#!/usr/bin/env node
/**
 * Standalone Production Build Script powered by esbuild.
 * Outputs a clean, self-contained production site inside build/:
 *   - build/css/bundle.min.css       (15 CSS modules -> minified AST)
 *   - build/js/bundle.min.js         (18 Core JS modules -> minified + mangled)
 *   - build/js/chunk-*.min.js        (3 Async JS chunks: showcase, mobile, carousel)
 *   - build/data/portfolio-data.js   (Minified portfolio data module)
 *   - build/index.html               (Minified HTML with SHA-256 ?v= cache-busting)
 *   - build/assets/**, build/robots.txt, build/sitemap.xml
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
const BUILD_DIR = path.join(ROOT_DIR, 'build');

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
  'js/animations/project-showcase.js',
  'js/animations/project-mobile.js',
  'js/animations/outline-text.js',
  'js/animations/scroll-reveal.js',
  'js/animations/parallax.js',
  'js/animations/skills.js',
  'js/animations/contact.js',
  'js/main.js'
];

const ASYNC_JS_CHUNKS = {
  carousel: {
    relOutFile: 'js/chunk-carousel.min.js',
    files: ['js/components/carousel.js']
  }
};

function shortHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanBuildDir() {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  ensureDir(path.join(BUILD_DIR, 'css'));
  ensureDir(path.join(BUILD_DIR, 'js'));
  ensureDir(path.join(BUILD_DIR, 'data'));
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

  const relOut = 'css/bundle.min.css';
  const outPath = path.join(BUILD_DIR, relOut);
  fs.writeFileSync(outPath, result.code, 'utf8');

  return {
    relPath: relOut,
    outPath,
    bytes: Buffer.byteLength(result.code, 'utf8'),
    hash: shortHash(result.code)
  };
}

async function buildJsGroup(files, relOutPath, preamble = '') {
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

  const outPath = path.join(BUILD_DIR, relOutPath);
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, result.code, 'utf8');
  execFileSync(process.execPath, ['--check', outPath], { stdio: 'inherit' });

  return {
    relPath: relOutPath,
    outPath,
    bytes: Buffer.byteLength(result.code, 'utf8'),
    hash: shortHash(result.code)
  };
}

function minifyHtml(rawHtml) {
  const preserved = [];
  let html = rawHtml.replace(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, body) => {
    const idx = preserved.length;
    if (tag.toLowerCase() === 'script' && /application\/ld\+json/i.test(attrs) && body.trim()) {
      try {
        const compacted = JSON.stringify(JSON.parse(body));
        preserved.push(`<${tag}${attrs}>${compacted}</${tag}>`);
        return `__PRESERVE_BLOCK_${idx}__`;
      } catch {
        // Fallback to raw block if JSON parse fails
      }
    }
    preserved.push(match);
    return `__PRESERVE_BLOCK_${idx}__`;
  });

  html = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();

  html = html.replace(/__PRESERVE_BLOCK_(\d+)__/g, (_, index) => preserved[Number(index)]);
  return html;
}

function buildIndexHtml(cssHash, dataJsHash, coreJsHash) {
  const srcIndexPath = path.join(ROOT_DIR, 'index.html');
  let html = fs.readFileSync(srcIndexPath, 'utf8');

  html = html.replace(
    /<!-- BUILD:CSS_START -->[\s\S]*?<!-- BUILD:CSS_END -->/,
    `<link rel="stylesheet" href="css/bundle.min.css?v=${cssHash}">`
  );

  html = html.replace(
    /<!-- BUILD:JS_START -->[\s\S]*?<!-- BUILD:JS_END -->/,
    `<script defer src="data/portfolio-data.js?v=${dataJsHash}"></script><script defer src="js/bundle.min.js?v=${coreJsHash}"></script>`
  );

  const minifiedHtml = minifyHtml(html);
  const outIndexPath = path.join(BUILD_DIR, 'index.html');
  fs.writeFileSync(outIndexPath, minifiedHtml, 'utf8');

  return {
    relPath: 'index.html',
    outPath: outIndexPath,
    bytes: Buffer.byteLength(minifiedHtml, 'utf8')
  };
}

function copyDirRecursive(srcDir, destDir) {
  ensureDir(destDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyStaticFiles() {
  copyDirRecursive(path.join(ROOT_DIR, 'assets'), path.join(BUILD_DIR, 'assets'));

  for (const file of ['robots.txt', 'sitemap.xml']) {
    const src = path.join(ROOT_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(BUILD_DIR, file));
    }
  }
}

async function main() {
  cleanBuildDir();

  const css = await buildCssBundle();

  const chunkManifest = {};
  const chunkResults = [];
  for (const [key, cfg] of Object.entries(ASYNC_JS_CHUNKS)) {
    const res = await buildJsGroup(cfg.files, cfg.relOutFile);
    chunkManifest[key] = `${res.relPath}?v=${res.hash}`;
    chunkResults.push(res);
  }

  const preamble = `window.__PORTFOLIO_CHUNKS__=${JSON.stringify(chunkManifest)};`;
  const coreJs = await buildJsGroup(CORE_JS_FILES, 'js/bundle.min.js', preamble);
  const dataJs = await buildJsGroup(['data/portfolio-data.js'], 'data/portfolio-data.js');
  const htmlRes = buildIndexHtml(css.hash, dataJs.hash, coreJs.hash);

  copyStaticFiles();

  console.log(`Built build/${htmlRes.relPath} (${(htmlRes.bytes / 1024).toFixed(1)} KB) [minified HTML]`);
  console.log(`Built build/${css.relPath}?v=${css.hash} (${(css.bytes / 1024).toFixed(1)} KB) [esbuild]`);
  console.log(`Built build/${dataJs.relPath}?v=${dataJs.hash} (${(dataJs.bytes / 1024).toFixed(1)} KB) [esbuild]`);
  console.log(`Built build/${coreJs.relPath}?v=${coreJs.hash} (${(coreJs.bytes / 1024).toFixed(1)} KB) — core [esbuild]`);
  for (const ch of chunkResults) {
    console.log(`Built build/${ch.relPath}?v=${ch.hash} (${(ch.bytes / 1024).toFixed(1)} KB) — async chunk [esbuild]`);
  }
  console.log('Copied build/assets/, build/robots.txt, build/sitemap.xml');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
