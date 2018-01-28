import Vue from 'vue';
import axios from 'axios';
import Vuetify from 'vuetify';
// import PouchDB from 'pouchdb';
// import PouchNodeWebSql from 'pouchdb-adapter-node-websql';
// import path from 'path';

import lfdb from 'localforage';
import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.use(Vuetify);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

window.mainSettings = {
  _id: 'mainSettings',
  defaultZoom: 8,
  currentZoom: 8,
  addressZoom: 17,
  homeCoords: [1765230, 5993680],
  startMap: 'Openstreetmap',
};

window.lfdb = lfdb;

lfdb.getItem('mainSettings').then((val) => {
  if (val === null) {
    lfdb.setItem('mainSettings', window.mainSettings).then(() => {
      // eslint-disable-next-line no-console
      // console.log(value);
    });
  } else {
    window.mainSettings = val;
    window.omap.getView().setZoom(val.defaultZoom);
    window.omap.getView().setCenter(val.homeCoords);
    window.omap.getOverlayById('homeIconOverlayId').setPosition(window.mainSettings.homeCoords);
  }
});
