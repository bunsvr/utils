/// <reference types='bun-types' />
import { existsSync, rmSync } from 'fs';
import pkg from './package.json';

Bun.build({
    format: 'esm',
    target: 'bun',
    outdir: '.',
    minify: true,
    entrypoints: ['./src/index.ts'],
    external: Object.keys(pkg.devDependencies)
});

// Generating types
const dir = './types';
if (existsSync(dir)) rmSync(dir, { recursive: true });

const cmd = `bun x tsc --declaration --outDir ${dir} --emitDeclarationOnly`;
Bun.spawn(cmd.split(' '), {
    stdout: 'inherit',
    stderr: 'inherit'
});
