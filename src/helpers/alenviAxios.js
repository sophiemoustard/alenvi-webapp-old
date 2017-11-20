import axios from 'axios'
import { Cookies } from 'quasar'

import alenvi from './token/alenvi'
import ogustToken from './token/getOgustToken'
import redirect from './redirect'

const instance = axios.create();

instance.interceptors.request.use(async function (config) {
  if (!config.url.match(/ogust/i) && (config.url.match(/users$/i) || config.url.match(/users\/authenticate/i) || config.url.match(/calendar/i))) {
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
  axios.defaults.headers.common['x-access-token'] = Cookies.get('alenvi_token');
  if (config.url.match(/ogust/i)) {
    const token = await ogustToken.getOgustToken();
    config.headers.common['x-ogust-token'] = token;
  }
  return config;
}, function (err) {
  return Promise.reject(err);
});

instance.interceptors.response.use((response) => {
  return response;
}, error => {
  return Promise.reject(error.response);
})

export const alenviAxios = instance;
