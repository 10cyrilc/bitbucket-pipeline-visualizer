import type { PackageManager } from '../types';

export const getPmCommands = (pm: PackageManager) => {
  if (pm === 'npm') return { install: ['npm ci'], run: 'npm run', audit: 'npm audit --audit-level=high' };
  if (pm === 'pnpm') return { install: ['corepack enable pnpm', 'pnpm install --frozen-lockfile'], run: 'pnpm', audit: 'pnpm audit --prod' };
  return { install: ['corepack enable yarn', 'yarn install --frozen-lockfile'], run: 'yarn', audit: 'yarn audit' };
};

export const getCachePath = (pm: PackageManager) => {
  if (pm === 'npm') return '~/.npm';
  if (pm === 'pnpm') return '~/.local/share/pnpm/store';
  return '~/.yarn/cache';
};
