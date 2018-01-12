'use strict';
import JSUtilities from './utilities.class.js';
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
    if(polygon){
      // NOTE: Add functions for quering manually created polygons
      console.log("custom polygon");
    }else{
      console.log(boundary);
      switch (boundary) {
        case "council":
          let simplePolygon = turf(controller.currentPolygon, 0.005, false);
          // console.log(simplePolygon);
          let arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
          url = 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=&objectIds=&time=&geometry=' + encodeURI(JSON.stringify(arcsimplePolygon))+ '&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=';
          fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            console.log(data);
            let dataObj= {title: "District " + tempPolygon, boarded: null, needBoarding: null};
            let dataSetsArr = tempDataSets.split(',');
            if(dataSetsArr.length > 2){
              // console.log('multiple data sets');
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
              // console.log('only one data set');
              let checker = null;
              dataObj[dataSetsArr[0]] = 0;
              (dataSetsArr[0] === 'boarded') ? checker = 'yes' : checker = 'no';
              data.features.forEach(function(item){
                (item.properties.property_secure === checker) ? dataObj[dataSetsArr[0]]++ : 0;
              });
            }
            controller.panel.createView(view, dataObj, controller);
          });
          break;

        case "neighborhood":
          simplePolygon = turf(controller.currentPolygon, 0.005, false);
          // console.log(simplePolygon);
          arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
          break;

        case "city":
          let dataObj = {title: "City of Detroit"};
          let tempDataSets = null;
          (!dataSets) ? tempDataSets = ["boarded","permits","total-property-sales","blight-tickets","commercial-demos","911","crime","fire","green-lights"] : tempDataSets = dataSets;

          let pBoarded = new Promise((resolve, reject) => {
            let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+%3E+%27" + controller.defaultSettings.startDate + "%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
            if(JSUtilities.inArray(tempDataSets, "boarded")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id" : "boarded", "name": "BOARDED PROPERTIES", "numbers" : data.features.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pBuildingPermits = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/but4-ky7y.json?$where=permit_issued > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "boarded")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "permits", "name": "BUILDING PERMITS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pTotalPropertySales = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/9xku-658c.json?$where=sale_date > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "total-property-sales")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "total-property-sales", "name": "TOTAL PROPERTY SALES", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pBlight = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/s7hj-n86v.json?$where=violation_date > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "blight-tickets")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "blight-tickets", "name": "BLIGHT TICKETS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pCommDemos = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/niaj-6fdd.json?$where=demo_date > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "commercial-demos")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "commercial-demos", "name": "COMMERCIAL DEMOLITIONS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let p911 = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/Calls911.json?$where=call_timestamp > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "911")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "911", "name": "911 CALLS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pCrime = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/Crime_Incidents.json?$where=incident_timestamp > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "crime")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "crime", "name": "CRIMES", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pFire = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/pav4-mvgv.json?$where=call_date > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "fire")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "fire", "name": "FIRE INCIDENTS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          let pGreenlight = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/pav4-mvgv.json?$where=call_date > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "green-lights")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "green-lights", "name": "GREEN LIGHTS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              return null;
            }
          });
          Promise.all([pBoarded, pBuildingPermits, pTotalPropertySales, pBlight, pCommDemos, p911, pCrime, pFire, pGreenlight]).then(values => {
              console.log(values); //one, two
              let dataSets = [];
              values.forEach(function(value) {
                (value != null) ? dataSets.push(value) : 0;
              });
              dataObj.dataSets = dataSets;
              console.log(dataObj);
              controller.panel.createView(view, dataObj, controller);
          }).catch(reason => {
            console.log(reason);
          });
          break;
        default:
          console.log('Error: No boundary');
      }
    }
  }
}
