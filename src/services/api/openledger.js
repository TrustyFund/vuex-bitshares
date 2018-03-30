const baseUrl = 'https://ol-api1.openledger.info/api/v0/ol/support';
const newAdressUri = '/simple-api/initiate-trade';
const lastAdressUri = '/simple-api/get-last-address';
const coinsUri = '/coins';
const validateStart = '/wallets/';
const validateEnd = '/address-validator?address=';

const processRequest = async ({ url, request }) => {
  try {
    const response = await fetch(url, request);
    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

const fetchCoins = async () => {
  const url = baseUrl + coinsUri;
  const request = { method: 'GET' };

  const result = await processRequest({ url, request });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return result;
};

const requestDepositAddress = async ({ asset, user }) => {
  const url = baseUrl + newAdressUri;
  const inputCoinType = asset.toLowerCase();
  const outputCoinType = 'open.' + inputCoinType;
  const outputAddress = user;
  const bodyObject = { inputCoinType, outputCoinType, outputAddress };
  const body = JSON.stringify(bodyObject);
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });
  const request = { method: 'post', headers, body };

  const result = await processRequest({ url, request });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data.inputAddress };
};

const getLastDepositAddress = async ({ asset, user }) => {
  const url = baseUrl + lastAdressUri;
  const coin = 'open.' + asset.toLowerCase();
  const account = user;
  const bodyObject = { coin, account };
  const body = JSON.stringify(bodyObject);
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });
  const request = { method: 'post', headers, body };

  const result = await processRequest({ url, request });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data.address };
};

const validateAddress = async ({ asset, address }) => {
  const headers = new Headers({ Accept: 'application/json' });
  const url = baseUrl + validateStart + asset + validateEnd + encodeURIComponent(address);

  try {
    const reply = await fetch(url, { method: 'GET', headers });
    const json = await reply.json();
    return json.isValid;
  } catch (error) {
    return false;
  }
};

export default {
  requestDepositAddress,
  getLastDepositAddress,
  validateAddress,
  fetchCoins
};
