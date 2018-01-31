import { key } from 'bitsharesjs';

export const suggestBrainkey = state => {
  return (dictionary) => {
    return key.suggest_brain_key(dictionary);
  };
}
