import fs from 'fs';
import path from 'path';

const nativePath = path.resolve('node_modules/rollup/dist/native.js');
let code = fs.readFileSync(nativePath, 'utf8');

const target = 'const nativeModule = requireWithFriendlyError(';
const replacement = 'let nativeModule;\ntry {\n  nativeModule = require("@rollup/wasm-node/dist/native.js");\n} catch(e) {}\nif (!nativeModule) nativeModule = requireWithFriendlyError(';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(nativePath, code, 'utf8');
  console.log('Successfully patched rollup/dist/native.js with @rollup/wasm-node fallback!');
} else {
  console.log('Target already patched or not found.');
}

