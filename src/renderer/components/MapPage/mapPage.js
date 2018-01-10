// import OLCollection from 'ol/collection';
// import OLSVector from 'ol/source/vector';
// import OLLVector from 'ol/layer/vector';
// import OLFill from 'ol/style/fill';
// import OLStyle from 'ol/style/style';
// import OLStroke from 'ol/style/stroke';
// import OLCircle from 'ol/style/circle';
import OLTile from 'ol/layer/tile';
import OLOSM from 'ol/source/osm';
// import OLTileImage from 'ol/source/tileimage';
import OLMap from 'ol/map';
import OLView from 'ol/view';
// import OLControl from 'ol/control';

// const wgs84Sphere = new ol.Sphere(6378137); brauche ich für berechnungen

export default function initMap() {
  const myMap = new OLMap({
    layers: [
      new OLTile({
        source: new OLOSM(),
      }),
    ],
    target: 'mapdiv',
    view: new OLView({
      center: [0, 0],
      zoom: 2,
    }),
  });

  myMap.render();
}
