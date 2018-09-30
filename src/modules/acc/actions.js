import API from '../../services/api';
import { types } from './mutations';

const actions = {
  cloudLogin: async ({ commit }, { name, password }) => {
    
    const { privKey: activeKey } = API.Account.generateKeyFromPassword(
      name,
      'owner',
      password
    );
    const { privKey: ownerKey } = API.Account.generateKeyFromPassword(
      name,
      'active',
      password
    );

    const ownerPubkey = ownerKey.toPublicKey().toPublicKeyString('BTS')
    const userId = await API.Account.getAccountIdByOwnerPubkey(ownerPubkey);

    const id = userId && userId[0];
    if (id) {
      const keys = {
        active: activeKey,
        owner: ownerKey
      };

      const userType = 'password';
      console.log('123')
      commit(types.ACCOUNT_CLOUD_LOGIN, { keys, userId: id });
      return {
        error: false
      };
    }
    return {
      error: 'Invalid username or password'
    };
  }
}


export default actions