const getters = {
  getAccountUserId: state => {
    return state.userId;
  },
  isLoggedIn: state => !!state.userId
};

export default getters;
