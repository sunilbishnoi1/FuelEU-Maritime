const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "../dist");

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

function shouldPatchImport(specifier) {
  // only patch relative imports
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function resolveCandidate(dir, spec) {
  // try spec + .js
  const cand1 = path.resolve(dir, spec + ".js");
  if (fs.existsSync(cand1)) return spec + ".js";

  // try spec + /index.js
  const cand2 = path.resolve(dir, spec, "index.js");
  if (fs.existsSync(cand2)) return path.posix.join(spec, "index.js");

  return null;
}

walk(DIST, (filePath) => {
  if (!filePath.endsWith(".js")) return;
  let content = fs.readFileSync(filePath, "utf8");

  // regex matches import ... from '...'; export ... from '...'; import '...';
  // capture specifier group
  const importExportRegex = /(?:from\s+|import\s+)(['"])(\.{1,2}\/[^'"]+?)\1/g;

  let changed = false;

  content = content.replace(importExportRegex, (match, quote, spec) => {
    if (!shouldPatchImport(spec)) return match;

    // if already has .js or .json extension, leave it
    if (/\.(js|json|node|mjs|cjs)$/.test(spec)) return match;

    const dir = path.dirname(filePath);
    const candidate = resolveCandidate(dir, spec);
    if (candidate) {
      changed = true;
      // preserve original quote style
      return match.replace(spec, candidate);
    } else {
      // if no candidate exists, leave unchanged
      return match;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`[patch-dist-imports] patched ${path.relative(DIST, filePath)}`);
  }
});
