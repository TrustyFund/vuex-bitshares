
import assetsData from './testAssetsData.js';

const fetch = (assetsArray) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        // return by ids or by names
        let result = assetsData.filter(asset => assetsArray.indexOf(asset.id) > -1);
        if (!result.length) {
          result = assetsData.filter(asset => assetsArray.indexOf(asset.symbol) > -1);
        }
        resolve(result);
      } catch (error) {
        resolve(null);
      }
    });
  });
};


const testHistoryData = {
  '1.3.0': {
    '1.3.121': {
      first: '2.4602',
      last: '4.7164'
    },
    '1.3.113': {
      first: '0.3676',
      last: '0.7189'
    },
    '1.3.0': {
      first: 0,
      last: 0
    },
    '1.3.861': {
      first: '745.7055',
      last: '1034.8396'
    }
  }
};

const fetchPriceHistory = (base, quote) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      try {
        resolve(testHistoryData[base.id][quote.id]);
      } catch (error) {
        resolve(null);
      }
    });
  });
};

export default {
  fetch,
  fetchPriceHistory
};

