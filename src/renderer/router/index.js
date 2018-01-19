import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'map-page',
      component: require('@/components/MapPage/MapPage.vue').default,
    },
    {
      path: '/settings',
      name: 'settings-page',
      component: require('@/components/SettingsPage/SettingsPage.vue').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
