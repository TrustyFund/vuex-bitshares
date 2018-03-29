import { Apis } from 'bitsharesjs-ws';

let cacheParameters = false;

const get = async () => {
  if (cacheParameters) {
    console.log('From cache');
    return cacheParameters;
  }

  const [{ parameters }] = await Apis.instance().db_api().exec('get_objects', [['2.0.0']]);
  cacheParameters = parameters;
  return cacheParameters;
};

export default { get };
