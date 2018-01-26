import * as types from '../mutations';
import { User } from '../services/api';

export const fetchUser = ({ commit }, username) => {
  commit(types.FETCH_USER_REQUEST);
  User.Get(username).then((result) => {
    commit(types.FETCH_USER_COMPLETE, result[0][1]);
  }, () => {
    commit(types.FETCH_USER_ERROR);
  });
};
