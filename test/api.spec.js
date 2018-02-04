/* eslint-env jest */
// Testing mocked APIs here
import { Assets } from '../src/services/api.js';

jest.mock('../src/services/assets.js');

// describe('Mocked Assets API', () => {
//   it('api mock works', async () => {
//     const result = await Assets.fetch([1, 2]);
//     expect(result[0].symbol).toBe('BTS');
//     expect(result[1].symbol).toBe('USD');
//   });
// });

