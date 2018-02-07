<template>
    <v-layout justify-end>
        <vue-google-autocomplete
          id="searchAddressTxt"
          classname="addressSearch"
          placeholder="Adresse suchen"
          v-on:placechanged="getAddressData"
          >
        </vue-google-autocomplete>
        <v-select
          id="placesselect"
          :class="placesShow ? 'placesShow':''"
          :items="savedPlaces"
          item-value="value"
          @input="selectPlaceItem"
          hide-details
          single-line
          dense
          prepend-icon="place"
          :prepend-icon-cb="toggle"
          placeholder="gespeicherte Orte"
          @blur="onBlurPlaces">
        </v-select>
        <v-icon id="zoomtohomebtn" @click.stop="zoomToHome">mdi-home-map-marker</v-icon>
    </v-layout>
</template>

<script>
import OLProj from 'ol/proj';
import VueGoogleAutocomplete from '../AddressSearch/AddressSearch.vue';

export default {
  data: () => ({
    drawer: null,
    placesShow: false,
    savedPlaces: window.treemapper.savedPlaces,
    selectedPlacesItem: null,
  }),
  components: {
    VueGoogleAutocomplete,
  },
  methods: {
    getAddressData(addressData, placeResultData, id) {
      window.treemapper.omap
        .getView()
        .setCenter(
          OLProj.transform(
            [addressData.longitude, addressData.latitude],
            'EPSG:4326',
            'EPSG:3857',
          ),
        );
      window.treemapper.omap
        .getView()
        .setZoom(window.treemapper.mainSettings.addressZoom);
      window.treemapper.ad = addressData;
      window.treemapper.aid = id;
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
    zoomToHome: () => {
      window.treemapper.omap.getView().animate({
        center: window.treemapper.mainSettings.homeCoords,
        zoom: window.treemapper.mainSettings.addressZoom,
        duration: 1000,
      });
    },
    selectPlaceItem(item) {
      window.treemapper.omap.getView().animate({
        center: item,
        zoom: window.treemapper.mainSettings.addressZoom,
        duration: 1000,
      });
    },
  },
};
</script>

<style>
div.addressSearch {
  max-width: 0%;
  transition: max-width 0.5s;
  margin-right: 1em;
}
div.addressSearch.show {
  max-width: 50%;
  transition: max-width 0.5s;
}
div#placesselect {
  max-width: 0%;
  margin-right: 1em;
  transition: max-width 0.5s;
}
#placesselect.placesShow {
  max-width: 50%;
  transition: max-width 0.5s;
}
#placesselect i.input-group__append-icon {
  display: none;
}
#placesselect.placesShow i.input-group__append-icon {
  display: inherit;
}
#zoomtohomebtn {
  color: rgba(255, 255, 255, 0.7);
}
#zoomtohomebtn:hover {
  color: rgba(255, 255, 255, 1);
}
</style>
