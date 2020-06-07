
export function unique<T>(array: T[]): T[] {
    return array.filter((n, i) => array.indexOf(n) === i)
}
