/* eslint-env jest */
// Testing mocked APIs here
import API from '../src/services/api.js';

jest.mock('../src/services/assets.js');

describe('Mocked Assets API', () => {
  it('api mock works', async () => {
    const result = await API.Assets.fetch(['1.3.0', '1.3.121']);
    expect(result[0].symbol).toBe('BTS');
    expect(result[1].symbol).toBe('USD');
  });
});

