import * as types from '../mutations';
import { User } from '../services/api';

export const fetchUser = ({ commit }, username) => {
  commit(types.FETCH_USER_REQUEST);
  return new Promise((resolve, reject) => {
    User.Get(username).then((result) => {
      commit(types.FETCH_USER_COMPLETE, result[0][1]);
      resolve();
    }, (error) => {
      commit(types.FETCH_USER_ERROR);
      reject(error);
    });
  });
};
