import { Aes, TransactionHelper } from 'bitsharesjs';
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
  prices.first = Math.abs(prices.first);
  prices.last = Math.abs(prices.last);
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
  return ((((prices.first * multiplier.first) /
    (prices.last * multiplier.last)) * 100) - 100);
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

export const encryptMemo = (memo, fromKey, toPubkey) => {
  const nonce = TransactionHelper.unique_nonce_uint64();
  const activePubkey = fromKey.toPublicKey().toPublicKeyString();

  const message = Aes.encrypt_with_checksum(
    fromKey,
    toPubkey,
    nonce,
    memo
  );

  return {
    from: activePubkey,
    to: toPubkey,
    nonce,
    message
  };
};

export const decryptMemo = (memo, privateKey) => {
  return Aes.decrypt_with_checksum(
    privateKey,
    memo.from,
    memo.nonce,
    memo.message
  ).toString('utf-8');
};


/** Calculates distribution 0..1 of total amount of assets expressed
 * in base asset
 * @param {Object} balances - {assetId: baseAssetValue}
 */
export const distributionFromBalances = (balances) => {
  const total = Object.keys(balances).reduce((res, key) => res + balances[key], 0);
  return Object.keys(balances).reduce(
    (res, key) => Object.assign(res, { [key]: balances[key] / total }),
    {}
  );
};

/** Corrects distributions to values multiple to 10**accuracy,
 * keeps summary proportions value equal to 1
 * @param {Object} proportions - {assetId: rawProportionValue}
 * @param {number} accuracy - number of digits after point
 */
export const distributionSampling = (proportions, accuracy) => {
  const positiveExponent = `e+${accuracy}`;
  const negativeExponent = `e-${accuracy}`;
  const distributionInfo = Object.keys(proportions).map(key => {
    // proportions rounded dawnward to nearest miltiple of 10 ** accuracy
    const floored = +(Math.floor(proportions[key] + positiveExponent) + negativeExponent);
    const remainder = proportions[key] - floored;
    return ({
      floored,
      remainder,
      assetId: key
    });
  });
  // summary proporions correction error
  const correctionError = distributionInfo
    .reduce((res, { floored }) => res - floored, 1);
  const proportionsToCorrect = Math.round(correctionError + positiveExponent);
  // if summary error greater than 10**accuracy,
  // then correct top n proportions sorted by remainder descending,
  // where n = error/10**accuracy
  distributionInfo
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, proportionsToCorrect)
    .forEach(({ assetId }) => {
      const index = distributionInfo.findIndex(info => assetId === info.assetId);
      const integerValue = +(distributionInfo[index].floored + positiveExponent);
      const correctedInteger = Math.floor(integerValue + 1);
      distributionInfo[index].floored = +(correctedInteger + negativeExponent);
    });

  return distributionInfo.reduce(
    (r, { floored, assetId }) => Object.assign(r, { [assetId]: floored }),
    {}
  );
};

export const createOrder = ({ sell, receive, userId }) => {
  const expiration = new Date();
  expiration.setYear(expiration.getFullYear() + 5);
  return {
    seller: userId,
    amount_to_sell: sell,
    min_to_receive: receive,
    expiration,
    fill_or_kill: false
  };
};


export const getValuesToUpdate = (balances, baseBalances, update) => {
  const totalBase = Object.keys(baseBalances).reduce((res, key) => res + baseBalances[key], 0);
  const distribution = distributionFromBalances(baseBalances);

  const result = {
    sell: {},
    buy: {}
  };

  Object.keys(update).forEach((assetId) => {
    if (assetId === '1.3.0') return;
    const futureShare = update[assetId];
    const currentShare = distribution[assetId];

    console.log('CALC VALUES:', assetId);
    console.log(futureShare);
    console.log(currentShare);


    if (futureShare === 0) {
      result.sell[assetId] = balances[assetId];
    } else if (futureShare > currentShare) {
      const futureBase = Math.floor(totalBase * futureShare);
      const currentBase = Math.floor(totalBase * currentShare);
      result.buy[assetId] = futureBase - currentBase;
    } else {
      const fullAmmountInCurrent = Math.floor(balances[assetId] / currentShare);
      const amountInFuture = Math.floor(fullAmmountInCurrent * futureShare);
      const otherPortfolioAmount = fullAmmountInCurrent - balances[assetId];
      const amountToSell = fullAmmountInCurrent - otherPortfolioAmount - amountInFuture;
      result.sell[assetId] = amountToSell;
    }
  });
  return result;
};

export const calcPortfolioItem = ({
  asset,
  prices,
  baseAsset,
  fiatMultiplier,
  balance,
  isFiat }) => {
  let multiplier = fiatMultiplier;

  const baseValue = parseInt((balance * prices.last).toFixed(0), 10);

  const baseValuePrecised = baseValue / (10 ** baseAsset.precision);

  const fiatValue = parseInt((baseValue * fiatMultiplier.last).toFixed(0), 10);

  if (isFiat) multiplier = { first: 1, last: 1 };
  let change = calcPercentChange(prices, multiplier);

  if (prices.fist === prices.last && asset.id !== baseAsset.id) change = 0;

  // console.log('========');
  // console.log(asset.symbol);
  // console.log('base precision: ', baseAsset.precision);
  // console.log('balance: ', balance);
  // console.log('base value: ', baseValue);
  // console.log('fiat multiplier: ', fiatMultiplier);
  // console.log('fiat value: ', fiatValue);
  // console.log('base value precised : ', baseValuePrecised);
  // console.log('change: ', change);

  return {
    name: asset.symbol,
    balance,
    baseValue,
    baseValuePrecised,
    basePrecision: baseAsset.precision,
    fiatValue,
    change
  };
};
