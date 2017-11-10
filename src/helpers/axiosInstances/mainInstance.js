import Vue from 'Vue'
import axios from 'axios'
import { Cookies } from 'quasar'

import alenvi from './../token/alenvi'
import ogustToken from './../token/getOgustToken'
import redirect from './../redirect'

const instance = axios.create();

instance.interceptors.request.use(async function (config) {
  if (!config.url.match(/ogust/i) && (config.url.match(/users$/i) || config.url.match(/users\/authenticate/i) || config.url.match(/calendar/i))) {
    return config;
  }
  if (!Cookies.get('alenvi_token')) {
    const refresh = await alenvi.refreshAlenviCookies(Vue);
    if (!refresh) {
      redirect.redirectToLogin(Vue);
      return config;
    }
  }
  axios.defaults.headers.common['x-access-token'] = Cookies.get('alenvi_token');
  if (config.url.match(/ogust/i)) {
    const token = await ogustToken.getOgustToken(Vue);
    config.headers.common['x-ogust-token'] = token;
  }
  return config;
}, function (err) {
  return Promise.reject(err);
});

export const alenviAxios = instance;
