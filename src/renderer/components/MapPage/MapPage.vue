<template>
  <div id="mapdiv">
    <!-- <h1>MapPage</h1> -->
  </div>
</template>

<script>
  import mp from './mapPage.js';
  import('ol/ol.css');

  export default {
    name: 'MapPage',
    data() {
      return {
        msg: 'null value',
      };
    },
    // mounted ist WICHTIG!!!!!! Sonst wird map zu früh gerendert und nicht angezeigt!!!!!!
    mounted() {
      this.$nextTick(() => {
        mp.initMap();
      });
    },
  };
</script>

<style>
  #mapdiv {
    width: 100%;
    height: 100%;
  }
</style>
