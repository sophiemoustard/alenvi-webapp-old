import axios from 'axios'
import { Cookies, date } from 'quasar'

export default {
  async refreshAlenviCookies () {
    try {
      if (Cookies.get('refresh_token')) {
        const data = {};
        data.refreshToken = Cookies.get('refresh_token');
        const newToken = await axios.post(`${process.env.API_HOSTNAME}/users/refreshToken`, data);
        Cookies.set('alenvi_token', newToken.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: newToken.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        Cookies.set('alenvi_token_expires_in', newToken.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: newToken.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        Cookies.set('user_id', newToken.data.data.user._id, { path: '/', expires: date.addToDate(new Date(), { seconds: newToken.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
        return true;
      }
      Cookies.remove('alenvi_token', { path: '/' });
      Cookies.remove('user_id', { path: '/' });
      Cookies.remove('alenvi_token_expires_in', { path: '/' });
      return false;
    } catch (e) {
      console.error(e.response.message);
      if (e.response.status === 404) {
        Cookies.remove('alenvi_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        Cookies.remove('user_id', { path: '/' });
        Cookies.remove('alenvi_token_expires_in', { path: '/' });
        return false;
      }
    }
  }
}
