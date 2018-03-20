/* eslint no-underscore-dangle: 0 */
const testAccounts = {
  hobb1t: '1.2.512210'
};

const testOperation = {
  type: 'super-operation'
};

const addSubscription = (subscripton) => {
  switch (subscripton.getType()) {
    case 'userOperation': {
      process.nextTick(() => {
        subscripton._callback(testOperation);
      });
      break;
    }
    default: break;
  }
  return true;
};

const processSubscription = (subscription) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve(testAccounts[subscription.name]);
    });
  });
};

const deleteSubscription = () => {};

export default {
  addSubscription,
  deleteSubscription,
  processSubscription
};

