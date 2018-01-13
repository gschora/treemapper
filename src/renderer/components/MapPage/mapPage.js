import OLSVector from 'ol/source/vector';
import OLLVector from 'ol/layer/vector';
import OLFill from 'ol/style/fill';
import OLStyle from 'ol/style/style';
import OLStroke from 'ol/style/stroke';
import OLCircle from 'ol/style/circle';
import OLTile from 'ol/layer/tile';
import OLOSM from 'ol/source/osm';
// import OLTileImage from 'ol/source/tileimage';
import OLMap from 'ol/map';
import OLView from 'ol/view';
import OLCollection from 'ol/collection';
import OLWmsCap from 'ol/format/wmtscapabilities';
import OLSWmts from 'ol/source/wmts';
import OLGroup from 'ol/layer/group';
import OLSBing from 'ol/source/bingmaps';

let omap = '';
const capabilitiesUrl = 'https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml';
const features = new OLCollection();
const baselayers = new OLGroup({
  title: 'BaseLayers',
  layers: new OLCollection(),
});
const source = new OLSVector({ feature: features });
// const layer = 'bmaphidpi'; // 'geolandbasemap';
const tilePixelRatio = 2;
const vector = new OLLVector({
  source,
  style: new OLStyle({
    fill: new OLFill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new OLStroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new OLCircle({
      radius: 7,
      fill: new OLFill({
        color: '#ffcc33',
      }),
    }),
  }),
});

function setupLayers() {
  const olsm = new OLTile({
    source: new OLOSM({
      projection: 'EPSG:3857',
    }),
  });
  baselayers.getLayers().push(olsm);

  // const bmapOrthoLayer = '';
  // let bmapHidpiLayer = '';
  // let bmapGrau = '';

  fetch(capabilitiesUrl)
    .then(response => response.text())
    .then((text) => {
      const result = new OLWmsCap().read(text);
      let options = OLSWmts.optionsFromCapabilities(result, {
        layer: 'bmaporthofoto30cm', // layer,
        matrixSet: 'google3857',
        style: 'normal',
      });
      options.tilePixelRatio = tilePixelRatio;
      baselayers.getLayers().push(
        new OLTile({
          source: new OLSWmts(options),
        }),
      );
      options = OLSWmts.optionsFromCapabilities(result, {
        layer: 'bmaphidpi', // layer,
        matrixSet: 'google3857',
        style: 'normal',
      });
      baselayers.getLayers().push(
        new OLTile({
          source: new OLSWmts(options),
        }),
      );
      options = OLSWmts.optionsFromCapabilities(result, {
        layer: 'bmapgrau', // layer,
        matrixSet: 'google3857',
        style: 'normal',
      });
      baselayers.getLayers().push(
        new OLTile({
          source: new OLSWmts(options),
        }),
      );
    });

  baselayers.getLayers().push(
    new OLTile({
      // visible: false,
      // preload: Infinity,
      source: new OLSBing({
        key: 'AmZbHjfWoosiM_wNCJPR_gkkobRA1ikmQAApFP-3vjaYoZmhLnXSEfl1TUOl3W2Z',
        imagerySet: ['Aerial'],
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        // maxZoom: 19
      }),
    }),
  );
}

export default {
  initMap: () => {
    setupLayers();
    omap = new OLMap({
      layers: baselayers,
      target: 'mapdiv',
      view: new OLView({
        center: [1762780, 5998033],
        zoom: 10,
      }),
    });
    omap.addLayer(vector);

    window.omap = omap;
  },
};
