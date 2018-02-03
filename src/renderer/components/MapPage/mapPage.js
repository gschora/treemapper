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
    let veclayer;
    let center;

    if (baselayers.getLayersArray().length === 0) {
      veclayer = mpl.setupLayers(baselayers, overlaylayers);
      center = window.mainSettings.homeCoords;
    } else {
      veclayer = window.veclayer;
      center = omap.getView().getCenter();
    }

    veclayer.setZIndex(10);

    omap = new OLMap({
      layers: [overlaylayers, baselayers],
      target: 'mapdiv',
      controls: OLControl.defaults({
        attribution: false,
      }),
      view: new OLView({
        center,
        zoom: window.mainSettings.currentZoom,
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

    // sets zoom level to stay same when switching to settings page
    omap.getView().on('change:resolution', (ev) => {
      const zl = Math.round(ev.target.getZoom());
      if (zl !== window.mainSettings.currentZoom) {
        window.mainSettings.currentZoom = zl;
      }
    });
  },
  getAddressTooltipCoords() {
    const ovc = omap.getOverlayById('addressTooltipOverlayId').getPosition();
    omap.getOverlayById('addressTooltipOverlayId').setPosition(undefined); // disable tooltip

    window.mainSettings.homeCoords = ovc;
    window.lfdb.getItem('mainSettings').then((val) => {
      if (val !== null) {
        val.homeCoords = ovc;
        window.lfdb.setItem('mainSettings', val).catch(() => {});
        // eslint-disable-next-line no-console
        // console.log(val);
      }
    });
    // eslint-disable-next-line no-console
    // console.log(ovc);
    // window.lfdb.setItem('mainSettings', window.mainSettings).catch(() => {});
    mpc.createHomeOverlay();
  },
  getSaveLocationCoords() {
    const ovc = omap.getOverlayById('addressTooltipOverlayId').getPosition();
    omap.getOverlayById('addressTooltipOverlayId').setPosition(undefined); // disable tooltip

    mpc.getAddressObject(ovc);
  },
};
