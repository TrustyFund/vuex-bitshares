const assetsData = {
  1: {
    name: 'BTS',
    id: '1.3.0'
  },
  2: {
    name: 'USD',
    id: '1.2'
  },
  3: {
    name: 'CNY'
  }
};

const fetch = (assetsArray) => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      try {
        const result = assetsArray.map((assetId => {
          return {
            id: assetsData[assetId].id,
            symbol: assetsData[assetId].name
          };
        }));
        resolve(result);
      } catch (error) {
        reject(new Error());
      }
    });
  });
};

export default {
  fetch
};

