'use strict';
import Navigo from 'navigo';
import mapboxgl from 'mapbox-gl';
import DataManager from './data-manager.class.js';
import flatpickr from "flatpickr";

let dataManager = new DataManager('https://apis.detroitmi.gov/data_cache/city_data_summaries/');

// ---- mapbox config ------
const MapboxDraw = require('@mapbox/mapbox-gl-draw');
const MapboxGeocoder = require('mapbox-gl-geocoder');
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjajd3MGlodXIwZ3piMnhudmlzazVnNm44In0.BL29_7QRvcnOrVuXX_hD9A';
const detroitBBox = [-83.3437,42.2102,-82.8754,42.5197];
let map;
// ---- end mapboxx config -----

// ---- router config ----
var root = null;
var useHash = false; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);
// ---- end router config ----

// IIFE. Loads the initial site componets and routing
(function(){

    // Immediately setup the map, don't wait for any network calls or routing.
    setupMap();

    // Add listeners for static buttons.
    setupMainButtons();
    dataTypeSelectors();
    addDateBoundaryPicker();

    // Router handels the "state" of the view for each url
    router
        .on({
            '/':function () {
                // show home page here
                //console.log("home")
                //document.getElementById("map-data-panel").className = "active";

                //console.log(dataManager.setupDatasetQuery('blight'));

            },
    }).resolve();

})(window);

function setupMap(){
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v10',
        center: [-83.10, 42.36],
        zoom: 13
    });

    map.on('load', ()=>{
        //setBoundry('neighborhoods')

        map.addSource('parcels', {
            type: 'vector',
            url: 'mapbox://slusarskiddetroitmi.cwobdjn0'
        });

        map.addLayer({
          "id": "parcel-line",
           "type": "line",
           "source": "parcels",
           "minzoom": 15,
           "layout": {
           },
           "paint": {
                "line-color":"#cbcbcb",
           },
           'source-layer': 'parcelsgeojson'
        });

        map.addLayer( {
            "id": "parcel-fill",
            "type": "fill",
            "source": "parcels",
            "minzoom": 15,
            "layout": {
            },
            "paint": {
                 "fill-color":"#fff",
                 "fill-opacity":0.5
            },
            'source-layer': 'parcelsgeojson',
            "event": true
         },);

         setPossibleBounds('neighborhoods')
    });

    map.on('click', 'possibleBounds', function(e){
      // get the feature details
      let features = map.queryRenderedFeatures(e.point);

      // get the geo cords and update the data manager.
      // all calls for new data will use the passed bounds
      let geo = features[0]
      console.log("Geo Feature:", geo);
      dataManager.updateBounds(map, geo);
      let location = document.getElementById("current-location")

      // Update the interface with the bounds name
      let name = features[0].properties.name
      location.innerHTML = name
    });

    map.on('click', 'parcel-fill', function(e){
      let features = map.queryRenderedFeatures(e.point, {layers: ['parcel-fill']});
      console.log("Something clicked: ", features)
      let parcelDetails = document.querySelector('.current-parcel')
      highlightParcel(parcelDetails);
      let parcelNumber = features[0].properties.parcelno
      dataManager.getParcelDetails(parcelNumber);
      parcelDetails.innerHTML = parcelNumber
    })

    map.on('sourcedataloading', function(e) {
      //console.log("style loaded: ", e)
    });
}

function highlightParcel(parcel){
  console.log(parcel)
}

// Setup the event listeners for non dynamic buttons
function setupMainButtons(){
  let boundsButtons = document.querySelectorAll("[name=boundry]")
  console.log(boundsButtons)
  for(let button of boundsButtons){
    button.addEventListener('change', (e)=>{
      setPossibleBounds(e.target.dataset.id)
    })
  }
}

// All boundry collections are on the same layer
// When you want to change the bounds set that's displayed
// We just update the source url instead of removing the layer for a new one
// The first time this is run it creates the layer if one is not found
function setPossibleBounds(name){
    let bounds = dataManager.getBoundsDetails(name);
    console.log('setPossibleBounds: ', bounds)

    if(map.getSource('possibleBounds')){
      map.getSource('possibleBounds').setData(bounds.url);
    }else{
      map.addSource('possibleBounds', {
          type: 'geojson',
          data: bounds.url
      });

      map.addLayer({
          'id': 'possibleBounds',
          'type': 'fill',
          'maxzoom': 15,
          'source': 'possibleBounds',
          'paint': bounds.paint
      })
    }
}

function dataTypeSelectors(){
    var checkboxes = document.getElementsByClassName("checkbox")
    for(let dataToggler of checkboxes){
        dataToggler.addEventListener("click",  event =>{
            let dataset = event.target.dataset.id
            dataManager.addToMap(map, {name: dataset});
        });
    }
}

function addDateBoundaryPicker(){
    flatpickr('#start-date', {
      altInput: true,
      altFormat: "F j, Y",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates){
        dataManager.startDate = document.getElementById("start-date").value;
        dataManager.refresh(map);
      }
    });
    flatpickr('#end-date', {
      altInput: true,
      altFormat: "F j, Y",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates){
        dataManager.endDate = document.getElementById("end-date").value;
        dataManager.refresh(map);
      }
    });
}
