const testAccounts = {
  hobb1t: '1.2.512210'
};

const testOperation = {
  type: 'super-operation'
};

const listenToSignupId = ({ name }) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve(testAccounts[name]);
    });
  });
};

const subscribeToUserOperations = ({ callback }) => {
  process.nextTick(() => {
    callback(testOperation);
  });
};

const unsubscribeFromUserOperations = () => {};

export default {
  listenToSignupId,
  subscribeToUserOperations,
  unsubscribeFromUserOperations
};

