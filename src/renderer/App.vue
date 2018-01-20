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
        <v-list-tile to="/settings" disabled>
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
        <v-icon class="mr-1" v-if="$route.path == '/'">search</v-icon>
        <vue-google-autocomplete
          id="searchAddressTxt"
          classname="form-control"
          placeholder="Adresse suchen"
          v-on:placechanged="getAddressData"
          v-if="$route.path == '/'"
          >
        </vue-google-autocomplete>
        <v-speed-dial hover direction="bottom" v-if="$route.path == '/'">
          <v-btn fab slot="activator" hover>
            <v-icon>place</v-icon>
          </v-btn>
          <v-btn fab dark small color="indigo" @click.native="getAddressToLocation">
            <v-icon>add</v-icon>
          </v-btn>
          <v-btn fab dark small color="red">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-speed-dial>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center align-center>
              <router-view></router-view>
          <!-- <v-tooltip right>
            <v-btn icon large :href="source" target="_blank" slot="activator">
              <v-icon large>code</v-icon>
            </v-btn>
            <span>Source</span>
          </v-tooltip> -->
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
  import OLProj from 'ol/proj';
  import VueGoogleAutocomplete from './components/AddressSearch/AddressSearch.vue';

  export default {
    name: 'treemapper',
    data: () => ({
      drawer: null,
    }),
    props: {
      source: String,
    },
    components: {
      VueGoogleAutocomplete,
    },
    methods: {
      getAddressData(addressData, placeResultData, id) {
        window.omap.getView().setCenter(OLProj.transform([addressData.longitude, addressData.latitude], 'EPSG:4326', 'EPSG:3857'));
        window.omap.getView().setZoom(16);
        window.ad = addressData;
        window.aid = id;
      },
      getAddressToLocation() {
        // const center = window.omap.getView().getCenter();
        // const t = OLProj.transform([center[0], center[1]], 'EPSG:3857', 'EPSG:4326');
        // const latlng = {
        //   lat: t[1],
        //   lng: t[0],
        // };
        // VueGoogleAutocomplete.methods.reverseGeoCode(latlng.lat, latlng.lng);
      },
    },
  };
  import('../../node_modules/vuetify/dist/vuetify.css');
</script>

<style>
.list__tile--active .list__tile__action,
.list__tile--active .list__tile__content{
  color: white;
}
.pac-container {
  background: #212121;
  color: white;
}
.pac-item:hover {
  background: #404040;
}
.pac-item-query {
  color: white;
}
.pac-item-selected {
  background: #404040;
  color: white;
}
.pac-matched {
  color: white;
}
#christbam-logo:hover{
  -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
}
</style>
