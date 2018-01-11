'use strict';
import mapboxgl from 'mapbox-gl';
var MapboxGeocoder = require('mapbox-gl-geocoder');
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjajd3MGlodXIwZ3piMnhudmlzazVnNm44In0.BL29_7QRvcnOrVuXX_hD9A';
const detroitBBox = [-83.3437,42.2102,-82.8754,42.5197];
export default class Map {
  // NOTE: Add a event listener functions for dynamically create and remove click events
  
  // controller.map.map.on("zoom", function(e, parent = this) {
  //   // console.log(controller.map.map.getZoom());
  //   controller.router.updateURLParams({zoom: controller.map.map.getZoom()});
  // });
  // controller.map.map.on("dragend", function(e, parent = this) {
  //   // console.log(controller.map.map.getCenter());
  //   controller.router.updateURLParams({lng: controller.map.map.getCenter().lng, lat: controller.map.map.getCenter().lat});
  // });
  // controller.map.map.on("mousemove", function(e, parent = this) {
  //   try {
  //     var features = this.queryRenderedFeatures(e.point, {
  //       layers: ["council"]
  //     });
  //     if (features.length) {
  //       this.setFilter("council-hover", ["==", "districts", features[0].properties.districts]);
  //     }else{
  //       this.setFilter("council-hover", ["==", "districts", ""]);
  //       if(controller.map.map.getLayer("boarded")){
  //         var features = this.queryRenderedFeatures(e.point, {
  //           layers: ["boarded"]
  //         });
  //       }
  //       if(controller.map.map.getLayer("needBoarding")){
  //         var features = this.queryRenderedFeatures(e.point, {
  //           layers: ["needBoarding"]
  //         });
  //       }
  //     }
  //     this.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
  //   } catch (e) {
  //     console.log("Error: " + e);
  //   }
  // });
  // controller.map.map.on("click", function(e, parent = this) {
  //   try {
  //     var features = this.queryRenderedFeatures(e.point, {
  //       layers: ["council"]
  //     });
  //     if (features.length) {
  //       // console.log(features);
  //       controller.checkLayerType(features[0].layer.id,features[0],controller);
  //     }else{
  //       var features = this.queryRenderedFeatures(e.point, {
  //         layers: ["boarded"]
  //       });
  //       if (features.length) {
  //         // console.log(features);
  //         controller.checkLayerType(features[0].layer.id, controller);
  //       }else{
  //         var features = this.queryRenderedFeatures(e.point, {
  //           layers: ["needBoarding"]
  //         });
  //         if(features.length){
  //           // console.log(features);
  //           controller.checkLayerType(features[0].layer.id, controller);
  //         }else{
  //           console.log('No features');
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.log("Error: " + e);
  //   }
  // });
  constructor(init) {
    if(init.geocoder){
      this.geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        placeholder: 'Enter address',
        bbox: detroitBBox
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
    if(init.controls){
      this.map.addControl(new mapboxgl.NavigationControl());
    }
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
  removeSources(source, controller){
    try {
      if(controller.map.map.getSource(source) != undefined){
          controller.map.map.removeSource(source);
          for (var x = 0; x < controller.map.currentState.sources.length; x++) {
            (controller.map.currentState.sources[x].id === source) ? controller.map.currentState.sources[x].splice(i, 1) : 0;
          }
      }
    } catch (e) {
      console.log(e);
    }
  }
  removeLayer(layer, controller){
    try {
      if(controller.map.map.getLayer(layer) != undefined){
          controller.map.map.removeLayer(layer);
          for (var x = 0; x < controller.map.currentState.layers.length; x++) {
            (controller.map.currentState.layers[x].id === layer) ? controller.map.currentState.layers.splice(x, 1) : 0;
          }
      }
    } catch (e) {
      console.log(e);
    }
  }
  addSources(sources, controller){
    sources.forEach(function(source){
      controller.map.currentState.sources.push(source);
      let tempSource = {
        type: source.type
      };
      (source.data === undefined) ? 0: tempSource.data = source.data;
      (source.url === undefined) ? 0: tempSource.url = source.url;
      if(controller.map.map.getSource(source.id) === undefined){
        controller.map.map.addSource(this.currentState.sources[i].id, tempSource);
      }
    });
  }
  addLayers(layers, controller){
    // console.log(layers);
    layers.forEach(function(layer){
      controller.map.currentState.layers.push(layer);
      let tempLayer = {
        id: layer.id,
        source: layer.source,
      };
      (layer.paint === undefined) ? 0: tempLayer.paint = layer.paint;
      (layer.layout === undefined) ? 0: tempLayer.layout = layer.layout;
      (layer.type === undefined) ? 0: tempLayer.type = layer.type;
      (layer['source-layer'] === undefined) ? 0: tempLayer['source-layer'] = layer['source-layer'];
      (layer.filter === undefined) ? 0: tempLayer.filter = layer.filter;
      (layer.minzoom === undefined) ? 0: tempLayer.minzoom = layer.minzoom;
      (layer.maxzoom === undefined) ? 0: tempLayer.maxzoom = layer.maxzoom;
      (layer.metadata === undefined) ? 0: tempLayer.metadata = layer.metadata;
      (layer.ref === undefined) ? 0: tempLayer.ref = layer.ref;
      if(controller.map.map.getLayer(layer.id) === undefined){
        controller.map.map.addLayer(tempLayer);
      }
    });
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
