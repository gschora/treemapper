import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLGroup from 'ol/layer/group';
import OLControl from 'ol/control';
import mpl from './mapLayers';
import mpc from './mapControls';

let omap;

const baselayers = new OLGroup({
  title: 'Hauptkarten',
  layers: new OLCollection(),
});
const overlaylayers = new OLGroup({
  title: 'Overlays',
  layers: new OLCollection(),
});

function readDb() {
  // window.db
  //   .info()
  //   .then((info) => {
  //     // eslint-disable-next-line no-console
  //     console.log(info);
  //   })
  //   .catch((err) => {
  //     // eslint-disable-next-line no-console
  //     console.error(err);
  //   });
}

export default {
  initMap: () => {
    readDb();

    let veclayer;
    let center;
    if (baselayers.getLayersArray().length === 0) {
      veclayer = mpl.setupLayers(baselayers, overlaylayers);
      center = window.mainSettings.homeCoords;
    } else {
      veclayer = window.veclayer;
      center = omap.getView().getCenter();
    }
    // // eslint-disable-next-line no-console
    // console.log(omap);
    veclayer.setZIndex(10);

    omap = new OLMap({
      layers: [overlaylayers, baselayers],
      target: 'mapdiv',
      controls: OLControl.defaults({
        attribution: false,
      }),
      view: new OLView({
        center,
        zoom: window.mainSettings.defaulZoom,
        projection: 'EPSG:3857',
      }),
    });
    mpc.setupCtrls(omap, veclayer);
    window.omap = omap;
    window.veclayer = veclayer;
    // fix for distorted map on start
    setTimeout(() => {
      omap.updateSize();
    }, 200);
  },
};
