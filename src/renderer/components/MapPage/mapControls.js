import OLLayerSwitcher from 'ol-layerswitcher';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import OLSphere from 'ol/sphere';
import OLISelect from 'ol/interaction/select';
import OLIModify from 'ol/interaction/modify';
import OLCControl from 'ol/control/control';
import OLDraw from 'ol/interaction/draw';
import OLFill from 'ol/style/fill';
import OLStyle from 'ol/style/style';
import OLStroke from 'ol/style/stroke';
import OLCircle from 'ol/style/circle';
import OLEventCondition from 'ol/events/condition';
import OLProj from 'ol/proj';
import OLOverlay from 'ol/overlay';
import OLPolygon from 'ol/geom/polygon';
import OLLineString from 'ol/geom/linestring';
import OLPoint from 'ol/geom/point';
import OLFeature from 'ol/feature';
import OLIDblClkZoom from 'ol/interaction/doubleclickzoom';
import OLFormat from 'ol/format/geojson';
// import OLCoordinate from 'ol/coordinate';
// import OLMousePosition from 'ol/control/mouseposition';

// import OLCollection from 'ol/collection';

// import OLControl from 'ol/control';
import ol from 'ol';
import { setTimeout } from 'timers';

let map;
let sketch;
let addressTooltip;
let addressTooltipElement;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;
let measureInfoElement;
let measureInfo;
let homeIconElement;
let homeIconOverlay;
let elBtnFeatureDel;
let elBtnFeatureEdit;
// var continuePolygonMsg = 'Click to continue drawing the polygon';
// var continueLineMsg = 'Click to continue drawing the line';
const wgs84Sphere = new OLSphere(6378137);
let measureMode = 'none';
let draw; // global so we can remove it later
let source;
// let vector;
const formatFeatureJSON = new OLFormat();

const select = new OLISelect({
  wrapX: false,
  hitTolerance: 5,
});

function formatLength(line) {
  let length;
  const coordinates = line.getCoordinates();
  length = 0;
  const sourceProj = map.getView().getProjection();
  for (let i = 0, ii = coordinates.length - 1; i < ii; i += 1) {
    const c1 = OLProj.transform(coordinates[i], sourceProj, 'EPSG:4326');
    const c2 = OLProj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
    length += wgs84Sphere.haversineDistance(c1, c2);
  }
  let output;
  if (length > 1000) {
    output = `${Math.round(length / 10) / 100} km`;
  } else {
    output = `${Math.round(length * 100) / 100} m`;
  }
  return output;
}

function formatArea(polygon) {
  let area = null;
  // let measuredArea = 0;
  const sourceProj = map.getView().getProjection();
  const geom /** @type {ol.geom.Polygon} */ = polygon.clone().transform(sourceProj, 'EPSG:4326');
  const coordinates = geom.getLinearRing(0).getCoordinates();
  area = Math.abs(wgs84Sphere.geodesicArea(coordinates));

  let output;
  // measuredArea = Math.round(area * 100) / 100;

  if (area > 10000) {
    output = `${Math.round(area / 10) / 1000} ha`;
  } else {
    output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
  }
  return output;
}

function delFeature() {
  if (select.getFeatures().getLength() > 0) {
    select.getFeatures().forEach((f) => {
      window.treemapper.fieldsLayer.getSource().removeFeature(f);
    });
    select.getFeatures().clear();
  }

  map.removeOverlay(measureInfo);
  map.removeOverlay(measureTooltip);
  measureInfoElement.hidden = true;
  elBtnFeatureDel.hidden = true;

  elBtnFeatureDel.removeEventListener('click', delFeature, false);
  elBtnFeatureDel.removeEventListener('touchstart', delFeature, false);
}

function createHomeOverlay() {
  homeIconElement = document.getElementById('homeIcon');

  if (homeIconOverlay === undefined) {
    homeIconOverlay = new OLOverlay({
      id: 'homeIconOverlayId',
      element: homeIconElement,
      // offset: [2, -5],
      positioning: 'center-center',
    });
    map.addOverlay(homeIconOverlay);
  }
  if (map.getOverlayById('homeIconOverlayId') === null) {
    map.addOverlay(homeIconOverlay);
  }
  window.treemapper.o = homeIconOverlay;
  homeIconOverlay.setPosition(window.treemapper.mainSettings.homeCoords);
}

function autoSaveFeaturesInDb() {
  const fs = [];
  source.getFeatures().forEach((feat) => {
    fs.push(formatFeatureJSON.writeFeature(feat));
  });
  window.treemapper.lfdb.setItem('drawnFeatures', fs).catch(() => {});
}

function getDrawnFeaturesFromDb() {
  if (window.treemapper.loadedFeatures === undefined) {
    window.treemapper.lfdb.getItem('drawnFeatures').then((val) => {
      if (val !== null) {
        // disable eventlistener, otherwise the features added will added in db
        source.un('addfeature', autoSaveFeaturesInDb);
        val.forEach((item) => {
          source.addFeature(formatFeatureJSON.readFeature(item));
        });
        source.on('addfeature', autoSaveFeaturesInDb);
        window.treemapper.loadedFeatures = true;
      }
    });
  }
  createHomeOverlay();
}

function enableBtnFeatureEdit() {
  if (source.getFeatures().length === 0) {
    document.getElementById('btn_feature_edit').disabled = true;
  } else {
    document.getElementById('btn_feature_edit').disabled = false;
  }
}

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'mtooltip mtooltip-measure';
  measureTooltip = new OLOverlay({
    element: measureTooltipElement,
    offset: [-50, -25],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

function createAddressTooltip() {
  addressTooltipElement = document.getElementById('addressttpdiv');
  addressTooltip = new OLOverlay({
    id: 'addressTooltipOverlayId',
    element: addressTooltipElement,
    offset: [2, -5],
    positioning: 'bottom-center',
  });
  map.addOverlay(addressTooltip);
  window.treemapper.e = addressTooltip;
}

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'mtooltip hidden';
  helpTooltip = new OLOverlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

select.on(
  'select',
  (evt) => {
    if (evt.selected.length > 0) {
      if (document.getElementById('btn_feature_edit').className === 'active') {
        elBtnFeatureDel.hidden = false;
      }
      map.removeOverlay(measureInfo);
      const feat = evt.target
        .getFeatures()
        .item(0)
        .getGeometry();
      let output;
      let infoCoord;
      // todo select
      if (feat instanceof OLPolygon) {
        output = formatArea(feat);
        infoCoord = feat.getInteriorPoint().getCoordinates();
        // vm_treesum.$data.treesum = Math.round(
        //   measuredArea /
        //     (vm_treesum.$data.rowdist / 100 * vm_treesum.$data.treedist / 100)
        // );
      } else if (feat instanceof OLLineString) {
        output = formatLength(feat);
        infoCoord = feat.getLastCoordinate();
      } else if (feat instanceof OLPoint) {
        // eslint-disable-next-line no-console
        select.getFeatures().forEach((f) => {
          window.treemapper.savedPlaces.forEach((place) => {
            if (place.locationFeature === f) {
              infoCoord = place.latlng3857;
              output = `${place.streetName} ${place.streetNr}, ${
                place.postalCode
              }</br>${place.latlng.lat.toFixed(5)}  ${place.latlng.lng.toFixed(5)}`;
            }
          });
        });

        // window.treemapper.placesLayer.getSource().removeFeature(feat);
      }
      measureInfoElement = document.createElement('div');
      measureInfoElement.id = 'mInfoEl';
      measureInfoElement.className = 'mtooltip mtooltip-static';
      measureInfoElement.innerHTML = output;
      measureInfo = new OLOverlay({
        element: measureInfoElement,
        offset: [0, -15],
        positioning: 'bottom-center',
      });
      map.addOverlay(measureInfo);
      measureInfo.setPosition(infoCoord);

      elBtnFeatureDel.addEventListener('click', delFeature, false);
      elBtnFeatureDel.addEventListener('touchstart', delFeature, false);
    } else {
      elBtnFeatureDel.hidden = true;
      createMeasureTooltip();
      createHelpTooltip();
      map.removeOverlay(measureInfo);
      map.removeOverlay(measureTooltip);
    }
  },
  this,
);

const modify = new OLIModify({
  features: select.getFeatures(),
  // the SHIFT key must be pressed to delete vertices, so
  // that new vertices can be drawn at the same position
  // of existing vertices
  deleteCondition(event) {
    return OLEventCondition.shiftKeyOnly(event) && OLEventCondition.singleClick(event);
  },
});

modify.on(
  'modifystart',
  () => {
    map.removeOverlay(measureInfo);
  },
  this,
);

modify.on('modifyend', () => {
  autoSaveFeaturesInDb();
});

function addDrawInteraction() {
  draw = new OLDraw({
    source,
    type: measureMode,
    style: new OLStyle({
      fill: new OLFill({
        color: 'rgba(0,60,136, 0.3)',
      }),
      stroke: new OLStroke({
        color: 'rgba(255, 128, 0, 1)',
        lineDash: [10, 10],
        width: 3,
      }),
      image: new OLCircle({
        radius: 5,
        stroke: new OLStroke({
          color: 'rgba(255, 128, 0, 1)',
          width: 3,
        }),
        fill: new OLFill({
          color: 'rgba(0,60,136, 0.5)',
        }),
      }),
    }),
  });
  map.removeInteraction(modify);
  map.removeInteraction(select);
  map.addInteraction(draw);

  draw.on(
    'drawstart',
    (evt) => {
      // set sketch
      sketch = evt.feature;
      let tooltipCoord = evt.coordinate;

      sketch.getGeometry().on('change', (evt) => {
        const geom = evt.target;
        let output;
        if (geom instanceof OLPolygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof OLLineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    },
    this,
  );

  // helper function for end draw with doubleclick
  function pauseDblClck(active) {
    const dblClickInteraction = map
      .getInteractions()
      .getArray()
      .find(interaction => interaction instanceof OLIDblClkZoom);
    dblClickInteraction.setActive(active);
  }
  draw.on(
    'drawend',
    // (evt) => {
    () => {
      // fid++;
      // evt.feature.setId(fid);
      measureTooltipElement.className = 'mtooltip mtooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;

      // hack to fix drawend bug with doubleclick
      pauseDblClck(false);
      map.removeInteraction(draw);
      setTimeout(() => {
        pauseDblClck(true);
      }, 251);
      // -----------------

      select.getFeatures().clear();

      map.addInteraction(select);
      measureMode = 'none';
      document.getElementById('measureLineCtrlBtn').classList.remove('active');
      document.getElementById('measureAreaCtrlBtn').classList.remove('active');
      createMeasureTooltip();
    },
    this,
  );

  createMeasureTooltip();
  createHelpTooltip();
}

function editFeatures() {
  const btn = document.getElementById('btn_feature_edit');
  if (btn.className === 'active') {
    btn.classList.remove('active');
    elBtnFeatureDel.hidden = true;
    // map.addInteraction(select);
    map.removeInteraction(modify);
  } else {
    btn.classList.add('active');
    if (select.getFeatures().getArray().length > 0) {
      elBtnFeatureDel.hidden = false;
    }
    // map.addInteraction(select);
    map.addInteraction(modify);
    map.removeInteraction(draw);
    document.getElementById('measureLineCtrlBtn').classList.remove('active');
    document.getElementById('measureAreaCtrlBtn').classList.remove('active');
  }
}
function disableEditFeatures() {
  const btn = document.getElementById('btn_feature_edit');
  if (btn.className === 'active') {
    btn.classList.remove('active');
    elBtnFeatureDel.hidden = true;
    // map.addInteraction(select);
    map.removeInteraction(modify);
  }
}

const MeasureLineControl = function setupMeasLineCtrl(optOptions) {
  const options = optOptions || {};

  const i = document.createElement('i');
  i.setAttribute('aria-hidden', true);
  i.setAttribute('class', 'material-icons icon');
  i.innerHTML = 'timeline';
  const button = document.createElement('button');
  button.id = 'measureLineCtrlBtn';
  button.title = 'Linie zeichnen';
  button.appendChild(i);

  //   var this_ = this;
  const setMeasureLine = () => {
    map.removeOverlay(measureInfo);
    map.removeOverlay(measureTooltip);

    if (measureMode === 'LineString') {
      measureMode = 'none';
      map.removeInteraction(draw);
      map.addInteraction(select);
      // map.addInteraction(modify);
      button.classList.remove('active');
    } else {
      measureMode = 'LineString';
      button.classList.add('active');
      document.getElementById('measureAreaCtrlBtn').classList.remove('active');
      map.removeInteraction(draw);
      addDrawInteraction();
      disableEditFeatures();
    }
  };

  button.addEventListener('click', setMeasureLine, false);
  button.addEventListener('touchstart', setMeasureLine, false);

  const element = document.createElement('div');
  element.className = 'btn_measure_line ol-unselectable ol-control';
  element.appendChild(button);

  OLCControl.call(this, {
    element,
    target: options.target,
  });
};

const MeasureAreaControl = function setupMeasAreaCtrl(optOptions) {
  const options = optOptions || {};

  const button = document.createElement('button');
  button.id = 'measureAreaCtrlBtn';
  button.title = 'Fläche zeichnen';
  const element = document.createElement('div');

  const setMeasureArea = () => {
    map.removeOverlay(measureInfo);
    map.removeOverlay(measureTooltip);

    if (measureMode === 'Polygon') {
      measureMode = 'none';
      map.removeInteraction(draw);
      // map.addInteraction(select);
      // map.addInteraction(modify);
      button.classList.remove('active');
    } else {
      measureMode = 'Polygon';
      button.classList.add('active');
      document.getElementById('measureLineCtrlBtn').classList.remove('active');
      map.removeInteraction(draw);
      addDrawInteraction();
      disableEditFeatures();
    }
  };

  button.addEventListener('click', setMeasureArea, false);
  button.addEventListener('touchstart', setMeasureArea, false);

  element.className = 'btn_measure_area ol-control';
  element.appendChild(button);

  OLCControl.call(this, {
    element,
    target: options.target,
  });
};

const FeatureDeleteControl = function setupFeatDelCtrl(optOptions) {
  const options = optOptions || {};

  const i = document.createElement('i');
  i.setAttribute('aria-hidden', true);
  i.setAttribute('class', 'material-icons icon');
  i.innerHTML = 'delete_forever';
  const button = document.createElement('button');
  button.id = 'btn_feature_del';
  button.appendChild(i);
  button.title = 'einzelne Features löschen';

  elBtnFeatureDel = document.createElement('div');
  elBtnFeatureDel.className = 'ol-control btn_feature_del'; // ol-unselectable
  elBtnFeatureDel.appendChild(button);
  elBtnFeatureDel.hidden = true;

  OLCControl.call(this, {
    element: elBtnFeatureDel,
    target: options.target,
  });
};

const FeatureEditControl = function setupFeatEditCtrl(optOptions) {
  const options = optOptions || {};

  const i = document.createElement('i');
  i.setAttribute('aria-hidden', true);
  i.setAttribute('class', 'material-icons icon');
  i.innerHTML = 'edit';
  const button = document.createElement('button');
  button.id = 'btn_feature_edit';
  button.appendChild(i);
  button.title = 'Bearbeiten';

  button.addEventListener('click', editFeatures, false);
  button.addEventListener('touchstart', editFeatures, false);

  elBtnFeatureEdit = document.createElement('div');
  elBtnFeatureEdit.className = 'ol-control btn_feature_edit'; // ol-unselectable
  elBtnFeatureEdit.appendChild(button);
  elBtnFeatureEdit.hidden = false;

  OLCControl.call(this, {
    element: elBtnFeatureEdit,
    target: options.target,
  });
};

// const MousePositionControl = new OLMousePosition({
//   coordinateFormat: OLCoordinate.createStringXY(6),
//   projection: 'EPSG:4326',
//   // comment the following two lines to have the mouse position
//   // be placed within the map.
//   // className: 'custom-mouse-position',
//   target: document.getElementById('map-coord'),
//   undefinedHTML: '&nbsp;',
// });

// function reverseGeoCode(latlng) {
//   /* global google */
//   const geocoder = new google.maps.Geocoder();

//   geocoder.geocode({ location: latlng }, (results, status) => {
//     if (status === 'OK') {
//       if (results.length > 0) {
//         window.treemapper.r = results[0];
//         // const lbltxt = document.getElementById('addressttptxt');
//         // lbltxt.innerHTML = `${results[0].formatted_address}<br>${latlng.lat.toFixed(
//         //   6,
//         // )} ${latlng.lng.toFixed(6)}`;
//         addressTooltip.setPosition(
//           OLProj.transform([latlng.lng, latlng.lat], 'EPSG:4326', 'EPSG:3857'),
//         );
//       } else {
//         // eslint-disable-next-line no-console
//         console.error('No location results found');
//       }
//     } else {
//       // window.treemapper.alert('Geocoder failed due to: ' + status);
//     }
//   });
// }
function setAddressTooltip() {
  const adr = window.treemapper.currentRightClickPlace;

  const lbltxt = document.getElementById('addressttptxt');
  lbltxt.innerHTML = `${adr.streetName} ${adr.streetNr}, ${adr.postalCode} ${
    adr.city
  }<br>${adr.latlng.lat.toFixed(5)} ${adr.latlng.lng.toFixed(5)}`;
  addressTooltip.setPosition(adr.latlng3857);
}

function drawLocationFeature(addressobj) {
  const s = window.treemapper.placesLayer.getSource();

  const f = new OLFeature({
    geometry: new OLPoint(addressobj.latlng3857),
  });
  addressobj.locationFeature = f;
  window.treemapper.currentRightClickPlace = addressobj;
  s.addFeature(f);
}

function removeLocationFeature() {
  const s = window.treemapper.placesLayer.getSource();
  s.removeFeature(window.treemapper.currentRightClickPlace.locationFeature);
  window.treemapper.currentRightClickPlace = null;
}

function saveLocationInDB() {
  addressTooltip.setPosition(undefined);
  const fea = [];
  window.treemapper.savedPlaces.forEach((adr) => {
    // vorher das feature löschen, sonstfunktioniert speichern in db nicht
    delete adr.locationFeature;
    fea.push(adr);
  });
  window.treemapper.lfdb.setItem('savedPlaces', fea).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });
}

function getLocationsFromDB() {
  if (window.treemapper.savedPlaces.length === 0) {
    window.treemapper.lfdb.getItem('savedPlaces').then((val) => {
      if (val !== null) {
        val.forEach((addr) => {
          window.treemapper.savedPlaces.push(addr);
          drawLocationFeature(addr);
        });
      }
    });
  }
}

function getAddressObject(latlng3857) {
  /* global google */
  const geocoder = new google.maps.Geocoder();

  const coor = OLProj.transform(latlng3857, 'EPSG:3857', 'EPSG:4326');
  const latlng = { lat: coor[1], lng: coor[0] };

  const addressObject = {
    text: '',
    value: latlng3857,
    streetNr: '',
    streetName: '',
    country: '',
    postalCode: '',
    city: '',
    latlng,
    latlng3857,
  };

  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === 'OK') {
      if (results.length > 0) {
        const rac = results[0].address_components;
        // eslint-disable-next-line no-console
        // console.log(results[0]);
        rac.forEach((item) => {
          item.types.forEach((ty) => {
            if (ty === 'street_number') {
              addressObject.streetNr = item.long_name;
            } else if (ty === 'route') {
              addressObject.streetName = item.long_name;
            } else if (ty === 'country') {
              addressObject.country = item.long_name;
            } else if (ty === 'postal_code') {
              addressObject.postalCode = item.long_name;
            } else if (ty === 'locality') {
              addressObject.city = item.long_name;
            }
          });
        });
        if (window.treemapper.savedPlaces === undefined) {
          window.treemapper.savedPlaces = [];
        }

        addressObject.text = `${addressObject.streetName} ${addressObject.streetNr}, ${
          addressObject.postalCode
        }`;

        // window.treemapper.savedPlaces.push(addressObject);
        // window.treemapper.currentRightClickPlace = addressObject;

        drawLocationFeature(addressObject);
        setAddressTooltip();
        // eslint-disable-next-line no-console
        // console.log(addressObject);
      } else {
        // eslint-disable-next-line no-console
        console.error('No location results found');
      }
    } else {
      // window.treemapper.alert('Geocoder failed due to: ' + status);
    }
  });
}

function rightClick() {
  map.getViewport().addEventListener('contextmenu', (e) => {
    // contextmenu is right-click
    e.preventDefault();

    if (addressTooltip.getPosition() === undefined) {
      // const coor = OLProj.transform(map.getEventCoordinate(e), 'EPSG:3857', 'EPSG:4326');
      // const latlng = { lat: coor[1], lng: coor[0] };
      // reverseGeoCode(latlng);
      getAddressObject(map.getEventCoordinate(e));
    } else {
      addressTooltip.setPosition(undefined);
      if (window.treemapper.currentRightClickPlace.locationFeature !== undefined) {
        removeLocationFeature();
      }
    }

    window.treemapper.e = addressTooltip;
  });
}

function setupCtrls() {
  map = window.treemapper.omap;
  // vector = vecLayers.fieldsLayer;
  source = window.treemapper.fieldsLayer.getSource();
  source.on('change', () => {
    enableBtnFeatureEdit(); // check if there is at least one feature to enable button
  });

  source.on('addfeature', autoSaveFeaturesInDb);

  source.on('removefeature', () => {
    autoSaveFeaturesInDb();
  });

  const layerSwitcher = new OLLayerSwitcher({
    tipLabel: 'Karten',
    className: 'mdi',
  });
  map.addControl(layerSwitcher);

  ol.inherits(MeasureLineControl, OLCControl);
  ol.inherits(MeasureAreaControl, OLCControl);
  ol.inherits(FeatureEditControl, OLCControl);
  ol.inherits(FeatureDeleteControl, OLCControl);

  map.addControl(new MeasureLineControl());
  map.addControl(new MeasureAreaControl());
  map.addControl(new FeatureEditControl());
  map.addControl(new FeatureDeleteControl());
  enableBtnFeatureEdit();
  map.addInteraction(select);

  createAddressTooltip();

  rightClick();

  getDrawnFeaturesFromDb();
}

export default {
  setupCtrls,
  createHomeOverlay,
  getAddressObject,
  drawLocationFeature,
  saveLocationInDB,
  getLocationsFromDB,
};
