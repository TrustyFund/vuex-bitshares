import { Apis } from 'bitsharesjs-ws';
import { ChainTypes } from 'bitsharesjs';
const { operations } = ChainTypes;

let cacheParameters = false;

const getParameters = async () => {
  if (cacheParameters) {
    return cacheParameters;
  }

  const [{ parameters }] = await Apis.instance().db_api().exec('get_objects', [['2.0.0']]);
  cacheParameters = parameters;
  return cacheParameters;
};

const getComissions = async () => {
  if (cacheParameters) {
    return cacheParameters.current_fees;
  }

  const { current_fees: { parameters: fees, scale } } = await getParameters();
  return { fees, scale };
}

const getComission = async (type) => {
  const ops = Object.keys(operations);
  const opIndex = ops.indexOf(type);
  const { fees, scale } = await getComissions();
  if (opIndex > -1) {
    return fees[opIndex][1].fee;
  }
  return false;
}

export default { getParameters, getComission };
