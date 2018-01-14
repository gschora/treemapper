import OLLayerSwitcher from 'ol3-layerswitcher';
import 'ol3-layerswitcher/src/ol3-layerswitcher.css';

function setupCtrls() {
  const layerSwitcher = new OLLayerSwitcher({
    tipLabel: 'Karten',
  });
  return layerSwitcher;
}
export default {
  setupCtrls,
};
