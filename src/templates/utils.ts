import type { PackageManager } from '../types';

export const getPmCommands = (pm: PackageManager) => {
  if (pm === 'npm') return { install: ['npm ci'], run: 'npm run' };
  if (pm === 'pnpm') return { install: ['corepack enable pnpm', 'pnpm install --frozen-lockfile'], run: 'pnpm' };
  return { install: ['corepack enable yarn', 'yarn install --frozen-lockfile'], run: 'yarn' };
};

export const getCachePath = (pm: PackageManager) => {
  if (pm === 'npm') return '~/.npm';
  if (pm === 'pnpm') return '~/.local/share/pnpm/store';
  return '~/.yarn/cache';
};
