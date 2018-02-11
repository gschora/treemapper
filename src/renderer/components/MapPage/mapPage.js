import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLGroup from 'ol/layer/group';
import OLControl from 'ol/control';
// import OLProj from 'ol/proj';
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

export default {
  initMap: () => {
    let vecLayers;
    let center;

    if (baselayers.getLayersArray().length === 0) {
      vecLayers = mpl.setupLayers(baselayers, overlaylayers);
      window.treemapper.fieldsLayer = vecLayers.fieldsLayer;
      window.treemapper.placesLayer = vecLayers.savedPlacesLayer;
      center = window.treemapper.mainSettings.homeCoords;
    } else {
      // veclayer = window.treemapper.veclayer;
      center = omap.getView().getCenter();
    }

    window.treemapper.fieldsLayer.setZIndex(10);
    window.treemapper.placesLayer.setZIndex(9);

    window.treemapper.omap = new OLMap({
      layers: [overlaylayers, baselayers],
      target: 'mapdiv',
      controls: OLControl.defaults({
        attribution: false,
      }),
      view: new OLView({
        center,
        zoom: window.treemapper.mainSettings.currentZoom,
        projection: 'EPSG:3857',
      }),
    });
    mpc.setupCtrls();
    // window.treemapper.omap = omap;
    // window.treemapper.veclayer = veclayer;

    // fix for distorted map on start
    setTimeout(() => {
      window.treemapper.omap.updateSize();
    }, 200);

    // sets zoom level to stay same when switching to settings page
    window.treemapper.omap.getView().on('change:resolution', (ev) => {
      const zl = Math.round(ev.target.getZoom());
      if (zl !== window.treemapper.mainSettings.currentZoom) {
        window.treemapper.mainSettings.currentZoom = zl;
      }
    });
  },
  getAddressTooltipCoords() {
    const ovc = window.treemapper.omap.getOverlayById('addressTooltipOverlayId').getPosition();
    window.treemapper.omap.getOverlayById('addressTooltipOverlayId').setPosition(undefined); // disable tooltip

    window.treemapper.mainSettings.homeCoords = ovc;
    window.treemapper.lfdb.getItem('mainSettings').then((val) => {
      if (val !== null) {
        val.homeCoords = ovc;
        window.treemapper.lfdb.setItem('mainSettings', val).catch(() => {});
        // eslint-disable-next-line no-console
        // console.log(val);
      }
    });
    // eslint-disable-next-line no-console
    // console.log(ovc);
    // window.treemapper.lfdb.setItem('mainSettings', window.treemapper.
    // mainSettings).catch(() => {});
    mpc.createHomeOverlay();
  },
  getSaveLocationCoords() {
    const ovc = omap.getOverlayById('addressTooltipOverlayId').getPosition();
    omap.getOverlayById('addressTooltipOverlayId').setPosition(undefined); // disable tooltip

    mpc.getAddressObject(ovc);
  },
};
