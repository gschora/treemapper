import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLGroup from 'ol/layer/group';
import OLControl from 'ol/control';
import mpl from './mapLayers';
import mpc from './mapControls';

let omap = null;
const baselayers = new OLGroup({
  title: 'Hauptkarten',
  layers: new OLCollection(),
});
const overlaylayers = new OLGroup({
  title: 'Overlays',
  layers: new OLCollection(),
});

export default {
  initMap: () => {
    const veclayer = mpl.setupLayers(baselayers, overlaylayers);
    veclayer.setZIndex(10);
    omap = new OLMap({
      layers: [overlaylayers, baselayers],
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
    mpc.setupCtrls(omap, veclayer);
    window.omap = omap;
    window.veclayer = veclayer;
    omap.renderSync();
  },
};
