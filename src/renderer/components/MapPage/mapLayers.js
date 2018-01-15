import OLCollection from 'ol/collection';
import OLWmsCap from 'ol/format/wmtscapabilities';
import OLSWmts from 'ol/source/wmts';
import OLSBing from 'ol/source/bingmaps';
import OLSVector from 'ol/source/vector';
import OLLVector from 'ol/layer/vector';
import OLFill from 'ol/style/fill';
import OLStyle from 'ol/style/style';
import OLStroke from 'ol/style/stroke';
import OLCircle from 'ol/style/circle';
import OLTile from 'ol/layer/tile';
import OLOSM from 'ol/source/osm';
import OLTileImage from 'ol/source/tileimage';

const capabilitiesUrl = 'https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml';
const features = new OLCollection();
const source = new OLSVector({ feature: features });
/**
 * Sets up all Layers
 * needs collection from map where layers should go
 *
 * @param {ol.collection} baselayers
 */
function setupLayers(baselayers) {
  const olsm = new OLTile({
    type: 'base',
    visible: true,
    title: 'Openstreetmap',
    source: new OLOSM({
      projection: 'EPSG:3857',
    }),
  });

  const googleLayer = new OLTile({
    type: 'base',
    visible: false,
    title: 'Google Maps',
    source: new OLTileImage({
      url: 'http://khm{0-3}.googleapis.com/kh?v=742&hl=pl&&x={x}&y={y}&z={z}',
    }),
  });
  // googleLayer.type = 'base';

  const bingLayer = new OLTile({
    type: 'base',
    title: 'Bing',
    visible: false,
    // preload: Infinity,
    source: new OLSBing({
      key: 'AmZbHjfWoosiM_wNCJPR_gkkobRA1ikmQAApFP-3vjaYoZmhLnXSEfl1TUOl3W2Z',
      imagerySet: ['Aerial'],
      projection: 'EPSG:3857',
      // use maxZoom 19 to see stretched tiles instead of the BingMaps
      // "no photos at this zoom level" tiles
      // maxZoom: 19
    }),
  });

  const vector = new OLLVector({
    title: 'Felder',
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
  vector.set('title', 'Felder');

  let bmapOrthoLayer = '';
  let bmapHidpiLayer = '';
  let bmapGrau = '';

  fetch(capabilitiesUrl)
    .then(response => response.text())
    .then((text) => {
      const result = new OLWmsCap().read(text);
      const options = OLSWmts.optionsFromCapabilities(result, {
        layer: 'bmaporthofoto30cm', // layer,
        matrixSet: 'google3857',
        style: 'normal',
      });
      options.tilePixelRatio = 2;
      bmapOrthoLayer = new OLTile({
        type: 'base',
        visible: false,
        title: 'basemap Orthofoto',
        source: new OLSWmts(options),
      });
      const optionshigdpi = OLSWmts.optionsFromCapabilities(result, {
        layer: 'bmaphidpi', // layer,
        matrixSet: 'google3857',
        style: 'normal',
      });
      bmapHidpiLayer = new OLTile({
        type: 'base',
        visible: false,
        title: 'basemap.at Hidpi',
        source: new OLSWmts(optionshigdpi),
      });
      const optionsgrau = OLSWmts.optionsFromCapabilities(result, {
        layer: 'bmapgrau', // layer,
        matrixSet: 'google3857',
        style: 'normal',
      });
      bmapGrau = new OLTile({
        type: 'base',
        visible: false,
        title: 'basemap.at Grau',
        source: new OLSWmts(optionsgrau),
      });
      baselayers.getLayers().push(vector);
      baselayers.getLayers().push(googleLayer);
      baselayers.getLayers().push(bingLayer);
      baselayers.getLayers().push(bmapOrthoLayer);
      baselayers.getLayers().push(bmapGrau);
      baselayers.getLayers().push(bmapHidpiLayer);
      baselayers.getLayers().push(olsm);
      return baselayers;
    });
}

export default {
  setupLayers,
};
