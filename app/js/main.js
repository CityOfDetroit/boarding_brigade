'use strict';
import Controller from './controller.class.js';
import Connector from './connector.class.js';
const Navigo = require('navigo');
const root = null;
const useHash = false; // Defaults to: false
const hash = '#!'; // Defaults to: '#'
let router = new Navigo(root, useHash, hash);

router
  .on({
    'mayor': function () {
      console.log("mayor's view");
    },
    '*': function () {
      console.log('loading default view');
    }
  })
  .resolve();

function initialLoad(){
  const dataURL = 'js/layers.json';
  let controller = null;
  fetch(dataURL).then(function(response) {
    var contentType = response.headers.get("content-type");
    if(contentType && contentType.includes("application/json")) {
      return response.json();
    }
    throw new TypeError("Oops, we haven't got JSON!");
  })
  .then(function(json) {
    console.log(json);
    controller = new Controller({
      styleURL: 'mapbox://styles/mapbox',
      mapContainer: 'map',
      geocoder: true,
      controls: true,
      draw: true,
      baseLayers: {
        street: 'streets-v10',
        satellite: 'cj774gftq3bwr2so2y6nqzvz4'
      },
      center: [-83.10, 42.36],
      zoom: 10.75,
      boundaries: {
        sw: [-83.3437,42.2102],
        ne: [-82.8754,42.5197]
      },
      sources: json.sources,
      layers: [
        {
          "id": "address-point",
          "source": "address-point",
          "type": "circle",
          "paint": {
              "circle-radius": 10,
              "circle-color": "#007cbf"
          }
        },
        {
          "id": "city-fill",
          "type": "fill",
          "source": "city",
          "maxzoom": 15,
          "layout": {
          },
          "paint": {
               "fill-color":"#9fd5b3",
               "fill-opacity":.5
          }
         },
        {
         "id": "city-line",
         "type": "line",
         "source": "city",
         "layout": {
         },
         "paint": {
              "line-color":"#004544",
              "line-width": 2
         }
        },
        {
            "id": "parcel-fill",
            "type": "fill",
            "source": "parcels",
            "minzoom": 15.5,
            "layout": {
            },
            "paint": {
                 "fill-color":"#fff",
                 "fill-opacity":0
            },
            'source-layer': 'parcelsgeojson',
            "event": true
         },
         {
            "id": "parcel-line",
            "type": "line",
            "source": "parcels",
            "minzoom": 15.5,
            "layout": {
            },
            "paint": {
                 "line-color":"#cbcbcb",
            },
            'source-layer': 'parcelsgeojson'
         },
         {
           "id": "parcel-fill-selected",
           "type": "line",
           "source": "parcels",
           "minzoom": 15.5,
           "layout": {},
           "paint": {
             "line-color": "#BD0019",
             "line-width": 3
           },
           "source-layer": "parcelsgeojson",
           "filter": ["==", "parcelno", ""]
         }
      ]
    },{
      lat: 0,
      lng: 0,
      zoom: 0,
      boundary: '',
      dataSets: '',
      polygon: ''
    },
    json,
    ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"]);
  })
  .catch(function(error) { console.log(error); });
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(function(btn){
    btn.addEventListener('click',function(ev){
      // console.log(ev);
      if(ev.target.tagName === "DIV"){
        // if(ev.target.className != "tab-btn active"){
        //   document.querySelector('.tab-btn.active').className = 'tab-btn';
        //   controller.createPanelData(ev.target.children[1].innerText, controller);
        //   ev.target.className = 'tab-btn active';
        // }
        document.querySelector('.tab-btn.active').className = 'tab-btn';
        controller.createPanelData(ev.target.children[1].innerText, controller);
        ev.target.className = 'tab-btn active';
      }else{
        // if(ev.target.parentNode.className != "tab-btn active"){
        //   document.querySelector('.tab-btn.active').className = 'tab-btn';
        //   controller.createPanelData(ev.target.parentNode.children[1].innerText, controller);
        //   ev.target.parentNode.className = 'tab-btn active';
        // }
        document.querySelector('.tab-btn.active').className = 'tab-btn';
        controller.createPanelData(ev.target.parentNode.children[1].innerText, controller);
        ev.target.parentNode.className = 'tab-btn active';
      }
    });
  });
  let closeAlertBtns = document.querySelectorAll('.close');
  closeAlertBtns.forEach(function(btn){
    btn.addEventListener('click', function(ev){
        controller.closeAlert(ev)
    });
  });
  document.getElementById("hidde-panel-btn").addEventListener('click', function(){
    document.getElementById("map-side-panel").className = "";
  });
  document.getElementById("hidde-panel-small-btn").addEventListener('click', function(){
    document.getElementById("map-side-panel-small").className = "";
  });
  document.getElementById("layers-btn").addEventListener('click', function(){
    document.getElementById("map-data-panel").className = "active";
  });
  document.getElementById("hidde-map-data-btn").addEventListener('click', function(){
    document.getElementById("map-data-panel").className = "";
  });
  document.getElementById("buffer-btn").addEventListener('click', function(){
    controller.buffer.editBuffer(controller);
  });
  let layerBtns = document.querySelectorAll('input[name="datasets"]');
  layerBtns.forEach(function(btn){
    btn.addEventListener('click', function(ev){
      controller.sandBoxLayers(ev, controller);
    });
  });
}
