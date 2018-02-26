import Cookies from 'js-cookie';

const cacheUserData = ({ id, encryptedBrainkey }) => {
  Cookies.set('BITSHARES_USER_ID', id, 7);
  Cookies.set('BITSHARES_USER_BRAINKEY', encryptedBrainkey, 7);
};

const getCachedUserData = () => {
  const userId = Cookies.get('BITSHARES_USER_ID');
  const encryptedBrainkey = Cookies.get('BITSHARES_USER_BRAINKEY');
  if (!userId || !encryptedBrainkey) return null;
  if (typeof (userId) !== 'string') return null;
  return {
    userId,
    encryptedBrainkey
  };
};

export default {
  cacheUserData,
  getCachedUserData
};
