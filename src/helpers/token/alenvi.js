import jwt from 'jsonwebtoken'
import { Cookies, date } from 'quasar'

import { HTTP } from '../http-common/httpCommon'

export default {
  verifyToken (token) {
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET);
      return payload;
    } catch (e) {
      if (e.name === 'JsonWebTokenError') {
        console.error('Token invalide.');
      }
      if (e.name === 'TokenExpiredError') {
        console.error('Token expiré.');
      }
    }
  },
  checkAlenviCookie () {
    if (Cookies.get('alenvi_token')) {
      return true;
    }
    return false;
  },
  async refreshAlenviCookies (context) {
    try {
      if (Cookies.get('refresh_token')) {
        const data = {};
        data.refreshToken = Cookies.get('refresh_token');
        const newToken = await HTTP.post(`${process.env.API_HOSTNAME}/users/refreshToken`, data);
        Cookies.set('alenvi_token', newToken.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: newToken.data.data.expiresIn }) });
        Cookies.set('alenvi_token_expires_in', newToken.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: newToken.data.data.expiresIn }) });
      } else {
        Cookies.remove('alenvi_token');
        Cookies.remove('user_id');
        Cookies.remove('alenvi_token_expires_in');
        context.$router.push('/dashboard/login');
      }
    } catch (e) {
      console.error(e.message);
      if (e.status === 404) {
        Cookies.remove('alenvi_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_id');
        Cookies.remove('alenvi_token_expires_in');
        context.$router.push('/dashboard/login');
      }
    }
  }
}
