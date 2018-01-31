import { key } from 'bitsharesjs';

export const suggestBrainkey = (dictionary) => {
  return key.suggest_brain_key(dictionary);
};
