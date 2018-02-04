const assetsData = {
  1: {
    name: 'bts'
  },
  2: {
    name: 'usd'
  },
  3: {
    name: 'cny'
  }
};

const fetch = (assetsArray) => {
  return new Promise((resolve, reject) => {
    process.nextTick(() => {
      try {
        const result = assetsArray.map((assetId => assetsData[assetId]));
        resolve(result);
      } catch (error) {
        reject(new Error());
      }
    });
  });
};

export default { fetch };

