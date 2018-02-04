<template>
  <v-app id="app" dark>
      <v-navigation-drawer
      clipped
      fixed
      temporary
      v-model='drawer'
      app
    >
    <v-list dense three-line>
        <v-list-tile to="/">
          <v-list-tile-action>
            <v-icon>map</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Karte</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile to="/settings">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content> 
            <v-list-tile-title>Einstellungen</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>TreeMapper</v-toolbar-title>
      <v-layout class="mx-2">
        <v-icon id="christbam-logo" large color="green darken-1" 
        class="btn btn--floating btn--outline btn--small btn--depressed green--text text--darken-1"
        >mdi-pine-tree</v-icon>
      </v-layout>
      <map-toolbar v-if="$route.path == '/'"></map-toolbar>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center align-center>
              <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed>
      <span>&copy; 2018 gschora</span>
      <v-spacer></v-spacer>
      <span id='map-coord'></span>
    </v-footer>
  </v-app>
</template>

<script>
// import OLProj from 'ol/proj';
// import VueGoogleAutocomplete from './components/AddressSearch/AddressSearch.vue';
import MapToolbar from './components/MapToolbar/MapToolbar';

export default {
  name: 'treemapper',
  data: () => ({
    drawer: null,
  }),
  props: {
    source: String,
  },
  components: {
    MapToolbar,
  },
  methods: {},
};
import('vuetify/dist/vuetify.css');
import('mdi/css/materialdesignicons.min.css');
</script>

<style>
.list__tile--active .list__tile__action,
.list__tile--active .list__tile__content {
  color: white;
}
#christbam-logo {
  animation: roll 60s linear infinite;
}
@keyframes roll {
  0% {
    color: green;
    /* transform: rotate(0deg); */
  }
  60% {
    color: green;
  }
  70% {
    color: white;
    /* transform: rotate(360deg); */
  }
  80% {
    color: yellow;
  }
  90% {
    color: #0099ff;
  }
  100% {
    color: green;
  }
}
</style>
