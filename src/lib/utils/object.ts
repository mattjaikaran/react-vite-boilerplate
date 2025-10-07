/**
 * Object utility functions
 */

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  return Object.keys(obj).length === 0;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

export function get<T>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

export function set<T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  value: any
): T {
  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}

export function has(obj: any, path: string | string[]): boolean {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

export function mapKeys<T extends Record<string, any>>(
  obj: T,
  mapper: (key: string, value: any) => string
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[mapper(key, value)] = value;
  }
  return result;
}

export function mapValues<T extends Record<string, any>, U>(
  obj: T,
  mapper: (value: T[keyof T], key: string) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = mapper(value, key);
  }
  return result;
}

export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[String(value)] = key;
  }
  return result;
}

export function fromPairs<T>(pairs: [string, T][]): Record<string, T> {
  const result: Record<string, T> = {};
  pairs.forEach(([key, value]) => {
    result[key] = value;
  });
  return result;
}

export function toPairs<T>(obj: Record<string, T>): [string, T][] {
  return Object.entries(obj);
}

export function transform<T extends Record<string, any>, U>(
  obj: T,
  transformer: (result: U, value: any, key: string) => void,
  accumulator: U
): U {
  const result = accumulator;
  for (const [key, value] of Object.entries(obj)) {
    transformer(result, value, key);
  }
  return result;
}

export function defaults<T extends Record<string, any>>(
  obj: T,
  ...sources: Partial<T>[]
): T {
  const result = { ...obj };
  sources.forEach(source => {
    for (const key in source) {
      if (result[key] === undefined) {
        result[key] = source[key]!;
      }
    }
  });
  return result;
}
