<template>
  <div style="width: 100%; height: 97%;">
    <div id="mapdiv">
      <!-- <h1>MapPage</h1> -->
    </div>
    <div >
      <address-tooltip
        :ttpLabelid='ttpLabelid'
        :ttpDivid='ttpDivid'
        :class='cssAddressTtp' 
        :labeltext='addresslabeltext'
        @saveHome='saveHome'
        >
      </address-tooltip>
      <div style="display:none">
        <v-icon id="homeIcon" small color="blue">mdi-home-map-marker</v-icon>
      </div>
    </div>    
  </div>
</template>

<script>
import mp from './mapPage.js';
import addressTooltip from './maptooltip.vue';
import('ol/ol.css');

export default {
  name: 'MapPage',
  components: {
    addressTooltip,
  },
  data() {
    return {
      msg: 'null value', // this is for drawer menu???
      cssAddressTtp: ['tooltip-address'], // change class of tooltip - this will be added to default classes in component
      ttpLabelid: 'addressttptxt',
      ttpDivid: 'addressttpdiv',
      addresslabeltext: 'parentlabel',
    };
  },
  // mounted ist WICHTIG!!!!!! Sonst wird map zu früh gerendert und nicht angezeigt!!!!!!
  mounted() {
    this.$nextTick(() => {
      mp.initMap();
    });
  },
  methods: {
    saveHome: () => {
      mp.getAddressTooltipCoords();
    },
  },
};
</script>

<style>
#mapdiv {
  width: 100%;
  height: 100%;
}
#mapdiv .layer-switcher .panel {
  background-color: rgba(0, 60, 136, 0.8);
}
.ol-control.layer-switcher {
  top: 0.5em;
  left: 6em;
  right: inherit;
  z-index: 1;
}
#mapdiv .layer-switcher button {
  background-image: url('./icons/ic_layers_white_36dp_1x.png');
}
.ol-mouse-position {
  color: white;
}
#mapdiv .ol-control button {
  font-size: 2em;
  background-color: rgba(0, 60, 136, 0.6);
}
#mapdiv .ol-control button:hover {
  font-size: 2em;
  background-color: rgba(0, 60, 136, 0.8);
}
#mapdiv .ol-rotate {
  top: 3.5em;
}
.btn_measure_line {
  top: 7em;
  left: 0.5em;
}
.btn_measure_area {
  top: 9.9em;
  left: 0.5em;
}
#mapdiv .btn_feature_edit {
  top: 12.8em;
  left: 0.5em;
}
#measureAreaCtrlBtn {
  background-image: url('./icons/vector-polygon.png');
}
#mapdiv .btn_feature_del {
  top: 15.7em;
  left: 0.5em;
  /* background-color: rgba(255, 0, 0,.5); */
}
#mapdiv #btn_feature_del {
  background-color: rgba(255, 0, 0, 0.5);
}
#mapdiv #btn_feature_del:hover {
  background-color: rgba(255, 0, 0, 0.8);
}
#mapdiv button.active {
  background-color: rgba(0, 102, 0, 0.6);
}
#mapdiv button:disabled {
  background-color: rgba(0, 0, 0, 0.6);
}
.mtooltip {
  position: relative;
  background: rgba(255, 153, 0, 0.8);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  max-width: 170px;
  /* white-space: nowrap; */
}
/* span.tooltip{
    visibility: hidden;
  } */
.mtooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.mtooltip-address {
  opacity: 1;
  font-weight: bold;
  text-align: center;
}
#addressttptxt {
  width: 50px;
  word-break: break-word;
}
.mtooltip-static {
  background-color: rgba(255, 153, 0, 0.8);
  color: white;
  /* border: 1px solid white; */
  font-weight: bold;
  text-align: center;
  opacity: 1;
}
.mtooltip-measure:before,
.mtooltip-address:before,
.mtooltip-static:before {
  border-top: 6px solid rgba(255, 153, 0, 0.8);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: '';
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.mtooltip-static:before {
  border-top-color: rgba(255, 153, 0, 0.8);
}
</style>
