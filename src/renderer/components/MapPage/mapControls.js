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
import OLIDblClkZoom from 'ol/interaction/doubleclickzoom';
// import OLCollection from 'ol/collection';

// import OLControl from 'ol/control';
import ol from 'ol';
import { setTimeout } from 'timers';

let map;
let sketch;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;
let measureInfoElement;
let measureInfo;
let elBtnFeatureDel;
// var continuePolygonMsg = 'Click to continue drawing the polygon';
// var continueLineMsg = 'Click to continue drawing the line';
const wgs84Sphere = new OLSphere(6378137);
let measureMode = 'none';
let draw; // global so we can remove it later
let source;
let vector;

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
    output = `${Math.round(area)} ha`;
  } else {
    output = `${Math.round(area)} m<sup>2</sup>`;
  }
  return output;
}

function delFeature() {
  if (select.getFeatures().getLength() > 0) {
    const f = select.getFeatures().item(0);
    vector.getSource().removeFeature(f);
    select.getFeatures().clear();
  }
  measureInfoElement.hidden = true;
  elBtnFeatureDel.hidden = true;

  elBtnFeatureDel.removeEventListener('click', delFeature, false);
  elBtnFeatureDel.removeEventListener('touchstart', delFeature, false);
}

select.on(
  'select',
  (evt) => {
    if (evt.selected.length > 0) {
      elBtnFeatureDel.hidden = false;
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
      }
      measureInfoElement = document.createElement('div');
      measureInfoElement.id = 'mInfoEl';
      measureInfoElement.className = 'tooltip tooltip-static';
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
        color: 'rgba(0,60,136, 0.3)',
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
          color: 'rgba(0,60,136, 0.2)',
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
      measureTooltipElement.className = 'tooltip tooltip-static';
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
      measureMode = 'none';
      document.getElementById('measureLineCtrlBtn').style.backgroundColor = '';
      document.getElementById('measureAreaCtrlBtn').style.backgroundColor = '';
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
  button.id = 'measureLineCtrlBtn';
  button.appendChild(i);

  //   var this_ = this;
  const setMeasureLine = () => {
    if (measureMode === 'LineString') {
      measureMode = 'none';
      map.removeInteraction(draw);
      map.addInteraction(select);
      map.addInteraction(modify);
      button.style.backgroundColor = '';
    } else {
      measureMode = 'LineString';
      button.style.backgroundColor = 'rgba(0, 102, 0,.6)';
      document.getElementById('measureAreaCtrlBtn').style.backgroundColor = '';
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

  const button = document.createElement('button');
  button.id = 'measureAreaCtrlBtn';
  const element = document.createElement('div');

  const setMeasureArea = () => {
    if (measureMode === 'Polygon') {
      measureMode = 'none';
      map.removeInteraction(draw);
      map.addInteraction(select);
      map.addInteraction(modify);
      button.style.backgroundColor = '';
    } else {
      measureMode = 'Polygon';
      button.style.backgroundColor = 'rgba(0, 102, 0,.6)';
      document.getElementById('measureLineCtrlBtn').style.backgroundColor = '';
      map.removeInteraction(draw);
      addInteraction();
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

  elBtnFeatureDel = document.createElement('div');
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
  vector = vectorLayer;
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
