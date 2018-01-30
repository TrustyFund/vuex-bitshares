export const getPrices = (history) => {
  if (!history.length) return { first: 0, last: 0 };
  const startElem = history[0];
  const endElem = history[history.length - 1];
  const startPrice = startElem.open_base / startElem.open_quote;
  const endPrice = endElem.close_base / endElem.close_quote;
  return { first: startPrice, last: endPrice };
};

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
 * Return object with balance in BTS, balance in currency and change
 calculated given arguments
 * @param {Array} array - array of data elements
 */
export const calcPortfolioData = ({
  balance, prices, multiplier,
  isBase, isCurrency
}) => {
  let checkedMultiplier = multiplier;
  let checkedPrices = prices;
  if (isCurrency) checkedMultiplier = { first: 1, last: 1 };
  if (isBase) checkedPrices = { first: 1, last: 1 };
  const balanceBTS = balance * checkedPrices.last;
  const balanceCurrency = balanceBTS * checkedMultiplier.last;
  let change = ((((checkedPrices.last * checkedMultiplier.last) /
    (checkedPrices.first * checkedMultiplier.first)) * 100) - 100).toFixed(2);
  if (checkedPrices.last === checkedPrices.first && !isBase) change = 0;
  return { balanceBTS, balanceCurrency, change };
};
