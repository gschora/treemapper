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
        <vue-google-autocomplete
          id="searchAddressTxt"
          classname="addressSearch"
          placeholder="Adresse suchen"
          v-on:placechanged="getAddressData"
          v-if="$route.path == '/'"
          >
        </vue-google-autocomplete>
        <v-select
          id="placesselect"
          :class="placesShow ? 'placesShow':''"
          hide-details
          single-line
          prepend-icon="place"
          :prepend-icon-cb="toggle"
          item-value="text"
          placeholder="gespeicherte Orte"
          @blur="onBlurPlaces">
        </v-select>
        <v-btn id="zoomtohomebtn" fab @click.stop="zoomToHome">
          <v-icon>mdi-home-map-marker</v-icon>
        </v-btn>
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
import OLProj from 'ol/proj';
import VueGoogleAutocomplete from './components/AddressSearch/AddressSearch.vue';

export default {
  name: 'treemapper',
  data: () => ({
    drawer: null,
    placesShow: false,
  }),
  props: {
    source: String,
  },
  components: {
    VueGoogleAutocomplete,
  },
  methods: {
    getAddressData(addressData, placeResultData, id) {
      window.omap
        .getView()
        .setCenter(
          OLProj.transform(
            [addressData.longitude, addressData.latitude],
            'EPSG:4326',
            'EPSG:3857',
          ),
        );
      window.omap.getView().setZoom(window.mainSettings.addressZoom);
      window.ad = addressData;
      window.aid = id;
    },
    zoomToHome: () => {
      window.omap.getView().animate({
        center: window.mainSettings.homeCoords,
        zoom: window.mainSettings.addressZoom,
        duration: 1000,
      });
    },
    toggle() {
      if (!this.placesShow) {
        // this.focus();
      }
      this.placesShow = !this.placesShow;
    },
    onFocusPlaces() {
      // eslint-disable-next-line no-console
      console.log('focus');
    },
    /**
     * When the input loses focus
     */
    onBlurPlaces() {
      this.$emit('blur');
      this.placesShow = false;
    },
  },
};
import('vuetify/dist/vuetify.css');
import('mdi/css/materialdesignicons.min.css');
</script>

<style>
.list__tile--active .list__tile__action,
.list__tile--active .list__tile__content {
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
div#placesselect {
  max-width: 3%;
  transition: max-width 0.5s;
}
#placesselect.placesShow {
  max-width: 100%;
  transition: max-width 0.5s;
}
#placesselect i.input-group__append-icon {
  display: none;
}
#placesselect.placesShow i.input-group__append-icon {
  display: inherit;
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
