export function mapValues<T extends object, U>(
  record: T,
  mapper: (value: T[keyof T]) => U
): Record<keyof T, U> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, mapper(value)])
  ) as any;
}
