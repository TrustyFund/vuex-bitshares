
const baseUrl = 'https://ol-api1.openledger.info/api/v0/ol/support/simple-api/';
const newAdressUri = 'initiate-trade';
const lastAdressUri = 'get-last-address';

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

const requestDepositAdress = async ({ asset, user }) => {
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

const getLastDepositAdress = async ({ asset, user }) => {
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

export default {
  requestDepositAdress,
  getLastDepositAdress
};
