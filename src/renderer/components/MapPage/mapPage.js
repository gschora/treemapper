import L from 'leaflet';
import('leaflet/dist/leaflet.css');

export default function initMap() {
  const mymap = L.map('mapdiv').setView([51.505, -0.09], 13);
  mymap.setZoom(2);

  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18,
    minZoom: 2,
  }).addTo(mymap);
}
