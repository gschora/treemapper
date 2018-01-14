import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLGroup from 'ol/layer/group';

import OLLayerSwitcher from 'ol3-layerswitcher';
import 'ol3-layerswitcher/src/ol3-layerswitcher.css';
import mp from './mapLayers';

let omap = '';
const baselayers = new OLGroup({
  title: 'BaseLayers',
  layers: new OLCollection(),
});

function setupCtrls() {
  const layerSwitcher = new OLLayerSwitcher({
    tipLabel: 'Karten',
  });
  omap.addControl(layerSwitcher);
}

export default {
  initMap: () => {
    mp.setupLayers(baselayers);
    omap = new OLMap({
      layers: baselayers,
      target: 'mapdiv',
      view: new OLView({
        center: [1762780, 5998033],
        zoom: 10,
      }),
    });
    setupCtrls();
    window.omap = omap;
  },
};
