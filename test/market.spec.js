/* eslint-env jest */
import * as utils from '../src/utils';
import API from '../src/services/api';
import config from '../config';
import ApiSamples from '../__mocks__/api_samples';

describe('market service', () => {
  test('valid markets returned', async () => {
    const market = API.Market['BTS'];
    const quotes = ['USD', 'EOS'];
    const stats = await market.fetchStats(quotes);

    const usdStats = ApiSamples.get_ticker['BTS']['USD'];
    const eosStats = ApiSamples.get_ticker['BTS']['EOS'];
    
    expect(stats[0]).toEqual(usdStats);
    expect(stats[1]).toEqual(eosStats);
  })
  test('samples distribution to specified accuracy', () => {
    expect(utils.distributionSampling(
      {
        '1.3.0': 0.5700268982667804,
        '1.3.113': 0.10582752186532557,
        '1.3.121': 0.000043214634294735743,
        '1.3.861': 0.00006169457659182669,
        '1.3.973': 0.06378792759388024,
        '1.3.1042': 0.00011144826739168692,
        '1.3.1578': 0.26011570718332416,
        '1.3.1999': 0.00002558761241135669
      },
      2
    )).toEqual({
      '1.3.113': 0.11,
      '1.3.973': 0.06,
      '1.3.1578': 0.26,
      '1.3.1042': 0,
      '1.3.861': 0,
      '1.3.121': 0,
      '1.3.0': 0.57,
      '1.3.1999': 0
    });
  });
});
