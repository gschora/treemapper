<template>
  <v-app id="app" dark>
      <v-navigation-drawer
      clipped
      fixed
      v-model='drawer'
      app
    >
    <v-list dense three-line>
        <v-list-tile @click.stop="drawer = !drawer">
          <v-list-tile-action>
            <v-icon>map</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Karte</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click.stop="drawer = !drawer">
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
      <v-spacer></v-spacer>
      <vue-google-autocomplete
        id="searchAddressTxt"
        classname="form-control"
        placeholder="Adresse suchen"
        v-on:placechanged="getAddressData"
        >
      </vue-google-autocomplete>
      <v-icon>search</v-icon>
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
    },
  };
  import('../../node_modules/vuetify/dist/vuetify.css');
</script>

<style>

</style>
