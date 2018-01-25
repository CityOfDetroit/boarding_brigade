'use strict';
import Map from './map.class.js';
import Dashboard from './dashboard.class.js';
import Panel from './panel.class.js';
import Router from './router.class.js';
import JSUtilities from './utilities.class.js';
import DataManager from './data-manager.class.js';
import flatpickr from "flatpickr";
import mapboxgl from 'mapbox-gl';
const moment = require('moment');
const GeoJSON = require('geojson');
export default class Controller {
  constructor(map, router, dataSouresInfo, palette) {
    this.defaultSettings = {department: 'All'};
    this.currentPolygon = null;
    this.cityPolygon = null;
    this.dataBank = null;
    this.activeLayers = [];
    this.tempDataDetails = null;
    this.tempAddressPoint = null;
    this.dataSouresInfo = dataSouresInfo;
    this.palette = palette;
    this.dataManager = new DataManager('https://apis.detroitmi.gov/data_cache/city_data_summaries/');
    this.dashboard = new Dashboard();
    this.panel = new Panel();
    this.map = new Map(map, this);
    this.router = new Router(router);
    this.initialLoad(this);
  }
  initialLoad(controller){
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
    let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/City_of_Detroit_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
      controller.cityPolygon = data.features[0];
      controller.defaultSettings.startDate = moment().subtract(currentOfSet, 'days').format('YYYY-MM-DD');
      controller.defaultSettings.endDate = moment().format('YYYY-MM-DD');
      console.log(controller.defaultSettings);
      controller.addDateBoundaryPicker(controller);
      let boundaries = 'city';
      let dataList = '';
      let polygon = '';
      // console.log(dataList);
      controller.map.currentState.layers.forEach(function(layer){
        // console.log(layer.id);
        // console.log(JSUtilities.inArray(controller.layerTypes.dataSets, layer.id));
        (JSUtilities.inArray(controller.dataSouresInfo.boundaries, layer.id)) ? boundaries += layer.id : 0;
        (JSUtilities.inArray(controller.dataSouresInfo.dataSets, layer.id)) ? dataList += layer.id + ',' : 0;
        // console.log(dataList);
      });
      // console.log(dataList);
      controller.router.updateURLParams({lng: controller.map.map.getCenter().lng, lat: controller.map.map.getCenter().lat, zoom: controller.map.map.getZoom(), boundary: boundaries, dataSets: dataList, polygon: polygon});
      controller.createPanelData('DASH', controller);
    });
  }
  addDateBoundaryPicker(controller){
    flatpickr('#start-date', {
      defaultDate: controller.defaultSettings.startDate,
      altInput: true,
      altFormat: "F j, Y",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates){
        controller.defaultSettings.startDate = document.getElementById("start-date").value;;
        controller.createPanelData('DASH', controller);
      }
    });
    flatpickr('#end-date', {
      defaultDate: controller.defaultSettings.endDate,
      altInput: true,
      altFormat: "F j, Y",
      dateFormat: "Y-m-d",
      onChange: function(selectedDates){
        controller.defaultSettings.endDate = document.getElementById("end-date").value;;;
        controller.createPanelData('DASH', controller);
      }
    });
    let boundary = document.getElementById("boundaries");
    boundary.addEventListener('input', function(){
      console.log('input changed to: ', boundary.value);
      switch (boundary.value) {
        case "council":
          controller.polygonPicker(boundary.value, controller);
          break;
        case "neighborhood":
          controller.polygonPicker(boundary.value, controller);
          break;
        case "city":
          controller.polygonPicker(boundary.value, controller);
          break;
        default:

      }
    });
  }
  createPolygon(currentBoundary, currentPolygon, controller){
    switch (currentBoundary) {
      case "council":
        let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/7/query?where=districts+%3D+" + currentPolygon + "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
        fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          controller.currentPolygon = data.features[0];
          if(controller.dashboard.currentView === 'DASH') {
            controller.createPanelData('DASH', controller);
          }
        })
        break;
      case "neighborhood":

        break;
      default:

    }
  }
  polygonPicker(currentBoundary, controller){
    switch (currentBoundary) {
      case "council":
        document.querySelector('#alert-overlay div').innerHTML = `
          <label for="polygon">
            Select ${currentBoundary}
            <input id="polygon" type="text" list="polygon-list" name="polygon" value="">
            <datalist id="polygon-list">
              <option value="1">District 1</option>
              <option value="2">District 2</option>
              <option value="3">District 3</option>
              <option value="4">District 4</option>
              <option value="5">District 5</option>
              <option value="6">District 6</option>
              <option value="7">District 7</option>
            </datalist>
          </label>
          <button id="submit-polygon">SUBMIT</button>
        `;
        controller.router.updateURLParams({boundary: currentBoundary});
        document.getElementById("submit-polygon").addEventListener("click", function(){
          let selectedPolygon = document.getElementById('polygon').value;
          let validPolygons = ["1","2","3","4","5","6","7"]
          if(validPolygons.includes(selectedPolygon)){
            document.getElementById("polygons-list").innerHTML = `
            <option value="1">District 1</option>
            <option value="2">District 2</option>
            <option value="3">District 3</option>
            <option value="4">District 4</option>
            <option value="5">District 5</option>
            <option value="6">District 6</option>
            <option value="7">District 7</option>
            `;
            document.getElementById("polygons").value = selectedPolygon;
            document.getElementById("polygons").disabled = false;
            controller.router.updateURLParams({polygon: selectedPolygon});
            controller.createPolygon(currentBoundary, selectedPolygon, controller);
            // controller.currentPolygon = value;
            document.getElementById('alert-overlay').className = "";
          }else{
            console.log("invalid polygon");
          }
        });
        let polygonBox = document.getElementById("polygons");
        polygonBox.addEventListener('input', function(){
          console.log('input changed to: ', polygonBox.value);
          let validPolygons = ["1","2","3","4","5","6","7"]
          if(validPolygons.includes(polygonBox.value)){
            console.log("filtering for district " + polygonBox.value);
            controller.router.updateURLParams({polygon: polygonBox.value});
            controller.createPolygon(controller.router.getQueryVariable('boundary'), controller.router.getQueryVariable('polygon'), controller);
          }
        });
        document.getElementById('alert-overlay').className = "active";
        break;

      case "neighborhood":
        document.querySelector('#alert-overlay div').innerHTML = ``;
        console.log(document.querySelector("input#" + id).checked);
        document.querySelector("input#" + id).checked = false;
        document.getElementById('alert-overlay').className = "active";
        break;

      case "city":
        document.getElementById("polygons-list").innerHTML = "";
        document.getElementById("polygons").value = "";
        document.getElementById("polygons").disabled = true;
        break;
      default:
      console.log("not valid boundary");
    }
  }
  loadDatasetView(ev, controller){
    console.log(ev);
    let setID = null;
    (ev.target.tagName === "H2") ? setID = ev.target.parentNode.attributes[1].nodeValue : setID = ev.target.parentNode.parentNode.attributes[1].nodeValue;
    console.log(setID);
    controller.dashboard.buildSetView(setID, controller);
  }
  createPanelData(view, controller){
    console.log(view);
    // console.log(controller);
    switch (view) {
      case 'DASH':
        document.getElementById('initial-loader-overlay').className = 'active';
        // console.log('creating stats data');
        let url = null;
        controller.dataManager.createViewData(controller.router.getQueryVariable('boundary'), controller.router.getQueryVariable('dataSets'), controller.router.getQueryVariable('polygon'), controller, view);
        document.getElementById('menu').checked = true;
        break;
      case 'MAP':
        (document.getElementById('menu').checked) ? document.getElementById('menu').checked = false : document.getElementById('menu').checked = true;
        break;
      case 'FILTERS':
        // console.log('creating layers data');
        const layerURL = 'js/layers.json';
        fetch(layerURL)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(data);
          let dataObj = {title: "FILTERS", data: data};
          controller.dashboard.createView(view, dataObj, controller);
        })
        break;
      case 'TOOLS':
        // console.log('creating tools data');
        let dataObj = {title: "TOOLS", boarded: null, needBoarding: null};
        controller.dashboard.createView(view, dataObj, controller);
        break;
      case 'SET':
        // console.log('creating settings data');
        dataObj = {title: "SETTINGS", boarded: null, needBoarding: null};
        controller.dashboard.createView(view, dataObj, controller);
        break;
      case 'FORM':
        dataObj = {title: "FORM", boarded: null, needBoarding: null};
        // console.log('creating forms data');
        controller.dashboard.createView(view, dataObj, controller);
        break;
      default:
        console.log('invalid view reverting back');
    }
  }
  boundaryAddRemove(id, controller){
    console.log(id);
    console.log(controller.router.getQueryVariable('boundary'));
    let oldBoundary = controller.router.getQueryVariable('boundary');
    if(oldBoundary != 'city'){
      controller.map.removeLayer(oldBoundary, controller);
      controller.map.removeLayer(oldBoundary+"-borders", controller);
      controller.map.removeLayer(oldBoundary+"-hover", controller);
      controller.map.removeLayer(oldBoundary+"-labels", controller);
    }
    if(id === 'city'){
      controller.router.updateURLParams({boundary: id});
    }else{
      let tempLayers = [{
          "id": id,
          "type": "fill",
          "source": id,
          "maxzoom": 14,
          "layout": {},
          "paint": {
            "fill-color": '#9FD5B3',
            "fill-opacity": 0
          },
          "event": true
        },
        {
          "id": id + "-borders",
          "type": "line",
          "source": id,
          "maxzoom": 14,
          "layout": {},
          "paint": {
            "line-color": "#004544",
            "line-width": 3
          }
      }];
      switch (id) {
        case "council":
          tempLayers.push({
            "id": id + "-hover",
            "type": "fill",
            "source": id,
            "maxzoom": 14,
            "layout": {},
            "paint": {
              "fill-color": '#23A696',
              "fill-opacity": .3
            },
            "filter": ["==", "districts", ""]
          });
          tempLayers.push({
            'id': id + "-labels",
            'type': "symbol",
            'source': id + "-labels",
            "maxzoom": 14,
            'layout': {
              "text-font": ["Mark SC Offc Pro Bold"],
              "text-field": "District " + "{districts}",
              "symbol-placement": "point",
              "text-size": 22
            },
            'paint': {
              'text-color': '#004544'
            }
          });
          break;
        case "neighborhood":
          tempLayers.push({
            "id": id + "-hover",
            "type": "fill",
            "source": id,
            "maxzoom": 14,
            "layout": {},
            "paint": {
              "fill-color": '#23A696',
              "fill-opacity": .3
            },
            "filter": ["==", "name", ""]
          });
          tempLayers.push({
            'id': id + "-labels",
            'type': "symbol",
            'source': id + "-labels",
            "maxzoom": 14,
            'layout': {
              "text-font": ["Mark SC Offc Pro Bold"],
              "text-field": "{name}",
              "symbol-placement": "point",
              "text-size": 22
            },
            'paint': {
              'text-color': '#004544'
            }
          });
          break;
        default:

      }
      console.log(tempLayers);
      controller.router.updateURLParams({boundary: id});
      controller.map.addLayers(tempLayers,controller);
      controller.dataManager.createLayer(null,"#000000", controller);
    }
  }
  layerAddRemove(id, actionType, controller){
    console.log(id);
    // console.log(controller);
    // console.log(document.getElementById(id));
    if(actionType === 'add'){
      console.log('add layer');
      if(!controller.activeLayers.length ||  controller.activeLayers.length < 4){
        if(controller.map.map.getLayer(id)){
          // console.log('layer already exist');
        }else{
          // console.log('adding')
          let colorList = ["#9ab3ff","#ae017e","#4574ff","#f768a1"];
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
            color = colorList[0];
          }
          console.log(color);
          let tempColor = document.querySelector('#legend .color').innerHTML;
          tempColor += `<span data-id="${id}" data-color="${color}" style="background: ${color}"></span>`;
          let tempLegend = document.querySelector('#legend .text').innerHTML;
          tempLegend += `<label data-id="${id}">${id}</label>`;
          document.querySelector('#legend .text').innerHTML = tempLegend;
          document.querySelector('#legend .color').innerHTML = tempColor;
          let tempNewLayer = null;
          try {
            if(controller.map.map.getSource(id)){
              controller.map.map.getSource(id).setData(data);
              tempNewLayer = {
                "id": id,
                "source": id,
                "type": "circle",
                "paint": {
                    "circle-radius": 6,
                    "circle-color": color
                },
                "event": true
              };
            }else{
              console.log("no source found");
              console.log(controller.dataBank[id]);
              let sources = [{
                "id": id,
                "type": "geojson",
                "data": controller.dataBank[id]
              }];
              controller.map.addSources(sources, controller);
              tempNewLayer = {
                "id": id,
                "source": id,
                "type": "circle",
                "paint": {
                    "circle-radius": 6,
                    "circle-color": color
                },
                "event": true
              };
            }
            controller.map.addLayers([tempNewLayer], controller);
            console.log(controller.map.currentState);
            controller.activeLayers.push(id);
            controller.map.currentState.layers.push(tempNewLayer);
          } catch (e) {
            console.log("Error: " + e);
          }
        }
      }else{
        document.querySelector('#alert-overlay div').innerText = "Too many datasets selected. Please remove one before proceding.";
        console.log(document.querySelector("input#" + id).checked);
        document.querySelector("input#" + id).checked = false;
        document.getElementById('alert-overlay').className = "active";
      }
    }else{
      if(controller.map.map.getLayer(id)){
        // console.log('removing layer');
        controller.map.removeLayer(id, controller);
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
    console.log(id);
    console.log(value);
    document.getElementById('initial-loader-overlay').className = 'active';
    switch (id) {
      case "council":
        controller.router.updateURLParams({polygon: "district" + value.properties.districts});
        controller.currentPolygon = value;
        if(controller.dashboard.currentView === 'DASH') {
          controller.createPanelData('DASH', controller);
          controller.dataManager.createLayer(null,"#000000", controller);
        }else{
          controller.dataManager.createLayer(null,"#000000", controller);
        }
        console.log(controller.currentPolygon.getBounds());
        // map.flyTo({
        //     center: lngLat,
        //     zoom: 17,
        //     bearing: 0,
        //     // These options control the flight curve, making it move
        //     // slowly and zoom out almost completely before starting
        //     // to pan.
        //     speed: 2, // make the flying slow
        //     curve: 1, // change the speed at which it zooms out
        //
        //     // This can be any easing function: it takes a number between
        //     // 0 and 1 and returns another number between 0 and 1.
        //     easing: function (t) {
        //         return t;
        //     }
        // });
        break;
      case "neighborhood":
        controller.router.updateURLParams({polygon: "neighborhood" + value.properties.OBJECTID});
        controller.currentPolygon = value;
        if(controller.dashboard.currentView === 'DASH') {
          controller.createPanelData('DASH', controller);
          controller.dataManager.createLayer(null,"#000000", controller);
        }else{
          controller.dataManager.createLayer(null,"#000000", controller);
        }
        break;
      default:
        switch (id) {
          case "parcel-fill":
            controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", value.properties.parcelno]);
            controller.panel.creatPanel("parcel", value.properties.parcelno, controller);
            controller.layerAddRemove("feature-selected",'remove',controller);
            break;
          case "911":
            controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", ""]);
            controller.createdSelectedLayer(value, controller);
            controller.panel.creatPanel("911", value, controller);
            break;
          default:

        }
    }
  }
  createdSelectedLayer(value, controller){
    controller.map.map.flyTo({
        center: [value.properties.longitude, value.properties.latitude],
        zoom: 16,
        bearing: 0,
        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: 2, // make the flying slow
        curve: 1, // change the speed at which it zooms out

        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: function (t) {
            return t;
        }
    });
    let tempNewLayer = null;
    try {
      if(controller.map.map.getSource("feature-selected")){
        controller.map.map.getSource("feature-selected").setData(value.toJSON());
        tempNewLayer = {
          "id": "feature-selected",
          "source": "feature-selected",
          "type": "circle",
          "paint": {
              "circle-radius": 6,
              "circle-color": "#000"
          }
        };
      }else{
        console.log("no source found");
        let sources = [{
          "id": "feature-selected",
          "type": "geojson",
          "data": value.toJSON()
        }];
        controller.map.addSources(sources, controller);
        tempNewLayer = {
          "id": "feature-selected",
          "source": "feature-selected",
          "type": "circle",
          "paint": {
              "circle-radius": 6,
              "circle-color": "#000"
          }
        };
      }
      controller.map.addLayers([tempNewLayer], controller);
      console.log(controller.map.currentState);
      controller.activeLayers.push("feature-selected");
      controller.map.currentState.layers.push(tempNewLayer);
    } catch (e) {
      console.log("Error: " + e);
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
        controller.createPanelData('DASH', controller)
        break;
      case 'DISTRICT':
        // console.log('reloading district stats');
        controller.createPanelData('DASH', controller)
        break;
      default:
        // console.log("Hydrant view can't go back");
    }
  }
  geocoderResults(e, controller){
    let tempAddr = e.result.place_name.split(",");
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(" ");
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function(item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    console.log(newTempAddr);
    let url = "https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=" + newTempAddr + "&category=&outFields=User_fld&maxLocations=&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=json";
    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
      console.log(data);
      if(data.candidates.length){
        if(data.candidates[0].attributes.User_fld != ""){
          // document.querySelector('#alert-overlay div').innerHTML = `
          //   <p>This address has parcel data. Would you like to see it?</p>
          //   <button class="parcel-view-btn">YES</button>
          //   <button class="parcel-view-btn">NO</button>
          // `;
          // document.getElementById('alert-overlay').className = 'active';
          // let tempBtns = document.querySelectorAll('.parcel-view-btn');
          // tempBtns.forEach(function(btn){
          //   btn.addEventListener('click', function(ev){
          //     console.log(ev);
          //     console.log(ev.target.innerText);
          //     if(ev.target.innerText === "YES"){
          //       document.getElementById('alert-overlay').className = '';
          //       controller.panel.creatPanel("parcel", data.candidates[0].attributes.User_fld, controller);
          //     }else{
          //       document.getElementById('alert-overlay').className = '';
          //     }
          //   });
          // });
          document.getElementById('alert-overlay').className = '';
          controller.panel.creatPanel("parcel", data.candidates[0].attributes.User_fld, controller);
          controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", data.candidates[0].attributes.User_fld]);
        }else{
          console.log("no parcel found");
          controller.map.map.getSource('address-point').setData(e.result.geometry);
        }
      }else{
        console.log("no parcel found");
        controller.map.map.getSource('address-point').setData(e.result.geometry);
      }
    });
  }
  closeAlert(ev){
    (ev.target.parentNode.parentNode.id === 'alert-overlay') ? document.getElementById('alert-overlay').className = '': document.getElementById('drill-down-overlay').className = '';
  }
}
