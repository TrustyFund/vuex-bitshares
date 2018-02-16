import * as types from '../mutations';
import { Assets } from '../services/api';
import * as utils from '../utils';

/**
 * Fetches and processes data for portfolio
 * @param {Object} balances - object with balances by key as id of asset
 */
export const fetchPortfolioData = async ({ commit, rootGetters }, {
  balances, baseId, fiatId, days
}) => {
  const assets = rootGetters['assets/getAssets'];
  const defaultAssetsIds = rootGetters['assets/getDefaultAssetsIds'];
  const baseAsset = assets[baseId];
  const fiatAsset = assets[fiatId];
  const userAssetsIds = Object.keys(balances);

  // balance + default assets without duplication
  const filteredAssetsIdsList = userAssetsIds.concat(defaultAssetsIds.filter((id) => {
    return userAssetsIds.indexOf(id) < 0;
  }));

    // fetch currency asset prices history first to calc multiplier
    // (to calculate fiat value of each asset)
  const fiatPrices = await Assets.fetchPriceHistory(baseAsset, fiatAsset, days);
  const fiatMultiplier = {
    first: 1 / fiatPrices.first,
    last: 1 / fiatPrices.last
  };

    // fetch and calculate prices for each asset
  return Promise.all(filteredAssetsIdsList.map(async (id) => {
    let balance = (balances[id] && balances[id].balance) || 0;
    balance = balance / (10 ** assets[id].precision);
    const name = assets[id].symbol;
    commit(types.FETCH_PORTFOLIO_ASSET_REQUEST, { id, name: assets[id].symbol, balance });

    const prices = await Assets.fetchPriceHistory(baseAsset, assets[id], days);
    if (prices) {
      const { balanceBase, balanceFiat, change } = utils.calcPortfolioData({
        balance,
        assetPrices: prices,
        fiatMultiplier,
        isBase: id === baseId,
        isFiat: id === fiatId
      });

      commit(types.FETCH_PORTFOLIO_ASSET_COMPLETE, {
        id,
        data: {
          name, balance, balanceBase, balanceFiat, change
        }
      });
    } else {
      commit(types.FETCH_PORTFOLIO_ASSET_ERROR, { id });
    }
  }));
};

/**
 * Resets portfolio state to initial
 */
export const resetPortfolioState = ({ commit }) => {
  commit(types.RESET_PORTFOLIO_STATE);
};
