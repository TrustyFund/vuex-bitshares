/* eslint no-underscore-dangle: 0 */

const testAccounts = {
  hobb1t: '1.2.512210'
};

const listenToSignupId = ({ name }) => {
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve(testAccounts[name]);
    });
  });
};

export default {
  listenToSignupId
};

