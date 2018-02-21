import { key } from 'bitsharesjs';

const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};

export default {
  suggestBrainkey
};
