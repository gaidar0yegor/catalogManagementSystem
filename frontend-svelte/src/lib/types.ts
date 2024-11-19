export const validPaths = [
  '/dashboard',
  '/products/catalog',
  '/import',
  '/suppliers',
  '/stock/list',
  '/stock/movement'
] as const;

export type ValidPath = typeof validPaths[number];

export interface PathChangeEvent {
  path: ValidPath;
}

export function isValidPath(path: any): path is ValidPath {
  return typeof path === 'string' && validPaths.includes(path as ValidPath);
}
