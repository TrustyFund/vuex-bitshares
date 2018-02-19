/**
 * Returns current user's name string
 */
export function getUserName({ account }) {
  return account && account.name;
}

/**
 * Returns current user's account object
 */
export function getAccountObject({ account }) {
  return account;
}

/**
 * Returns current users's balances object
 */
export function getBalances({ balances }) {
  return balances;
}

/**
 * User fetching in progress indicator
 */
export function isFetching(state) {
  return state.fetching;
}
