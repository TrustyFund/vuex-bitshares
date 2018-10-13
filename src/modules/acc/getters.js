const getters = {
  getAccountUserId: state => {
    return state.userId;
  },
  getCurrentUserName: state => {
    return state.userData && state.userData.account.name;
  },
  getCurrentUserBalances: state => {
    return (state.userData && state.userData.balances) || {};
  },
  isLoggedIn: state => !!state.userId
};

export default getters;
