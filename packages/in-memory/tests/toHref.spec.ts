import 'jest';
import InMemory from '../src';

describe('toHref', () => {
  it('returns the location formatted as a string', () => {
    const testHistory = InMemory({
      locations: [{ pathname: '/one', query: 'test=query' }]
    });

    const currentPath = testHistory.toHref(testHistory.location);
    expect(currentPath).toBe('/one?test=query');
  });
});
