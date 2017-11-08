'use strict';
import Map from './map.class.js';
import Panel from './panel.class.js';
import Router from './router.class.js';
import JSUtilities from './utilities.class.js';
import mapboxgl from 'mapbox-gl';
const turf = require('@turf/simplify');
const arcGIS = require('terraformer-arcgis-parser');
const GeoJSON = require('geojson');
export default class Controller {
  constructor(map, router, layerTypes) {
    this.currentPolygon = null;
    this.layerTypes = layerTypes;
    this.panel = new Panel();
    this.map = new Map(map);
    this.router = new Router(router);
    this.initialLoad();
  }
  initialLoad(){
    let controller = this;
    let boundaries = '';
    let dataList = '';
    console.log(dataList);
    this.map.currentState.layers.forEach(function(layer){
      console.log(layer.id);
      console.log(JSUtilities.inArray(controller.layerTypes.dataSets, layer.id));
      (JSUtilities.inArray(controller.layerTypes.boundaries, layer.id)) ? boundaries += layer.id : 0;
      (JSUtilities.inArray(controller.layerTypes.dataSets, layer.id)) ? dataList += layer.id + ',' : 0;
      console.log(dataList);
    });
    console.log(dataList);
    this.router.updateURLParams({lng: this.map.map.getCenter().lng, lat: this.map.map.getCenter().lat, zoom: this.map.map.getZoom(), boundary: boundaries, dataSets: dataList});
    this.createPanelData('STAT', this);
  }
  createPanelData(view, controller){
    console.log(view);
    console.log(controller);
    switch (view) {
      case 'STAT':
        document.getElementById('initial-loader-overlay').className = 'active';
        console.log('creating stats data');
        let url = null;
        let tempBoundary = controller.router.getQueryVariable('boundary');
        let tempDataSets = controller.router.getQueryVariable('dataSets');
        let tempPolygon = controller.router.getQueryVariable('polygon');
        if(tempPolygon){
          console.log(controller.currentPolygon);
          if(tempDataSets){
            let simplePolygon = turf(controller.currentPolygon, 0.005, false);
            console.log(simplePolygon);
            let arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
            console.log(arcsimplePolygon);
            switch (tempBoundary) {
              case 'council':
                url = 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/service_d8ef2e7ac3074dc5907b49914d5d7f7b/FeatureServer/0/query?where=&objectIds=&time=&geometry=' + encodeURI(JSON.stringify(arcsimplePolygon))+ '&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=';
                fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  let dataObj= {title: "District " + tempPolygon, boarded: null, needBoarding: null};
                  let dataSetsArr = tempDataSets.split(',');
                  if(dataSetsArr.length > 2){
                    console.log('multiple data sets');
                    let checker = [];
                    dataSetsArr.forEach(function(set){
                      (set != '') ? checker.push(set) : 0;
                    });
                    checker.forEach(function(check){
                      let tempCheck = null;
                      dataObj[check] = 0;
                      (check === 'boarded') ? tempCheck = 'yes' : tempCheck = 'no';
                      data.features.forEach(function(item){
                        (item.properties.property_secure === tempCheck) ? dataObj[check]++ : 0;
                      });
                    });
                  }else{
                    console.log('only one data set');
                    let checker = null;
                    dataObj[dataSetsArr[0]] = 0;
                    (dataSetsArr[0] === 'boarded') ? checker = 'yes' : checker = 'no';
                    data.features.forEach(function(item){
                      (item.properties.property_secure === checker) ? dataObj[dataSetsArr[0]]++ : 0;
                    });
                  }
                  // data.features.forEach(function(item){
                  //   (item.properties.property_secure === 'yes') ? dataObj.boarded++ : dataObj.needBoarding++;
                  // });
                  controller.panel.createView(view, dataObj, controller);
                });
                break;
              default:

            }
          }else{
            console.log('No data sets selected');
            let dataObj= {title: "District " + tempPolygon, boarded: null, needBoarding: null};
            controller.panel.createView(view, dataObj, controller);
          }
        }else{
          url = 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/service_d8ef2e7ac3074dc5907b49914d5d7f7b/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=';
          fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            console.log(data);
            let dataObj= {title: "City of Detroit", boarded: 0, needBoarding: 0};
            data.features.forEach(function(item){
              (item.properties.property_secure === 'yes') ? dataObj.boarded++ : dataObj.needBoarding++;
            });
            controller.panel.createView(view, dataObj, controller);
          });
        }
        break;
      case 'LAYER':
        console.log('creating layers data');
        const layerURL = 'js/layers.json';
        fetch(layerURL)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          let dataObj = {title: "Layers", data: data};
          controller.panel.createView(view, dataObj, controller);
        })
        break;
      case 'TOOLS':
        console.log('creating tools data');
        let dataObj = {title: "Tools", boarded: null, needBoarding: null};
        controller.panel.createView(view, dataObj, controller);
        break;
      case 'SET':
        console.log('creating settings data');
        dataObj = {title: "Setting", boarded: null, needBoarding: null};
        controller.panel.createView(view, dataObj, controller);
        break;
      case 'FORM':
        dataObj = {title: "Form", boarded: null, needBoarding: null};
        console.log('creating forms data');
        controller.panel.createView(view, dataObj, controller);
        break;
      default:
        console.log('invalid view reverting back');
    }
  }
  layerAddRemove(id, actionType, controller){
    console.log(id);
    console.log(controller);
    console.log(document.getElementById(id));
    if(actionType === 'add'){
      console.log('add layer');
      if(controller.map.map.getLayer(id)){
        console.log('layer already exist');
      }else{
        console.log('adding');
        let color = null;
        let property = null;
        if(id === "boarded"){
          color = "#00a0db";
          property = "yes";
        }else{
          color = "#db9700";
          property = "no";
        }
        let filter = ["in",'parcelno'];
        const layerURL = 'js/layers.json';
        fetch(layerURL)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          fetch(data.urls[id])
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            console.log(data);
            data.features.forEach(function(property){
              if(id === "boarded"){
                (property.properties.property_secure === "yes" && property.properties.parcel != null) ? filter.push(property.properties.parcel) : 0;
              }else{
                (property.properties.property_secure === "no" && property.properties.parcel != null) ? filter.push(property.properties.parcel) : 0;
              }
            });
            console.log(filter);
            controller.map.addLayers([{
              "id": id,
              "type": "fill",
              "source": "parcels",
              'source-layer': 'parcelsgeojson',
              'filter': filter,
              "paint": {
                "fill-color": color,
                "fill-opacity":0.5
              }
            }], controller);
            console.log(controller.map.currentState);
            let tempDataSet = '';
            controller.map.currentState.layers.forEach(function(layer){
              (JSUtilities.inArray(controller.layerTypes.dataSets,layer.id)) ? tempDataSet += `${layer.id},` : 0;
            });
            controller.router.updateURLParams({dataSets: tempDataSet});
          });
        });
      }
    }else{
      if(controller.map.map.getLayer(id)){
        console.log('removing layer');
        controller.map.removeLayer(id, controller);
        let tempDataSet = '';
        controller.map.currentState.layers.forEach(function(layer){
          (JSUtilities.inArray(controller.layerTypes.dataSets,layer.id)) ? tempDataSet += `${layer.id},` : 0;
        });
        controller.router.updateURLParams({dataSets: tempDataSet});
        console.log(controller.map.currentState);
      }else{
        console.log('layer does not exist');
      }
    }
  }
  checkLayerType(id, value, controller){
    console.log(id);
    switch (true) {
      case JSUtilities.inArray(controller.layerTypes.boundaries,id):
        console.log('layer is the type boundary');
        controller.router.updateURLParams({polygon: value.properties.districts});
        controller.currentPolygon = value;
        (controller.panel.currentView === 'STAT') ? controller.createPanelData('STAT', controller): 0;
        break;
      case JSUtilities.inArray(controller.layerTypes.dataSets,id):
        console.log('layer is the type data set');
        break;
      default:
        console.log('no type find');
    }
  }
  polygonQuery(value, controller){

  }
}
