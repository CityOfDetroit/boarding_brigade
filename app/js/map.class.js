'use strict';
import mapboxgl from 'mapbox-gl';
var MapboxGeocoder = require('mapbox-gl-geocoder');
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjajd3MGlodXIwZ3piMnhudmlzazVnNm44In0.BL29_7QRvcnOrVuXX_hD9A';
const detroitBBox = [-83.3437,42.2102,-82.8754,42.5197];
export default class Map {
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
    this.map.tempLayerEvent = null;
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
      val.map.on('click', "parcel-fill", function (e, parent = this) {
        let features = this.queryRenderedFeatures(e.point, {
          layers: ["parcel-fill"]
        });
        if (features.length) {
          console.log(features);
          // controller.checkLayerType(features[0].layer.id,features[0],controller);
        }else{
          console.log('No features');
        }
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      val.map.on('mouseenter', "parcel-fill", function (e, parent = this) {
          this.getCanvas().style.cursor = 'pointer';
          // this.setFilter("council-hover", ["==", "districts", features[0].properties.districts]);
      });

      // Change it back to a pointer when it leaves.
      val.map.on('mouseleave', "parcel-fill", function (e, parent = this) {
          this.getCanvas().style.cursor = '';
          // this.setFilter("council-hover", ["==", "districts", ""]);
      });
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
    if(Array.isArray(layer)){
      console.log(layer);
      try {
        if(controller.map.map.getLayer(layer[0]) != undefined){
          controller.map.removeEvent(layer[0],controller);
          for (var x = 0; x < controller.map.currentState.layers.length; x++) {
            (controller.map.currentState.layers[x].id === layer[0]) ? controller.map.currentState.layers.splice(x, 1) : 0;
          }
          controller.map.map.removeLayer(layer);
        }
      } catch (e) {
        console.log(e);
      }
    }else{
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
  }
  addSources(sources, controller){
    sources.forEach(function(source){
      let tempSource = {
        type: source.type
      };
      (source.data === undefined) ? 0: tempSource.data = source.data;
      (source.url === undefined) ? 0: tempSource.url = source.url;
      if(controller.map.map.getSource(source.id) === undefined){
        controller.map.currentState.sources.push(source);
        controller.map.map.addSource(source.id, tempSource);
      }
    });
    return 0
  }
  addLayers(layers, controller){
    // console.log(layers);
    layers.forEach(function(layer){
      console.log(layer);
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
        (layer.event) ? controller.map.addEvent(layer, controller) : 0;
      }
    });
  }
  removeEvent(layer, controller){
    console.log(layer);
    console.log(controller.map.map.off('click', layer, addClickFunction));
    controller.map.map.off('mousemove', layer, addMouseMoveFunction);
    controller.map.map.off('mouseleave', layer, addMouseLeaveFunction);
  }
  addMouseMoveFunction(e , parent = this){
    switch (this.tempLayerEvent.id) {
      case "council":
        let features = this.queryRenderedFeatures(e.point, {
          layers: ["council"]
        });
        if (features.length) {
          this.setFilter("council-hover", ["==", "districts", features[0].properties.districts]);
        }else{

        }
        break;
      case "neighborhood":
        features = this.queryRenderedFeatures(e.point, {
          layers: ["neighborhood"]
        });
        if (features.length) {
          this.setFilter("neighborhood-hover", ["==", "name", features[0].properties.name]);
        }else{
        }
        break;
      default:

    }
    this.getCanvas().style.cursor = 'pointer';
  }
  addMouseLeaveFunction(e, parent = this){
    switch (this.tempLayerEvent.id) {
      case "council":
        this.setFilter("council-hover", ["==", "districts", ""]);
        this.getCanvas().style.cursor = '';
        break;
      case "neighborhood":
        this.setFilter("neighborhood-hover", ["==", "name", ""]);
        this.getCanvas().style.cursor = '';
        break;
      default:

    }

  }
  addClickFunction(e, parent = this){
    let features = this.queryRenderedFeatures(e.point, {
      layers: [this.tempLayerEvent.id]
    });
    if (features.length) {
      console.log(features);
      // controller.checkLayerType(features[0].layer.id,features[0],controller);
    }else{
      console.log('No features');
    }
  }
  addEvent(layer, controller){
    controller.map.map.tempLayerEvent = layer;
    controller.map.map.on('click', layer.id, controller.map.addClickFunction);

    // Change the cursor to a pointer when the mouse is over the places layer.
    controller.map.map.on('mousemove', layer.id, controller.map.addMouseMoveFunction);

    controller.map.map.on('mouseleave', layer.id, controller.map.addMouseLeaveFunction);
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
