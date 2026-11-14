#!/usr/bin/env node
/**
 * Zero-dependency build script for static portfolio assets.
 * Bundles and safely minifies CSS (fonts + 14 modules -> css/bundle.min.css)
 * and JS (21 IIFE modules -> js/bundle.min.js), preserving strings, template literals,
 * regex literals, SVG data URIs, and calc() spacing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

const JS_FILES = [
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
  'js/components/carousel.js',
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

/**
 * Strip CSS comments safely (preserving strings and url(...) contents) and compact whitespace.
 */
function minifyCss(source) {
  let out = '';
  let i = 0;
  const len = source.length;
  let quote = null;

  while (i < len) {
    const ch = source[i];
    const next = source[i + 1];

    if (quote) {
      out += ch;
      if (ch === '\\' && i + 1 < len) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    // Preserve url(...) contents verbatim
    if ((ch === 'u' || ch === 'U') && source.slice(i, i + 4).toLowerCase() === 'url(') {
      let depth = 0;
      let innerQuote = null;
      while (i < len) {
        const c = source[i];
        out += c;
        if (innerQuote) {
          if (c === '\\' && i + 1 < len) {
            out += source[i + 1];
            i += 2;
            continue;
          }
          if (c === innerQuote) innerQuote = null;
        } else {
          if (c === '"' || c === "'") innerQuote = c;
          else if (c === '(') depth += 1;
          else if (c === ')') {
            depth -= 1;
            if (depth <= 0) {
              i += 1;
              break;
            }
          }
        }
        i += 1;
      }
      continue;
    }

    out += ch;
    i += 1;
  }

  // Collapse whitespace line-by-line while keeping strings/url() intact
  const lines = out.split(/\r?\n/);
  const compacted = [];
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    compacted.push(trimmed.replace(/\s+/g, ' '));
  }
  return compacted.join('\n') + '\n';
}

const REGEX_PREV_KEYWORDS = new Set([
  'return',
  'throw',
  'case',
  'delete',
  'void',
  'typeof',
  'instanceof',
  'in',
  'of',
  'new',
  'await',
  'yield',
  'else',
  'do'
]);

/**
 * Strip JS comments using a character-level lexer that tracks strings,
 * template literals (including nested ${...}), and regex literals.
 */
function stripJsComments(source) {
  let out = '';
  let i = 0;
  const len = source.length;
  // Stack items: { type: 'code' } | { type: 'template' } | { type: 'expr', braceDepth: number }
  const modeStack = [{ type: 'code' }];
  let canStartRegex = true;
  let lastWord = '';
  let lastNonWsChar = '';

  function updatePrevToken(ch, word) {
    lastNonWsChar = ch;
    lastWord = word;
    if (word) {
      canStartRegex = REGEX_PREV_KEYWORDS.has(word);
      return;
    }
    if (ch === ')' || ch === ']' || ch === '}' || ch === '"' || ch === "'" || ch === '`') {
      canStartRegex = false;
    } else if (/[\w$]/.test(ch)) {
      canStartRegex = false;
    } else {
      canStartRegex = true;
    }
  }

  while (i < len) {
    const top = modeStack[modeStack.length - 1];

    if (top.type === 'template') {
      const ch = source[i];
      if (ch === '\\' && i + 1 < len) {
        out += ch + source[i + 1];
        i += 2;
        continue;
      }
      if (ch === '$' && source[i + 1] === '{') {
        out += '${';
        i += 2;
        modeStack.push({ type: 'expr', braceDepth: 0 });
        canStartRegex = true;
        lastWord = '';
        lastNonWsChar = '{';
        continue;
      }
      if (ch === '`') {
        out += '`';
        i += 1;
        modeStack.pop();
        updatePrevToken('`', '');
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }

    const ch = source[i];
    const next = source[i + 1];

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      out += ch;
      i += 1;
      continue;
    }

    // Single-line comment
    if (ch === '/' && next === '/') {
      i += 2;
      while (i < len && source[i] !== '\n') i += 1;
      continue;
    }

    // Multi-line comment
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      out += ' ';
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const q = ch;
      out += ch;
      i += 1;
      while (i < len) {
        const c = source[i];
        out += c;
        i += 1;
        if (c === '\\' && i < len) {
          out += source[i];
          i += 1;
          continue;
        }
        if (c === q) break;
      }
      updatePrevToken(q, '');
      continue;
    }

    // Template literal start
    if (ch === '`') {
      out += '`';
      i += 1;
      modeStack.push({ type: 'template' });
      continue;
    }

    // Regex literal vs division
    if (ch === '/' && canStartRegex) {
      out += '/';
      i += 1;
      let inClass = false;
      while (i < len) {
        const c = source[i];
        out += c;
        i += 1;
        if (c === '\\' && i < len) {
          out += source[i];
          i += 1;
          continue;
        }
        if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if (c === '/' && !inClass) break;
      }
      while (i < len && /[a-z]/i.test(source[i])) {
        out += source[i];
        i += 1;
      }
      updatePrevToken('/', '');
      canStartRegex = false;
      continue;
    }

    // Track template ${...} brace nesting
    if (top.type === 'expr') {
      if (ch === '{') {
        top.braceDepth += 1;
        out += ch;
        i += 1;
        updatePrevToken('{', '');
        continue;
      }
      if (ch === '}') {
        if (top.braceDepth === 0) {
          out += '}';
          i += 1;
          modeStack.pop();
          continue;
        }
        top.braceDepth -= 1;
        out += ch;
        i += 1;
        updatePrevToken('}', '');
        continue;
      }
    }

    // Identifiers / numbers
    if (/[A-Za-z_$]/.test(ch)) {
      let word = ch;
      i += 1;
      while (i < len && /[\w$]/.test(source[i])) {
        word += source[i];
        i += 1;
      }
      out += word;
      // Property access like obj.return stays an identifier, not keyword
      const isProp = lastNonWsChar === '.';
      updatePrevToken(word[word.length - 1], isProp ? '' : word);
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let num = ch;
      i += 1;
      while (i < len && /[\w.]/.test(source[i])) {
        num += source[i];
        i += 1;
      }
      out += num;
      updatePrevToken(num[num.length - 1], '');
      continue;
    }

    // Multi-char operators relevant to regex detection (e.g. ++, --, =>)
    if ((ch === '+' && next === '+') || (ch === '-' && next === '-')) {
      out += ch + next;
      i += 2;
      canStartRegex = false;
      lastNonWsChar = ch;
      lastWord = '';
      continue;
    }

    if (ch === '=' && next === '>') {
      out += '=>';
      i += 2;
      canStartRegex = true;
      lastNonWsChar = '>';
      lastWord = '';
      continue;
    }

    out += ch;
    i += 1;
    updatePrevToken(ch, '');
  }

  // Compact blank lines & trim leading indentation safely line-by-line
  const lines = out.split(/\r?\n/);
  const compacted = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    compacted.push(trimmed);
  }
  return compacted.join('\n') + '\n';
}

function buildCssBundle() {
  const parts = CSS_FILES.map((relPath) => {
    const fullPath = path.join(ROOT_DIR, relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return minifyCss(content);
  });
  const bundlePath = path.join(ROOT_DIR, 'css/bundle.min.css');
  const output = parts.join('');
  fs.writeFileSync(bundlePath, output, 'utf8');
  return { bundlePath, bytes: Buffer.byteLength(output, 'utf8') };
}

function buildJsBundle() {
  const parts = JS_FILES.map((relPath) => {
    const fullPath = path.join(ROOT_DIR, relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const stripped = stripJsComments(content).trim();
    return stripped.endsWith(';') ? stripped : `${stripped};`;
  });
  const bundlePath = path.join(ROOT_DIR, 'js/bundle.min.js');
  const output = parts.join('\n') + '\n';
  fs.writeFileSync(bundlePath, output, 'utf8');
  execFileSync(process.execPath, ['--check', bundlePath], { stdio: 'inherit' });
  return { bundlePath, bytes: Buffer.byteLength(output, 'utf8') };
}

function main() {
  const css = buildCssBundle();
  const js = buildJsBundle();
  console.log(`Built ${path.relative(ROOT_DIR, css.bundlePath)} (${(css.bytes / 1024).toFixed(1)} KB)`);
  console.log(`Built ${path.relative(ROOT_DIR, js.bundlePath)} (${(js.bytes / 1024).toFixed(1)} KB) — syntax verified`);
}

main();
