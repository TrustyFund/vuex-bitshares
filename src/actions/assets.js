import * as types from '../mutations';
import * as apis from '../services/api';
import * as utils from '../services/utils';

const composeAssets = (assets) => {
  const composedAssets = {};
  assets.forEach((asset) => {
    composedAssets[asset.id] = asset;
  });
  return composedAssets;
};

export const fetchAssets = ({ commit }, assets) => {
  commit(types.FETCH_ASSETS_REQUEST);
  apis.getAssets(assets).then((result) => {
    commit(types.FETCH_ASSETS_COMPLETE, { assets: composeAssets(result) });
  }, () => {
    commit(types.FETCH_ASSETS_ERROR);
  });
};

export const fetchDefaultAssets = ({ commit }) => {
  //  TODO MOVE TO CONFIG DEFAULT ASSETS
  const defaultAssets = ['BTS', 'OPEN.EOS', 'USD', 'OPEN.OMG', 'CNY',
    'OPEN.LTC', 'OPEN.EOS', 'TRFND', 'OPEN.BTC', 'ARISTO', 'ARCOIN'];
  commit(types.FETCH_DEFAULT_ASSETS_REQUEST);

  apis.getAssets(defaultAssets).then((result) => {
    commit(types.FETCH_DEFAULT_ASSETS_COMPLETE, {
      assets: composeAssets(result)
    });
  }, () => {
    commit(types.FETCH_DEFAULT_ASSETS_ERROR);
  });
};

export const fetchAssetsPrices = ({ getters }) => {
  const assets = getters.getAssets;
  const baseId = getters.getBaseMarket;
  const base = getters.getAssetById(baseId);
  Object.keys(assets).forEach(id => {
    if (id === baseId) return;
    const quote = assets[id];
    apis.fetchStats(base, quote, 7, 3600).then((history) => {
      const prices = utils.formatPrices(utils.getPrices(history), base, quote);
      console.log(base.symbol, quote.symbol);
      console.log('PRICES', prices);
    });
  });
};

