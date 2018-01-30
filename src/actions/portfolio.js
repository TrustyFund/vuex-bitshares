import * as types from '../mutations';
import * as apis from '../services/api';
import * as utils from '../services/utils';

/**
 * Fetches data for portfolio
 * @param {Object} balances - object with balances by key as id of asset
 */
export const fetchPortfolioData = ({ commit, getters }, { balances }) => {
  const assets = getters.getAssets;
  const defaultAssetsIds = getters.getDefaultAssetsIds;
  const baseId = getters.getPortfolioBaseId;
  const base = assets[baseId];
  const currencyId = getters.getPortfolioCurrencyId;
  const currencyAsset = assets[currencyId];
  const userAssetsIds = Object.keys(balances);

  // balance + default assets without duplication
  const filteredAssetsIdsList = userAssetsIds.concat(defaultAssetsIds.filter((id) => {
    return userAssetsIds.indexOf(id) < 0;
  }));

  // fetch currency asset prices history first to calc multiplier
  const promise = new Promise((resolve) => {
    apis.fetchAssetsPriceHistory(base, currencyAsset, 7).then((prices) => {
      resolve({
        first: 1 / prices.first,
        last: 1 / prices.last
      });
    }, () => {
      console.log('error fetching currency asset');
    });
  });

  // after fetching currency asset fetch all others history and calc needed data
  promise.then((currencyMultiplier) => {
    filteredAssetsIdsList.forEach(id => {
      commit(types.FETCH_PORTFOLIO_ASSET_REQUEST, { id, name: assets[id].symbol });
      apis.fetchAssetsPriceHistory(base, assets[id], 7).then((prices) => {
        const name = assets[id].symbol;
        let balance = (balances[id] && balances[id].balance) || 0;
        balance = balance / (10 ** assets[id].precision);

        const { balanceBTS, balanceCurrency, change } = utils.calcPortfolioData({
          balance,
          prices,
          multiplier: currencyMultiplier,
          isBase: id === baseId,
          isCurrency: id === currencyId
        });

        commit(types.FETCH_PORTFOLIO_ASSET_COMPLETE, {
          id,
          data: {
            name, balance, balanceBTS, balanceCurrency, change
          }
        });
      }, () => {
        commit(types.FETCH_PORTFOLIO_ASSET_ERROR, { id });
      });
    });
  });
};

/**
 * Resets portfolio state to initial
 */
export const resetPortfolioState = ({ commit }) => {
  commit(types.RESET_PORTFOLIO_STATE);
};
