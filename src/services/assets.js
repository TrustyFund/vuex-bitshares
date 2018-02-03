import { Apis } from 'bitsharesjs-ws';
import * as utils from '../utils';

const fetch = async (assets) => {
  try {
    const result = await Apis.instance().db_api().exec('lookup_asset_symbols', [assets]);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};


const fetchPriceHistory = async (base, quote, days) => {
  try {
    const bucketSize = 3600;
    const endDate = new Date();
    const startDate = new Date(endDate - (1000 * 60 * 60 * 24 * days));
    const endDateISO = endDate.toISOString().slice(0, -5);
    const startDateISO = startDate.toISOString().slice(0, -5);
    const history = await Apis.instance().history_api().exec(
      'get_market_history',
      [base.id, quote.id, bucketSize, startDateISO, endDateISO]
    );
    const prices = utils.formatPrices(utils.getPrices(history), base, quote);
    return prices;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default {
  fetch,
  fetchPriceHistory
};
