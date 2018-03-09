import * as types from '../mutations';
import API from '../services/api';
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
  const userAssetsIds = Object.keys(balances);

  // balance + default assets without duplication
  const filteredAssetsIdsList = userAssetsIds.concat(defaultAssetsIds.filter((id) => {
    return userAssetsIds.indexOf(id) < 0;
  }));
  const fiatIdIndex = filteredAssetsIdsList.indexOf(fiatId);
  // put fiat id at the beggining of array to calculate fiat multiplier
  filteredAssetsIdsList.unshift(filteredAssetsIdsList.splice(fiatIdIndex, 1)[0]);
  let fiatMultiplier;

  // fetch and calculate prices for each asset
  return Promise.all(filteredAssetsIdsList.map(async (id, index) => {
    let balance = (balances[id] && balances[id].balance) || 0;
    balance = balance / (10 ** assets[id].precision);
    const name = assets[id].symbol;
    commit(types.FETCH_PORTFOLIO_ASSET_REQUEST, { id, name: assets[id].symbol, balance });
    const prices = await API.Assets.fetchPriceHistory(baseAsset, assets[id], days);
    if (!index) {
      fiatMultiplier = {
        first: 1 / prices.first,
        last: 1 / prices.last
      };
    }
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
          name, balance, balanceBase, balanceFiat, change,
          precision: assets[id].precision
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
