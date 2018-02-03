import { Apis } from 'bitsharesjs-ws';

/**
 * Fetches user by name from bitsharesjs-ws
 * @param {string} username - name of user to fetch
 */
const Get = async (username) => {
  try {
    const user = await Apis.instance().db_api().exec('get_full_accounts', [[username], false]);
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default {
  Get
};

