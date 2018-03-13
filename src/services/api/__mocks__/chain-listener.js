const testAccounts = {
  hobb1t: '1.2.512210'
};

const testOperation = {
  type: 'super-operation'
};

const addSubscription = (type, { name, callback }) => {
  switch (type) {
    case 'userSignUp': return new Promise((resolve) => {
      process.nextTick(() => {
        resolve(testAccounts[name]);
      });
    });
    case 'userOperation': {
      process.nextTick(() => {
        callback(testOperation);
      });
      break;
    }
    default: break;
  }
  return true;
};

const deleteSubscription = () => {};

export default {
  addSubscription,
  deleteSubscription
};

