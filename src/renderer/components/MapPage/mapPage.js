import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import('leaflet/dist/leaflet.css');

function basemapLayers(mapStyle, imgType) {
  const basemapUrl = `http://{s}.wien.gv.at/basemap/${mapStyle}/normal/google3857/{z}/{y}/{x}.${imgType}`;
  const basemapAttrib = 'Map data &copy; <a href="https://www.basemap.at">basemap.at</a>';
  return L.tileLayer(basemapUrl, {
    type: 'map',
    subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
    attribution: basemapAttrib,
  });
}

function osmap() {
  // Attribution OSM-MAP from tile.osm.org wmts-server
  const osm = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
  const osmAttr =
    '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors';
  return L.tileLayer(osm, {
    type: 'map',
    attribution: osmAttr,
    zIndex: 1,
    maxZoom: 18,
  });
}

function googleMaps() {
  return L.gridLayer.googleMutant({
    type: 'satellite',
  });
}

const mapLayers = {
  'basemap.at Color': basemapLayers('geolandbasemap', 'png'),
  'basemap.at Grau': basemapLayers('bmapgrau', 'png'),
  'basemap.at Orthophoto': basemapLayers('bmaporthofoto30cm', 'jpeg'),
  OpenStreetMap: osmap(),
  GoogleMaps: googleMaps(),
};

export default function initMap() {
  const mymap = L.map('mapdiv', {
    crs: L.CRS.EPSG3857,
  });
  mymap.setView([47.34, 15.83], 7);

  mymap.addLayer(mapLayers['basemap.at Color']);

  const layerCtrl = L.control.layers(mapLayers);
  mymap.addControl(layerCtrl);
}
