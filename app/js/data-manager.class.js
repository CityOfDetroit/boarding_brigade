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
  createLayer(id, color, controller){
    console.log(id);
    let boundary = controller.router.getQueryVariable("boundary");
    let polygon = controller.router.getQueryVariable("polygon");
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
          console.log("city");
          let dataObj = {title: "City of Detroit"};
          let tempDataSets = [id];
          console.log(tempDataSets);
          let pBoarded = new Promise((resolve, reject) => {
            let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0//query?where=CreationDate+%3E+%27" + controller.defaultSettings.startDate + "%27+AND+parcel+IS+NOT+null&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=parcel&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
            if(JSUtilities.inArray(tempDataSets, "boarded")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                console.log(data);
                let filter = ["in",'parcelno'];
                data.features.forEach(function(property){
                  (property.properties.parcel != null) ? filter.push(property.properties.parcel) : 0;
                });
                console.log(filter);
                let layer = [
                  {
                    "id": id,
                    "type": "fill",
                    "source": "parcels",
                    "filter": filter,
                    "layout": {
                    },
                    "paint": {
                         "fill-color":color,
                         "fill-opacity":1
                    },
                    'source-layer': 'parcelsgeojson',
                    "event": true
                   }
                 ];
                resolve(layer);
              });
            }else{
              return resolve(null);
            }
          });
          let pBuildingPermits = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/but4-ky7y.geojson?$where=permit_issued > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "permits")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pTotalPropertySales = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/9xku-658c.geojson?$where=sale_date > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "total-property-sales")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pBlight = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/s7hj-n86v.geojson?$where=violation_date > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "blight-tickets")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pCommDemos = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/niaj-6fdd.geojson?$where=demo_date > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "commercial-demos")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let p911 = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.geojson?$where=call_timestamp > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "911")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pCrime = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/9i6z-cm98.geojson?$where=incident_timestamp > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "crime")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pFire = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$where=call_date > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "fire")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pGreenlight = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$where=call_date > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "green-lights")){
              if(controller.map.map.getSource(id)){
                return fetch(url)
                .then((resp) => resp.json()) // Transform the data into json
                .then(function(data) {
                  console.log(data);
                  controller.map.map.getSource(id).setData(data);
                  let layer = [{
                    "id": id,
                    "source": id,
                    "type": "circle",
                    "paint": {
                        "circle-radius": 6,
                        "circle-color": color
                    }
                  }];
                  resolve(layer);
                });
              }else{
                console.log("no source found");
                let sources = [{
                  "id": id,
                  "type": "geojson",
                  "data": url
                }];
                controller.map.addSources(sources, controller);
                let layer = [{
                  "id": id,
                  "source": id,
                  "type": "circle",
                  "paint": {
                      "circle-radius": 6,
                      "circle-color": color
                  }
                }];
                resolve(layer);
              }
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          Promise.all([pBoarded, pBuildingPermits, pTotalPropertySales, pBlight, pCommDemos, p911, pCrime, pFire, pGreenlight]).then(values => {
              console.log(values); //one, two
              let tempNewLayer = null;
              values.forEach(function(value){
                console.log(value);
                if(value != null){ tempNewLayer = value; }
              });
              console.log(tempNewLayer);
              controller.map.addLayers(tempNewLayer, controller);
              console.log(controller.map.currentState);
              let tempDataSet = '';
              if(controller.router.getQueryVariable('dataSets')){
                controller.map.currentState.layers = controller.router.getQueryVariable('dataSets');
              }else{
                controller.map.currentState.layers = [];
              }
              controller.map.currentState.layers.push(id);
              controller.map.currentState.layers.forEach(function(layer){
                tempDataSet += `${layer},`;
              });
              // controller.map.currentState.layers.forEach(function(layer){
              //   if(JSUtilities.inArrayByProperty(controller.dataSouresInfo.dataSets, "id", layer.id)) {tempDataSet += layer.id + ','};
              // });
              console.log(tempDataSet);
              controller.router.updateURLParams({dataSets: tempDataSet});
          }).catch(reason => {
            console.log(reason);
          });
          break;
        default:
          console.log('Error: No boundary');
      }
    }
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
          console.log("city");
          let dataObj = {title: "City of Detroit"};
          let tempDataSets = null;
          console.log(dataSets);
          if(!dataSets) {
            tempDataSets = ["boarded","permits","total-property-sales","blight-tickets","commercial-demos","911","crime","fire","green-lights"];
          }else{
            tempDataSets = dataSets;
          }
          console.log(tempDataSets);
          let pBoarded = new Promise((resolve, reject) => {
            let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+%3E+%27" + controller.defaultSettings.startDate + "%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
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
            let url = "https://data.detroitmi.gov/resource/but4-ky7y.json?$where=permit_issued > '" + controller.defaultSettings.startDate + "'";
            if(JSUtilities.inArray(tempDataSets, "permits")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "permits", "name": "BUILDING PERMITS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              console.log('returning null');
              return resolve(null);
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
              console.log('returning null');
              return resolve(null);
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
              console.log('returning null');
              return resolve(null);
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
              console.log('returning null');
              return resolve(null);
            }
          });
          let p911 = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.json?$where=call_timestamp > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "911")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "911", "name": "911 CALLS", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              console.log('returning null');
              return resolve(null);
            }
          });
          let pCrime = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/9i6z-cm98.json?$where=incident_timestamp > '" + controller.defaultSettings.startDate + "'&$limit=50000";
            if(JSUtilities.inArray(tempDataSets, "crime")){
              return fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function(data) {
                resolve({"id": "crime", "name": "CRIMES", "numbers": data.length.toLocaleString(), "data": data});
              });
            }else{
              console.log('returning null');
              return resolve(null);
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
              console.log('returning null');
              return resolve(null);
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
              console.log('returning null');
              return resolve(null);
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
