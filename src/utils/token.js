/* eslint-disable camelcase */
import { jwtDecode } from 'jwt-decode';

export const checkTokenExp = (token) => {
  if (token) {
    const date = new Date().getTime() / 1000;
    const expToken = jwtDecode(token).exp;
    if (expToken && expToken > date) {
      return true;
    }
    return false;
  }
  return false;
};
