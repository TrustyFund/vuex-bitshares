export function getUserName({account}){
  if (account){
    return account.name;
  }
}

export function getAccountObject({account}){
  if (account){
    return account;
  }
}

export function getBalances({balances}){
  if (balances){
    return balances;
  }
}