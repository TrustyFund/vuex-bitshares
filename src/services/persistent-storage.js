import Cookies from 'js-cookie';

// Persistent Storage for data cache management
const PersistentStorage = {
  saveUserData: ({ id, encryptedBrainkey }) => {
    Cookies.set('BITSHARES_USER_ID', id, 7);
    Cookies.set('BITSHARES_USER_BRAINKEY', encryptedBrainkey, 7);
  },
  getSavedUserData: () => {
    const userId = Cookies.get('BITSHARES_USER_ID');
    const encryptedBrainkey = Cookies.get('BITSHARES_USER_BRAINKEY');
    if (!userId || !encryptedBrainkey) return null;
    if (typeof (userId) !== 'string') return null;
    return {
      userId,
      encryptedBrainkey
    };
  },
  clearSavedUserData: () => {
    Cookies.remove('BITSHARES_USER_ID');
    Cookies.remove('BITSHARES_USER_BRAINKEY');
  },
  saveNodesData: ({ data }) => {
    Cookies.set('BITSHARES_NODES', data);
  },
  getSavedNodesData: () => {
    const cachedData = Cookies.getJSON('BITSHARES_NODES');
    if (typeof (cachedData) === 'object' && cachedData !== null) {
      return cachedData;
    }
    return {};
  }
};

export default PersistentStorage;
