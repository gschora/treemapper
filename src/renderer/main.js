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

if (window.treemapper === undefined) {
  window.treemapper = {};
}

window.treemapper.savedPlaces = [];

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

window.treemapper.mainSettings = {
  _id: 'mainSettings',
  defaultZoom: 8,
  currentZoom: 8,
  addressZoom: 17,
  homeCoords: [1765230, 5993680],
  startMap: 'Openstreetmap',
};

window.treemapper.lfdb = lfdb;

lfdb.getItem('mainSettings').then((val) => {
  if (val === null) {
    lfdb.setItem('mainSettings', window.treemapper.mainSettings).then(() => {
      // eslint-disable-next-line no-console
      // console.log(value);
    });
  } else {
    window.treemapper.mainSettings = val;
    window.treemapper.omap.getView().setZoom(val.defaultZoom);
    window.treemapper.omap.getView().setCenter(val.homeCoords);
    window.treemapper.omap
      .getOverlayById('homeIconOverlayId')
      .setPosition(window.treemapper.mainSettings.homeCoords);
  }
});

lfdb.getItem('savedPlaces').then((val) => {
  if (val === null) {
    lfdb.setItem('savedPlaces', window.treemapper.savedPlaces).then(() => {
      // eslint-disable-next-line no-console
      // console.log(value);
    });
  } else {
    window.treemapper.savedPlaces = val;
    // // eslint-disable-next-line no-console
    // console.log(val);
  }
});
