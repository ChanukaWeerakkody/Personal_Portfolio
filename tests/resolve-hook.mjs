import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const subpath = specifier.slice(2);
    const basePath = path.resolve(process.cwd(), 'src', subpath);
    
    // Check direct file, or with .js, .jsx, .json
    let resolvedPath = basePath;
    if (!fs.existsSync(resolvedPath)) {
      if (fs.existsSync(basePath + '.js')) resolvedPath = basePath + '.js';
      else if (fs.existsSync(basePath + '.jsx')) resolvedPath = basePath + '.jsx';
      else if (fs.existsSync(basePath + '.json')) resolvedPath = basePath + '.json';
    }
    return nextResolve(pathToFileURL(resolvedPath).href, context);
  }
  return nextResolve(specifier, context);
}
