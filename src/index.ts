import { readFileSync } from 'fs';

export * from './util';
export * from './instance';
export const version: string = JSON.parse(readFileSync('package.json', 'utf-8'))
  .version;
