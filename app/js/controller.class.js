'use strict';
import Map from './map.class.js';
import Panel from './panel.class.js';
import Router from './router.class.js';
import JSUtilities from './utilities.class.js';
import DataManager from './data-manager.class.js';
import mapboxgl from 'mapbox-gl';
const moment = require('moment');
const turf = require('@turf/simplify');
const arcGIS = require('terraformer-arcgis-parser');
const GeoJSON = require('geojson');
export default class Controller {
  constructor(map, router, dataSouresInfo, palette) {
    this.defaultSettings = {department: 'All'};
    this.currentPolygon = null;
    this.dataSouresInfo = dataSouresInfo;
    this.palette = palette;
    this.dataManager = new DataManager('https://apis.detroitmi.gov/data_cache/city_data_summaries/');
    this.panel = new Panel();
    this.map = new Map(map);
    this.router = new Router(router);
    this.initialLoad();
  }
  initialLoad(){
    let currentDayofWeek = moment().weekday();
    console.log(currentDayofWeek);
    let currentOfSet = 0;
    switch (currentDayofWeek) {
      case 0:
        currentOfSet = 7;
        break;
      case 1:
        currentOfSet = 8;
        break;
      case 2:
        currentOfSet = 9;
        break;
      case 3:
        currentOfSet = 10;
        break;
      case 4:
        currentOfSet = 11;
        break;
      case 5:
        currentOfSet = 12;
        break;
      default:
        currentOfSet = 13;
    }
    this.defaultSettings.startDate = moment().subtract(currentOfSet, 'days').format('YYYY-MM-DD');
    this.defaultSettings.endDate = moment().format('YYYY-MM-DD');
    console.log(this.defaultSettings);
    let controller = this;
    let boundaries = 'city';
    let dataList = '';
    let polygon = '';
    // console.log(dataList);
    this.map.currentState.layers.forEach(function(layer){
      // console.log(layer.id);
      // console.log(JSUtilities.inArray(controller.layerTypes.dataSets, layer.id));
      (JSUtilities.inArray(controller.dataSouresInfo.boundaries, layer.id)) ? boundaries += layer.id : 0;
      (JSUtilities.inArray(controller.dataSouresInfo.dataSets, layer.id)) ? dataList += layer.id + ',' : 0;
      // console.log(dataList);
    });
    // console.log(dataList);
    this.router.updateURLParams({lng: this.map.map.getCenter().lng, lat: this.map.map.getCenter().lat, zoom: this.map.map.getZoom(), boundary: boundaries, dataSets: dataList, polygon: polygon});
    this.createPanelData('STAT', this);
  }
  createPanelData(view, controller){
    console.log(view);
    // console.log(controller);
    switch (view) {
      case 'STAT':
        document.getElementById('initial-loader-overlay').className = 'active';
        // console.log('creating stats data');
        let url = null;
        controller.dataManager.createViewData(controller.router.getQueryVariable('boundary'), controller.router.getQueryVariable('dataSets'), controller.router.getQueryVariable('polygon'), controller, view);
        break;
      case 'FILTERS':
        // console.log('creating layers data');
        const layerURL = 'js/layers.json';
        fetch(layerURL)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(data);
          let dataObj = {title: "FILTERS", data: data};
          controller.panel.createView(view, dataObj, controller);
        })
        break;
      case 'TOOLS':
        // console.log('creating tools data');
        let dataObj = {title: "TOOLS", boarded: null, needBoarding: null};
        controller.panel.createView(view, dataObj, controller);
        break;
      case 'SET':
        // console.log('creating settings data');
        dataObj = {title: "SETTINGS", boarded: null, needBoarding: null};
        controller.panel.createView(view, dataObj, controller);
        break;
      case 'FORM':
        dataObj = {title: "FORM", boarded: null, needBoarding: null};
        // console.log('creating forms data');
        controller.panel.createView(view, dataObj, controller);
        break;
      default:
        console.log('invalid view reverting back');
    }
  }
  layerAddRemove(id, actionType, controller){
    // console.log(id);
    // console.log(controller);
    // console.log(document.getElementById(id));
    if(actionType === 'add'){
      // console.log('add layer');
      if(controller.map.map.getLayer(id)){
        // console.log('layer already exist');
      }else{
        // console.log('adding')
        let colorList = ["#da3448","#900818","#4891dd","#084a8e"];
        let layerList = document.querySelectorAll('#legend .color span');
        console.log(layerList);
        let color = null;
        let property = null;
        if(layerList.length){
          let usedColors = [];
          layerList.forEach(function(item){
            usedColors.push(item.getAttribute('data-color'));
          });
          console.log(usedColors);
          colorList.forEach(function(item){
            if(color === null){
              console.log('still need color');
              if(!usedColors.includes(item)){
                console.log(!usedColors.includes(item));
                console.log(item);
                color = item;
              }
            }
          });
        }else{
          color = "#da3448";
        }
        console.log(color);
        let tempColor = document.querySelector('#legend .color').innerHTML;
        tempColor += `<span data-id="${id}" data-color="${color}" style="background: ${color}"></span>`;
        let tempLegend = document.querySelector('#legend .text').innerHTML;
        tempLegend += `<label data-id="${id}">${id}</label>`;
        document.querySelector('#legend .text').innerHTML = tempLegend;
        document.querySelector('#legend .color').innerHTML = tempColor;
        let tempNewLayer = null
        try {
          controller.dataManager.createLayer(id, color, controller);
        } catch (e) {
          console.log("Error: " + e);
        }
      }
    }else{
      if(controller.map.map.getLayer(id)){
        // console.log('removing layer');
        controller.map.removeLayer(id, controller);
        let tempDataSet = '';
        controller.map.currentState.layers.forEach(function(layer){
          (JSUtilities.inArray(controller.dataSouresInfo.dataSets,layer.id)) ? tempDataSet += `${layer.id},` : 0;
        });
        controller.router.updateURLParams({dataSets: tempDataSet});
        // console.log(controller.map.currentState);
        let tempColors = document.querySelectorAll('#legend .color span');
        let tempLegend = document.querySelectorAll('#legend .text label');
        let newTempColors = "";
        let newTempLegend = "";
        console.log(tempColors);
        console.log(tempLegend);
        tempColors.forEach(function(color){
          (color.getAttribute('data-id') != id) ? newTempColors += `<span data-id="${color.getAttribute('data-id')}" data-color="${color.getAttribute('data-color')}" style="background: ${color.getAttribute('data-color')}"></span>` : 0;
        });
        tempLegend.forEach(function(legend){
          (legend.getAttribute('data-id') != id) ? newTempLegend += `<label data-id="${legend.getAttribute('data-id')}">${legend.getAttribute('data-id')}</label>`: 0;
        });
        console.log(newTempColors);
        console.log(newTempLegend);
        document.querySelector('#legend .text').innerHTML = newTempLegend;
        document.querySelector('#legend .color').innerHTML = newTempColors;
      }else{
        console.log('layer does not exist');
      }
    }
  }
  checkLayerType(id, value, controller){
    // console.log(id);
    switch (true) {
      case JSUtilities.inArray(controller.dataSouresInfo.boundaries,id):
        // console.log('layer is the type boundary');
        controller.router.updateURLParams({polygon: value.properties.districts});
        controller.currentPolygon = value;
        (controller.panel.currentView === 'STAT') ? controller.createPanelData('STAT', controller): 0;
        break;
      case JSUtilities.inArray(controller.dataSouresInfo.dataSets,id):
        // console.log('layer is the type data set');
        break;
      default:
        console.log('no type find');
    }
  }
  loadPrevious(prev, controller){
    let viewType = null;
    let item = null;
    if(prev.target.tagName === "A"){
      viewType = prev.target.children[1].innerText.split('-')[0].trim();
      if(viewType === "District"){
        (item = prev.target.children[1].innerText.split('-')[1] === undefined) ? 0 : item = prev.target.children[1].innerText.split('-')[1].trim() + "-" + prev.target.children[1].innerText.split('-')[2].trim();
      }else{
        (item = prev.target.children[1].innerText.split('-')[1] === undefined) ? 0 : item = prev.target.children[1].innerText.split('-')[1].trim();
      }
    }else{
      if(prev.target.className === ""){
        viewType = prev.target.nextSibling.innerText.split('-')[0].trim();
        if(viewType === "District"){
          (item = prev.target.nextSibling.innerText.split('-')[1] === undefined) ? 0 : item = prev.target.nextSibling.innerText.split('-')[1].trim() + "-" + prev.target.nextSibling.innerText.split('-')[2].trim();
        }else{
          (item = prev.target.nextSibling.innerText.split('-')[1] === undefined) ? 0 : item = prev.target.nextSibling.innerText.split('-')[1].trim();
        }
      }else{
        viewType = prev.target.innerText.split('-')[0].trim();
        if(viewType === "District"){
          (item = prev.target.innerText.split('-')[1] === undefined) ? 0 : item = prev.target.innerText.split('-')[1].trim() + "-" + prev.target.innerText.split('-')[2].trim();
        }else{
          (item = prev.target.innerText.split('-')[1] === undefined) ? 0 : item = prev.target.innerText.split('-')[1].trim();
        }
      }
    }
    // console.log(viewType);
    // console.log(item);
    switch (viewType) {
      case 'CITY':
        // console.log('reloading city stats');
        controller.router.updateURLParams({polygon: 'city'});
        controller.createPanelData('STAT', controller)
        break;
      case 'DISTRICT':
        // console.log('reloading district stats');
        controller.createPanelData('STAT', controller)
        break;
      default:
        // console.log("Hydrant view can't go back");
    }
  }
}
