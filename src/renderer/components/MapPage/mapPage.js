import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLGroup from 'ol/layer/group';

import mpl from './mapLayers';
import mpc from './mapControls';

let omap = '';
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
      view: new OLView({
        center: [1762780, 5998033],
        zoom: 10,
      }),
    });
    omap.addControl(mpc.setupCtrls());
    window.omap = omap;
  },
};
