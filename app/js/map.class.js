'use strict';
import mapboxgl from 'mapbox-gl';
import Connector from './connector.class.js';
var MapboxGeocoder = require('mapbox-gl-geocoder');
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjajd3MGlodXIwZ3piMnhudmlzazVnNm44In0.BL29_7QRvcnOrVuXX_hD9A';
export default class Map {
  constructor(init) {
    if(init.geocoder){
      this.geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
      });
      this.geocoder.on('result', function(e) {
        // console.log(ev);
        Map.geocoderResultsFunction(e);
      });
    }
    this.prevState = null;
    this.currentState = {
      baseMap: init.baseLayers.street,
      center: init.center,
      zoom: init.zoom,
      layers: init.layers,
      sources: init.sources
    };
    this.mapContainer = init.mapContainer;
    this.map = new mapboxgl.Map({
      container: init.mapContainer, // container id
      style: `${init.styleURL}/${init.baseLayers.street}`, //stylesheet location
      center: init.center, // starting position
      zoom: init.zoom, // starting zoom
      keyboard: true
    });
    this.styleURL = init.styleURL;
    this.baseLayers = {
      street: init.baseLayers.street,
      satellite: init.baseLayers.satellite
    };
    this.boundaries = {
      southwest: init.boundaries.sw,
      northeast: init.boundaries.ne,
    };
    this.map.on('load',()=>{
      if(init.geocoder)
        document.getElementById('geocoder').appendChild(this.geocoder.onAdd(this.map))
    });
    this.map.on('style.load',()=>{
      this.loadMap();
    });
  }
  changeBaseMap(baseMap){
    this.map.setStyle(`${this.styleURL}/${this.baseLayers[baseMap]}`);
  }
  loadMap() {
    let sourcePromise = new Promise((resolve, reject) => {
      (this.loadSources()) ? resolve(this) : reject(this);
    });
    sourcePromise.then(function(val){
      val.loadLayers(val);
    }).catch(function(e){
      console.log("Error:" + e);
    });
  }
  loadSources() {
    try {
      for (var i = 0; i < this.currentState.sources.length; i++) {
        let tempSource = {
          type: this.currentState.sources[i].type
        };
        (this.currentState.sources[i].data === undefined) ? 0: tempSource.data = this.currentState.sources[i].data;
        (this.currentState.sources[i].url === undefined) ? 0: tempSource.url = this.currentState.sources[i].url;
        if(this.map.getSource(this.currentState.sources[i].id) === undefined){
          this.map.addSource(this.currentState.sources[i].id, tempSource);
        }
      }
      return true;
    } catch (e) {
      console.log("Error:" + e);
      return false;
    }
  }
  loadLayers(val) {
    for (var i = 0; i < val.currentState.layers.length; i++) {
      let tempLayer = {
        id: val.currentState.layers[i].id,
        source: val.currentState.layers[i].source,
      };
      (val.currentState.layers[i].paint === undefined) ? 0: tempLayer.paint = val.currentState.layers[i].paint;
      (val.currentState.layers[i].layout === undefined) ? 0: tempLayer.layout = val.currentState.layers[i].layout;
      (val.currentState.layers[i].type === undefined) ? 0: tempLayer.type = val.currentState.layers[i].type;
      (val.currentState.layers[i]['source-layer'] === undefined) ? 0: tempLayer['source-layer'] = val.currentState.layers[i]['source-layer'];
      (val.currentState.layers[i].filter === undefined) ? 0: tempLayer.filter = val.currentState.layers[i].filter;
      (val.currentState.layers[i].minzoom === undefined) ? 0: tempLayer.minzoom = val.currentState.layers[i].minzoom;
      (val.currentState.layers[i].maxzoom === undefined) ? 0: tempLayer.maxzoom = val.currentState.layers[i].maxzoom;
      (val.currentState.layers[i].metadata === undefined) ? 0: tempLayer.metadata = val.currentState.layers[i].metadata;
      (val.currentState.layers[i].ref === undefined) ? 0: tempLayer.ref = val.currentState.layers[i].ref;
      if(val.map.getLayer(val.currentState.layers[i].id) === undefined){
        val.map.addLayer(tempLayer);
      }
    }
  }
  removeSources(sources){
    for (var i = 0; i < sources.length; i++) {
      try {
        if(this.map.getSource(sources[i]) != undefined){
            this.map.removeSource(sources[i]);
            for (var x = 0; x < this.currentState.sources.length; x++) {
              (this.currentState.sources[x].id === source[i]) ? this.currentState.sources[x].splice(i, 1) : 0;
            }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  removeLayers(layers){
    for (var i = 0; i < layers.length; i++) {
      try {
        if(this.map.getLayer(layers[i]) != undefined){
            this.map.removeLayer(layers[i]);
            for (var x = 0; x < this.currentState.layers.length; x++) {
              (this.currentState.layers[x].id === layers[i]) ? this.currentState.layers.splice(x, 1) : 0;
            }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  updateMap(sources,layers){
    this.updateSources(sources);
    this.updateLayers(layers);
  }
  updateSources(sources){
    for (var i = 0; i < sources.length; i++) {
      let found = false;
      this.currentState.sources.forEach(function(oldSource){
        (oldSource.id === sources[i].id) ? found = true : 0;
      });
      (found) ? 0 : this.currentState.sources.push(sources[i]);
    }
  }
  updateLayers(layers){
    for (var i = 0; i < layers.length; i++) {
      let found = false;
      this.currentState.layers.forEach(function(oldLayer){
        (oldLayer.id === layers[i].id) ? found = true : 0;
      });
      (found) ? 0 : this.currentState.layers.push(layers[i]);
    }
  }
  static getMap(){
    return this.map;
  }
  static setMap(map){
    this.map = map;
  }
  static geocoderResultsFunction(point){
    // console.log(point);
  }
}
