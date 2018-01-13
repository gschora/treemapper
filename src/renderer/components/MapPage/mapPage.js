import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-draw';
import('leaflet/dist/leaflet.css');
import('leaflet-draw/dist/leaflet.draw.css');

let mymap = '';
let drawnItems = '';

function basemapLayers(mapStyle, imgType) {
  const basemapUrl = `http://{s}.wien.gv.at/basemap/${mapStyle}/normal/google3857/{z}/{y}/{x}.${imgType}`;
  const basemapAttrib = 'Map data &copy; <a href="https://www.basemap.at">basemap.at</a>';
  return L.tileLayer(basemapUrl, {
    type: 'map',
    subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
    attribution: basemapAttrib,
    maxZoom: 19,
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
    // maxZoom: 19,
  });
}

function googleMaps() {
  return L.gridLayer.googleMutant({
    type: 'satellite',
  });
}

function setDEText() {
  L.drawLocal.draw.toolbar.buttons.polygon = 'Fläche';
  L.drawLocal.draw.toolbar.buttons.polyline = 'Strecke';
  L.drawLocal.draw.toolbar.finish.title = 'Zeichnung speichern';
  L.drawLocal.draw.toolbar.finish.text = 'speichern';
  L.drawLocal.draw.toolbar.undo.title = 'den letzten Punk löschen';
  L.drawLocal.draw.toolbar.undo.text = 'rückgängig';
  L.drawLocal.draw.toolbar.actions.title = 'Zeichnen abbrechen';
  L.drawLocal.draw.toolbar.actions.text = 'abbrechen';
  L.drawLocal.draw.handlers.polygon.tooltip.start = 'zum Starten auf die Karte klicken...';
  L.drawLocal.draw.handlers.polygon.tooltip.cont = '';
  L.drawLocal.draw.handlers.polygon.tooltip.end = 'zum Schließen auf den ersten Punkt klicken...';
  L.drawLocal.draw.handlers.polyline.tooltip.start = 'zum Starten auf die Karte klicken...';
  L.drawLocal.draw.handlers.polyline.tooltip.cont = '';
  L.drawLocal.draw.handlers.polyline.tooltip.end = 'zum Beenden auf den letzten Punkt klicken...';
  L.drawLocal.draw.handlers.polyline.error =
    '<strong>Fehler:</strong> Linien dürfen sich nicht überschneiden!';
  L.drawLocal.edit.toolbar.actions.save.title = 'Änderungen speichern';
  L.drawLocal.edit.toolbar.actions.save.text = 'speichern';
  L.drawLocal.edit.toolbar.actions.cancel.title = 'Änderungen verwerfen';
  L.drawLocal.edit.toolbar.actions.cancel.text = 'abbrechen';
  L.drawLocal.edit.toolbar.actions.clearAll.title = 'ACHTUNG!!! alle Zeichnungen löschen...';
  L.drawLocal.edit.toolbar.actions.clearAll.text = 'Alles löschen';
  L.drawLocal.edit.toolbar.buttons.edit = 'editieren';
  L.drawLocal.edit.toolbar.buttons.editDisabled = 'keine Zeichnungen zum Editieren...';
  L.drawLocal.edit.toolbar.buttons.remove = 'löschen';
  L.drawLocal.edit.toolbar.buttons.removeDisabled = 'keine Zeichnungen zum Löschen...';
  L.drawLocal.edit.handlers.edit.tooltip.text = 'zum Editieren die Kästchen ziehen...';
  L.drawLocal.edit.handlers.edit.tooltip.subtext =
    'auf "abbrechen" klicken um die Änderungen zu verwerfen...';
  L.drawLocal.edit.handlers.remove.tooltip.text = 'zum Löschen auf eine Zeichnung klicken...';
}

const mapLayers = {
  'basemap.at Color': basemapLayers('geolandbasemap', 'png'),
  'basemap.at Grau': basemapLayers('bmapgrau', 'png'),
  'basemap.at Orthophoto': basemapLayers('bmaporthofoto30cm', 'jpeg'),
  OpenStreetMap: osmap(),
  GoogleMaps: googleMaps(),
};

function setupMapCtrl() {
  setDEText();

  drawnItems = new L.FeatureGroup();
  mymap.addLayer(drawnItems);
  const layerCtrl = L.control.layers(mapLayers);
  mymap.addControl(layerCtrl);

  const drawCtrl = new L.Control.Draw({
    draw: {
      marker: false,
      circlemarker: false,
      circle: false,
      rectangle: false,
      polygon: {
        allowIntersection: false,
        showArea: true,
        shapeOptions: {
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.5,
        },
      },
      polyline: {
        allowIntersection: false,
        showArea: true,
        shapeOptions: {
          weight: 2,
          opacity: 0.9,
        },
      },
    },
    edit: {
      featureGroup: drawnItems,
      poly: {
        allowIntersection: false,
      },
    },
  });
  mymap.addControl(drawCtrl);

  mymap.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    layer.on('click', () => {
      // console.log(drawnItems.getLayerId(layer));
      console.log(L.GeometryUtil.geodesicArea(layer.getLatLngs()));
    });
    drawnItems.addLayer(layer);
  });
}

export default {
  initMap() {
    mymap = L.map('mapdiv', {
      crs: L.CRS.EPSG3857,
    });
    mymap.setView([47.34, 15.83], 16);

    mymap.addLayer(mapLayers.OpenStreetMap);

    setupMapCtrl();
    window.map = mymap;
    window.map.drawnItems = drawnItems;

    mymap.invalidateSize(); // this is a hack, because map is not loading completely without this... https://github.com/Leaflet/Leaflet/issues/694
  },
};
