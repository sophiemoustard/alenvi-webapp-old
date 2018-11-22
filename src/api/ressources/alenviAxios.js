import axios from 'axios'
import { Cookies } from 'quasar'

import alenvi from '../../helpers/alenvi'
import ogustToken from '../../helpers/getOgustToken'
import redirect from '../../router/redirect'

const instance = axios.create();

instance.interceptors.request.use(async function (config) {
  // Ignore routes that don't need automatic token
  if (!config.url.match(/ogust/i) && config.url.match(/users\/authenticate/i)) {
    return config;
  }
  if (!Cookies.get('alenvi_token')) {
    const refresh = await alenvi.refreshAlenviCookies();
    if (!refresh) {
      redirect.redirectToLogin();
      return config;
    }
  }
  if (!Cookies.get('refresh_token')) {
    redirect.redirectToLogin();
    return config;
  }
  // Headers for request only to API (alenvi)
  config.headers.common['x-access-token'] = Cookies.get('alenvi_token');
  // Headers for next request to get Ogust Token using axios instance
  // axios.defaults.headers.common['x-access-token'] = Cookies.get('alenvi_token');
  if (config.url.match(/ogust/i) || config.url.match(/calendar\/events/i)) {
    const token = await ogustToken.getOgustToken(Cookies.get('alenvi_token'));
    config.headers.common['x-ogust-token'] = token;
  }
  return config;
}, function (err) {
  return Promise.reject(err);
});

instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  return Promise.reject(error.response);
})

export const alenviAxios = instance;
