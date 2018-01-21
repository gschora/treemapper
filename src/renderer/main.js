import Vue from 'vue';
import axios from 'axios';
import Vuetify from 'vuetify';
import PouchDB from 'pouchdb';
import PouchNodeWebSql from 'pouchdb-adapter-node-websql';
import path from 'path';

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

PouchDB.plugin(PouchNodeWebSql);
const db = new PouchDB(path.join(__static, '/treedb'), { adapter: 'websql' });

window.db = db;

window.mainSettings = {
  defaulZoom: 8,
  homeCoords: [1765230, 5993680],
  startMap: 'Openstreetmap',
};
