'use strict';
import JSUtilities from './utilities.class.js';
const turf = require('@turf/simplify');
const arcGIS = require('terraformer-arcgis-parser');
const WKT = require('terraformer-wkt-parser');
export default class DataManager {
  constructor(URL) {
    this.dataDirectoryURL = null;
    this.initialize(URL);
  }
  initialize(URL){
    fetch(URL).then(function(response) {
      var contentType = response.headers.get("content-type");
      if(contentType && contentType.includes("application/json")) {
        return response.json();
      }
      throw new TypeError("Oops, we haven't got JSON!");
    })
    .then(function(json) {
      console.log(json);
    })
    .catch(function(error) { console.log(error); });
  }
  createViewData(boundary, dataSets, polygon, controller, view){
    console.log(boundary + ',' + dataSets + ',' + polygon);
    let dataObj = null;
    let simplePolygon = null;
    switch (boundary) {
      case "city":
        console.log("city");
        dataObj = {title: "City of Detroit"};
        simplePolygon = turf(controller.cityPolygon, 0.01, false);
        break;
      case "council":
        dataObj = {title: controller.currentPolygon.properties.name};
        simplePolygon = turf(controller.currentPolygon, 0.005, false);
        break;
      default:
    }
    // console.log(simplePolygon);
    let tempDataSets = null;
    let arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
    let socrataPolygon = WKT.convert(simplePolygon.geometry);
    if(!dataSets) {
      tempDataSets = ["boarded","permits","total-property-sales","blight-tickets","demos","911","crime","fire","green-lights", "dlba-inventory", "tree-removals", "tree-planting", "motorcitymatch", "motorcityrestore", "schools"];
    }else{
      tempDataSets = dataSets;
    }
    let pBoarded = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+between+%27" + controller.defaultSettings.startDate + "%27+and+%27" + controller.defaultSettings.endDate + "%27&objectIds=&time=&geometry=" + encodeURI(JSON.stringify(arcsimplePolygon))+ "&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
      if(JSUtilities.inArray(tempDataSets, "boarded")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          resolve({"id" : "boarded", "name": "BOARDED PROPERTIES", "numbers" : data.features.length.toLocaleString(), "data": data});
        });
      }else{
        return resolve(null);
      }
    });
    let pBuildingPermits = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/but4-ky7y.geojson?$query=SELECT * WHERE permit_issued between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(site_location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      console.log(url);
      if(JSUtilities.inArray(tempDataSets, "permits")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "permits", "name": "BUILDING PERMITS", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let pTotalPropertySales = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/9xku-658c.geojson?$query=SELECT * WHERE sale_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "total-property-sales")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "total-property-sales", "name": "TOTAL PROPERTY SALES", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let pBlight = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/s7hj-n86v.geojson?$query=SELECT * WHERE violation_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "blight-tickets")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "blight-tickets", "name": "BLIGHT TICKETS", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let pDemos = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/uzpg-2pfj.geojson?$query=SELECT * WHERE demolition_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "demos")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "demos", "name": "DEMOLITIONS", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let p911 = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.geojson?$query=SELECT * WHERE call_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "911")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "911", "name": "911 CALLS", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let pCrime = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/9i6z-cm98.geojson?$query=SELECT * WHERE incident_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "crime")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "crime", "name": "CRIMES", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let pFire = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$query=SELECT * WHERE call_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(incident_location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "fire")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "fire", "name": "FIRE INCIDENTS", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });
    let pGreenlight = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/xgha-35ji.geojson?$query=SELECT * WHERE live_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "green-lights")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "green-lights", "name": "GREEN LIGHTS", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });

    let pDlbaInventory = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/mhw8-ppmt.geojson?$query=SELECT * WHERE within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000";
      if(JSUtilities.inArray(tempDataSets, "dlba-inventory")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "dlba-inventory", "name": "DLBA Inventory", "numbers": data.features.length.toLocaleString(), "data": data});
        });
      }else{
        console.log('returning null');
        return resolve(null);
      }
    });

    let pTreeRemovals = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/TreeRemovals18/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson";
      if(JSUtilities.inArray(tempDataSets, "tree-removals")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          resolve({"id" : "tree-removals", "name": "Tree Removals", "numbers" : data.features.length.toLocaleString(), "data": data});
        });
      }else{
        return resolve(null);
      }
    });

    let pTreePlanting = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/General_Services_Tree_Planting_and_Removal/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson";
      if(JSUtilities.inArray(tempDataSets, "tree-planting")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          resolve({"id" : "tree-planting", "name": "Trees Planted", "numbers" : data.features.length.toLocaleString(), "data": data});
        });
      }else{
        return resolve(null);
      }
    });

    let pMotorCityMatch = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Motor_City_Match_and_Motor_City_ReStore/FeatureServer/0/query?where=1%3D1+and+program%3D%27Motor+City+Match%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson";
      if(JSUtilities.inArray(tempDataSets, "tree-planting")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          resolve({"id" : "motorcitymatch", "name": "Motor City Match Awards", "numbers" : data.features.length.toLocaleString(), "data": data});
        });
      }else{
        return resolve(null);
      }
    });

    let pMotorCityRestore = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Motor_City_Match_and_Motor_City_ReStore/FeatureServer/0/query?where=1%3D1+and+program%3D%27Motor+City+Restore%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson";
      if(JSUtilities.inArray(tempDataSets, "motorcityrestore")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          resolve({"id" : "motorcityrestore", "name": "Motor City Restore Awards", "numbers" : data.features.length.toLocaleString(), "data": data});
        });
      }else{
        return resolve(null);
      }
    });

    let pSchools = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Schools2017/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson";
      if(JSUtilities.inArray(tempDataSets, "schools")){
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          console.log(data);
          resolve({"id" : "schools", "name": "Schools", "numbers" : data.features.length.toLocaleString(), "data": data});
        });
      }else{
        return resolve(null);
      }
    });






    Promise.all([pBoarded, pBuildingPermits, pTotalPropertySales, pBlight, pDemos, p911, pCrime, pFire, pGreenlight, pDlbaInventory, pTreeRemovals, pTreePlanting, pMotorCityMatch, pMotorCityRestore, pSchools]).then(values => {
        console.log(values); //one, two
        let dataSets = [];
        let initalLoadInfo = {};
        let initialLoadChecker = true;
        values.forEach(function(value) {
          if(value != null) {
            dataSets.push(value);
            initalLoadInfo[value.id] = value.data;
          }else{
            initialLoadChecker = false;
          }
        });
        if(initialLoadChecker){
          controller.dataBank = initalLoadInfo;
        }
        dataObj.dataSets = dataSets;
        console.log(dataObj);
        controller.dashboard.createView(view, dataObj, controller);
    }).catch(reason => {
      console.log(reason);
    });
  }
}
