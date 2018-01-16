import OLLayerSwitcher from 'ol3-layerswitcher';
import 'ol3-layerswitcher/src/ol3-layerswitcher.css';
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
// import OLCollection from 'ol/collection';

// import OLControl from 'ol/control';
import ol from 'ol';

// const c = console;

let map;
let sketch;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;
// let measureInfoElement;
// let measureInfo;
// var continuePolygonMsg = 'Click to continue drawing the polygon';
// var continueLineMsg = 'Click to continue drawing the line';
const wgs84Sphere = new OLSphere(6378137);
let measureMode = 'none';
let draw; // global so we can remove it later

let source;

const select = new OLISelect({
  wrapX: false,
  hitTolerance: 5,
});

const modify = new OLIModify({
  features: select.getFeatures(),
  // the SHIFT key must be pressed to delete vertices, so
  // that new vertices can be drawn at the same position
  // of existing vertices
  deleteCondition(event) {
    return OLEventCondition.shiftKeyOnly(event) && OLEventCondition.singleClick(event);
  },
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
    output = `${Math.round(area)} ha`;
  } else {
    output = `${Math.round(area)} m<sup>2</sup>`;
  }
  return output;
}

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new OLOverlay({
    element: measureTooltipElement,
    offset: [-50, -25],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new OLOverlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

function addInteraction() {
  draw = new OLDraw({
    source,
    type: measureMode,
    style: new OLStyle({
      fill: new OLFill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new OLStroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new OLCircle({
        radius: 5,
        stroke: new OLStroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new OLFill({
          color: 'rgba(255, 255, 255, 0.2)',
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

  draw.on(
    'drawend',
    // (evt) => {
    () => {
      // fid++;
      // evt.feature.setId(fid);
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      createMeasureTooltip();
    },
    this,
  );

  createMeasureTooltip();
  createHelpTooltip();
}

const MeasureLineControl = function setupMeasLineCtrl(optOptions) {
  const options = optOptions || {};

  const i = document.createElement('i');
  i.setAttribute('aria-hidden', true);
  i.setAttribute('class', 'material-icons icon');
  i.innerHTML = 'timeline';
  const button = document.createElement('button');
  button.appendChild(i);

  //   var this_ = this;
  const setMeasureLine = () => {
    if (measureMode === 'LineString') {
      measureMode = 'none';
      map.removeInteraction(draw);
      map.addInteraction(select);
      map.addInteraction(modify);
    } else {
      measureMode = 'LineString';
      map.removeInteraction(draw);
      addInteraction();
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

  // const i = document.createElement('i');
  // // i.setAttribute('aria-hidden', true);
  // i.setAttribute('class', 'measureAreaCtrl');
  // i.innerHTML = ' ';
  const button = document.createElement('button');
  button.id = 'measureAreaCtrlBtn';
  // button.appendChild(i);

  const setMeasureArea = () => {
    if (measureMode === 'Polygon') {
      measureMode = 'none';
      map.removeInteraction(draw);
      map.addInteraction(select);
      map.addInteraction(modify);
    } else {
      measureMode = 'Polygon';
      map.removeInteraction(draw);
      addInteraction();
    }
  };

  button.addEventListener('click', setMeasureArea, false);
  button.addEventListener('touchstart', setMeasureArea, false);

  const element = document.createElement('div');
  element.className = 'btn_measure_area ol-unselectable ol-control';
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

  const elBtnFeatureDel = document.createElement('div');
  elBtnFeatureDel.className = 'ol-control btn_feature_del'; // ol-unselectable
  elBtnFeatureDel.appendChild(button);
  elBtnFeatureDel.hidden = true;

  OLCControl.call(this, {
    element: elBtnFeatureDel,
    target: options.target,
  });
};

function setupCtrls(olmap, vectorLayer) {
  map = olmap;
  source = vectorLayer.getSource();

  const layerSwitcher = new OLLayerSwitcher({
    tipLabel: 'Karten',
  });
  olmap.addControl(layerSwitcher);

  ol.inherits(MeasureLineControl, OLCControl);
  ol.inherits(MeasureAreaControl, OLCControl);
  ol.inherits(FeatureDeleteControl, OLCControl);
  olmap.addControl(new MeasureLineControl());
  olmap.addControl(new MeasureAreaControl());
  olmap.addControl(new FeatureDeleteControl());
}

export default {
  setupCtrls,
};
