


export function hasProp<T>(obj: T, key: keyof T) {
  return obj[key] !== undefined;
}
