import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLGroup from 'ol/layer/group';
import OLControl from 'ol/control';
import mpl from './mapLayers';
import mpc from './mapControls';

let omap = null;
const baselayers = new OLGroup({
  title: 'BaseLayers',
  layers: new OLCollection(),
});

export default {
  initMap: () => {
    mpl.setupLayers(baselayers);
    omap = new OLMap({
      layers: baselayers,
      target: 'mapdiv',
      controls: OLControl.defaults({
        attribution: false,
      }),
      view: new OLView({
        center: [1762780, 5998033],
        zoom: 10,
        projection: 'EPSG:3857',
      }),
    });
    mpc.setupCtrls(omap);
    window.omap = omap;
    omap.renderSync();
  },
};
