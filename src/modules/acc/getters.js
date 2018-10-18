import { key } from 'bitsharesjs';

const getters = {
  getAccountUserId: state => {
    return state.userId;
  },
  getCurrentUserName: state => {
    return state.userData && state.userData.account.name;
  },
  getUserBalances: state => {
    if (!state.userData || !state.userData.balances) return {};
    const { balances } = state.userData;
    const nonZeroBalances = Object.keys(balances).reduce((result, assetId) => {
      if (balances[assetId].balance) result[assetId] = balances[assetId];
      return result;
    }, {});
    return nonZeroBalances;
  },
  isLoggedIn: state => !!state.userId,
  getKeys: state => {
    if (state.keys && state.keys.active && state.keys.owner) {
      return state.keys;
    }
    if (!state.wallet || !state.wallet.aesPrivate) return null;
    const brainkey = state.wallet.aesPrivate.decryptHexToText(state.wallet.encryptedBrainkey);
    if (!brainkey) return null;
    return {
      active: key.get_brainPrivateKey(brainkey, 0),
      owner: key.get_brainPrivateKey(brainkey, 1)
    };
  }
};

export default getters;
