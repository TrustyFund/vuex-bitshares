export function getUserName({ account }) {
  return account && account.name;
}

export function getAccountObject({ account }) {
  // эта проверка здесь не имеет смысла, тк. если геттер ничего не вернет,
  // то при обращении к нему извне на выходе и так и так будет undefined
  return account;
}

export function getBalances({ balances }) {
  return balances;
}

