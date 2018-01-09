<template>
  <div id="mapdiv">
    <!-- <h1>MapPage</h1> -->
  </div>
</template>

<script>
  import OLMap from '../../../../node_modules/ol/map';
  import OLTile from '../../../../node_modules/ol/layer/tile';
  import OLOSM from '../../../../node_modules/ol/source/osm';
  import OLView from '../../../../node_modules/ol/view';
  import('../../../../node_modules/ol/ol.css');

function initMap() {
    const myMap = new OLMap({
      layers: [
        new OLTile({
          source: new OLOSM(),
        }),
      ],
      target: 'mapdiv',
      view: new OLView({
        center: [0, 0],
        zoom: 2,
      }),
    });

    myMap.render();
}

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
        initMap();
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
