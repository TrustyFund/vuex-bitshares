import { Aes, TransactionHelper, PrivateKey, ops } from 'bitsharesjs';
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
  // || 1 when node sends bad data ( 0 )
  const startPrice = (startElem.open_base || 1) / (startElem.open_quote || 1);
  const endPrice = (endElem.close_base || 1) / (endElem.close_quote || 1);
  if (!startElem.open_base || !startElem.close_base
      || !startElem.open_quote || !endElem.close_quote) {
    console.warn('[MARKET] : bad price history');
  }
  return { first: startPrice, last: endPrice };
};

/**
 * Returns formatted prices for array calculated taking precision of assets into account
 * @param {Object} prices - object with asset's history prices
 * @param {number} prices.first - first price of asset history
 * @param {number} prices.last - last price of asset history (current)
 * @param {Object} base - base asset object
 * @param {Object} quote - quote asset object
 */
export const formatPrices = (prices, base, quote) => {
  const precisionDiff = base.precision - quote.precision;
  console.log(quote.id + ' : ' + prices);

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

export const getMemoPrivKey = (keys, publicKey) => {
  const { active, owner } = keys;
  const ownerPubkey = owner.toPublicKey().toPublicKeyString();
  const activePubkey = active.toPublicKey().toPublicKeyString();
  if (publicKey === ownerPubkey) {
    return owner;
  }
  if (publicKey === activePubkey) {
    return active;
  }
  return false;
};

export const getMemoSize = (memo) => {
  const privKey = '5KikQ23YhcM7jdfHbFBQg1G7Do5y6SgD9sdBZq7BqQWXmNH7gqo';
  const memoToKey = 'BTS8eLeqSZZtB1YHdw7KjQxRSRmaKAseCxhUSqaLxUdqvdGpp6nck';
  const pKey = PrivateKey.fromWif(privKey);

  const encrypted = encryptMemo(memo, pKey, memoToKey);

  const serialized = ops.memo_data.fromObject(encrypted);
  const stringified = JSON.stringify(ops.memo_data.toHex(serialized));
  const byteLength = Buffer.byteLength(stringified, 'hex');
  return byteLength;
};

export const getMemoSizeFast = (memo) => {
  const minimalLength = 92;
  const step = 16;


  if (memo.length < 12) {
    return minimalLength;
  }
  let countSteps = 0;
  for (let i = memo.length; i >= 12; i -= step) {
    countSteps += 1;
  }
  return minimalLength + (countSteps * step);
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
    const integer = Math.floor(proportions[key].toFixed(accuracy + 1) + positiveExponent);
    const floored = +(integer + negativeExponent);
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

export const createOrder = ({ sell, receive, userId, fillOrKill = false }) => {
  const expiration = new Date();
  expiration.setYear(expiration.getFullYear() + 5);
  return {
    seller: userId,
    amount_to_sell: sell,
    min_to_receive: receive,
    expiration,
    fill_or_kill: fillOrKill
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
