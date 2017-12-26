import { KeyMethods } from './types/keygen';

export default function createKeyGenerator(initial?: number): KeyMethods {
  let id: number = initial || 0;

  function parse(key: string): Array<number> {
    return key.split('.').map((value: string): number => parseInt(value, 10));
  }

  return {
    keygen: {
      major: function(previous?: string): string {
        if (previous) {
          let [major] = parse(previous);
          id = major + 1;
        }
        return `${id++}.0`;
      },
      minor: function(current: string): string {
        let [major, minor] = parse(current);
        return `${major}.${minor + 1}`;
      },
      diff: function(first: string, second: string): number {
        const [firstMajor] = parse(first);
        const [secondMajor] = parse(second);
        return secondMajor - firstMajor;
      }
    }
  };
}
