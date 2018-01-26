export const getPrices = (history) => {
  const startElem = history[0];
  const endElem = history[history.length - 1];
  const startPrice = startElem.open_base / startElem.open_quote;
  const endPrice = endElem.close_base / endElem.close_quote;

  console.log({ first: startPrice, last: endPrice });

  return { first: startPrice, last: endPrice };
};

export const formatPrices = (prices, base, quote) => {
  const precisionDiff = base.precision - quote.precision;

  if (precisionDiff > 0) {
    prices.first = prices.first / (precisionDiff * 10);
    prices.last = prices.last / (precisionDiff * 10);
  } else if (precisionDiff < 0) {
    prices.first = prices.first * 10 * precisionDiff;
    prices.last = prices.last * 10 * precisionDiff;
  }

  prices.change = Math.floor(((prices.last / prices.first) * 100) - 100);
  prices.first = Math.abs(prices.first).toFixed(4);
  prices.last = Math.abs(prices.last).toFixed(4);
  return prices;
};
