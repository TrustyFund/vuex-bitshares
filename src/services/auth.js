import Cookies from 'js-cookie';

const cacheUser = ({ id }) => {
  Cookies.set('BITSHARES_USER_ID', id, 7);
};

const getCachedUserId = () => {
  const userId = Cookies.get('BITSHARES_USER_ID');
  if (typeof (userId) !== 'string') return null;
  return userId;
};

export default {
  cacheUser,
  getCachedUserId
};
