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
  .layer-switcher .panel{
    background-color: rgba(0,60,136,0.5);
  }
  .layer-switcher{
    top: 0.5em;
  }
  .layer-switcher button{
    background-image: url('./icons/ic_layers_white_36dp_1x.png');
  }
  #mapdiv .ol-control button{
    font-size: 2em;
    background-color: rgba(0,60,136,0.6);
  }
  #mapdiv .ol-rotate{
    top: 3.5em;
  }
  .btn_measure_line {
    top: 100px;
    left: .5em;
  }
  .btn_measure_area {
    top: 10em;
    left: .5em;
  }
  #measureAreaCtrlBtn {
    background-image: url('./icons/vector-polygon.png');
  }
  .btn_feature_del{
    top: 170px;
    left: .5em;
  }
  #btn_feature_del{
    background-color: rgba(255, 0, 0,.5);
  }
  #btn_feature_del:hover{
    background-color: rgba(255, 0, 0,.8);
  }
</style>
