import { Apis } from 'bitsharesjs-ws';

let cacheParameters = false;

const getParameters = async () => {
  if (cacheParameters) {
    return cacheParameters;
  }

  const [{ parameters }] = await Apis.instance().db_api().exec('get_objects', [['2.0.0']]);
  cacheParameters = parameters;
  return cacheParameters;
};

export const getCachedComissions = () => {
  const { current_fees: { parameters: fees, scale } } = cacheParameters;
  return { fees, scale };
};

export const getComissions = async () => {
  if (cacheParameters) {
    return getCachedComissions();
  }

  const { current_fees: { parameters: fees, scale } } = await getParameters();
  return { fees, scale };
};

export default { getParameters, getComissions, getCachedComissions };
