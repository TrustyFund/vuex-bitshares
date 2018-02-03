/**
 * Return object with keys = id of each element of array (element.id)
 * @param {Array} array - array of data elements
 */
export const arrayToObject = (array) => {
  const obj = {};
  array.forEach(item => {
    obj[item.id] = item;
  });
  return obj;
};

/**
 * Returns array containing first and last history prices of asset.
 * @param {Array} history - array with asset's history data
 */
export const getPrices = (history) => {
  if (!history.length) return { first: 0, last: 0 };
  const startElem = history[0];
  const endElem = history[history.length - 1];
  const startPrice = startElem.open_base / startElem.open_quote;
  const endPrice = endElem.close_base / endElem.close_quote;
  return { first: startPrice, last: endPrice };
};

/**
 * Returns formatted prices for array calculated taking precision щf assets into account
 * @param {Object} prices - object with asset's history prices
 * @param {number} prices.first - first price of asset history
 * @param {number} prices.last - last price of asset history (current)
 * @param {Object} base - base asset object
 * @param {Object} quote - quote asset object
 */
export const formatPrices = (prices, base, quote) => {
  const precisionDiff = base.precision - quote.precision;

  if (precisionDiff > 0) {
    prices.first /= (precisionDiff * 10);
    prices.last /= (precisionDiff * 10);
  } else if (precisionDiff < 0) {
    prices.first = prices.first * 10 * precisionDiff;
    prices.last = prices.last * 10 * precisionDiff;
  }

  prices.change = Math.floor(((prices.last / prices.first) * 100) - 100);
  prices.first = Math.abs(prices.first).toFixed(4);
  prices.last = Math.abs(prices.last).toFixed(4);
  return prices;
};

/**
 * Returns amount of change by percent, calculated by prices history and exchange multiplier
 * @param {Object} object.prices - object with asset's history prices
 * @param {number} object.prices.first - first price of asset history
 * @param {number} object.prices.last - last price of asset history (current)
 * @param {Object} object.multiplier - object with base -> fiat exchange rates
 * @param {number} object.multiplier.first - multiplier for first history price
 * @param {number} object.multiplier.last - multiplier for last history price (current)
 */
export const calcPercentChange = (prices, multiplier) => {
  return ((((prices.last * multiplier.last) /
      (prices.first * multiplier.first)) * 100) - 100).toFixed(2);
};


/**
 * Returns object with balance in base currency, balance in fiat currency
  and change by percent
 * @param {Object} object - object containing data for calculation
 * @param {number} object.balance - balance of asset
 * @param {Object} object.assetPrices - object with asset's history prices
 * @param {number} object.assetPrices.first - first price of asset history
 * @param {number} object.assetPrices.last - last price of asset history (current)
 * @param {Object} object.fiatMultiplier - object with base -> fiat exchange rates
 * @param {number} object.fiatMultiplier.first - multiplier for first history price
 * @param {number} object.fiatMultiplier.last - multiplier for last history price (current)
 * @param {Boolean} object.isBase - the asset for calculation is base asset
 * @param {Boolean} object.isFiat - the asset for calculation is fiat asset
 */
export const calcPortfolioData = ({
  balance, assetPrices, fiatMultiplier,
  isBase, isFiat
}) => {
  let multiplier = fiatMultiplier;
  let prices = assetPrices;
  if (isFiat) multiplier = { first: 1, last: 1 };
  if (isBase) prices = { first: 1, last: 1 };
  const balanceBase = balance * prices.last;
  const balanceFiat = balanceBase * multiplier.last;
  let change = calcPercentChange(prices, multiplier);
  if (prices.last === prices.first && !isBase) change = 0;
  return { balanceBase, balanceFiat, change };
};
