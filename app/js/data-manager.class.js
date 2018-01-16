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
  createLayer(id, color, controller){
    console.log(id);
    let boundary = controller.router.getQueryVariable("boundary");
    let polygon = controller.router.getQueryVariable("polygon");
    console.log(controller.currentPolygon);
    if(polygon){
      // NOTE: Add functions for quering manually created polygons
      console.log("custom polygon");
      console.log(boundary);
      let dataObj = null;
      let simplePolygon = turf(controller.currentPolygon, 0.005, false);
      // console.log(simplePolygon);
      let arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
      switch (boundary) {
        case "council":
          dataObj.title = controller.currentPolygon.properties.name;
          break;
        case "neighborhood":
          dataObj.title = controller.currentPolygon.properties.name;
          break;
        default:

      }
      let tempDataSets = controller.router.getQueryVariable('dataSets');
      if(!tempDataSets) {
        tempDataSets = [];
      }
      console.log(tempDataSets);
      let pBoarded = new Promise((resolve, reject) => {
        let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+between+%27" + controller.defaultSettings.startDate + "%27+and+%27" + controller.defaultSettings.endDate + "%27&objectIds=&time=&geometry=" + encodeURI(JSON.stringify(arcsimplePolygon))+ "&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=parcel&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
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
        let url = "https://data.detroitmi.gov/resource/but4-ky7y.geojson?$query=SELECT * WHERE permit_issued between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(site_location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "permits")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/9xku-658c.geojson?$query=SELECT * WHERE sale_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "total-property-sales")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/s7hj-n86v.geojson?$query=SELECT * WHERE violation_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "blight-tickets")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/niaj-6fdd.geojson?$query=SELECT * WHERE demo_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "commercial-demos")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.geojson?$query=SELECT * WHERE call_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "911")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/9i6z-cm98.geojson?$query=SELECT * WHERE incident_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "crime")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$query=SELECT * WHERE call_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(incident_location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "fire")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
        let url = "https://data.detroitmi.gov/resource/xgha-35ji.geojson?$query=SELECT * WHERE live_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
        if(JSUtilities.inArray(tempDataSets, "green-lights")){
          if(controller.map.map.getSource(id)){
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              console.log(data);
              controller.map.map.getSource(id).setData(data);
              if(controller.map.map.getLayer(id)){
                resolve(null);
              }else{
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
    }else{
      console.log(boundary);
      switch (boundary) {
        case "council":

          break;

        case "neighborhood":

          break;

        case "city":
          console.log("city");
          let dataObj = {title: "City of Detroit"};
          let tempDataSets = [id];
          console.log(tempDataSets);
          let pBoarded = new Promise((resolve, reject) => {
            let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+between+%27" + controller.defaultSettings.startDate + "%27+and+%27" + controller.defaultSettings.endDate + "%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=parcel&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
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
            let url = "https://data.detroitmi.gov/resource/but4-ky7y.geojson?$where=permit_issued between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
            let url = "https://data.detroitmi.gov/resource/9xku-658c.geojson?$where=sale_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
            let url = "https://data.detroitmi.gov/resource/s7hj-n86v.geojson?$where=violation_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
            let url = "https://data.detroitmi.gov/resource/niaj-6fdd.geojson?$where=demo_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
            let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.geojson?$where=call_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
            let url = "https://data.detroitmi.gov/resource/9i6z-cm98.geojson?$where=incident_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
            let url = "https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$where=call_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
            let url = "https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$where=call_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
    switch (boundary) {
      case "council":
        console.log(controller.currentPolygon);
        let dataObj = {title: controller.currentPolygon.properties.name};
        let simplePolygon = turf(controller.currentPolygon, 0.005, false);
        // console.log(simplePolygon);
        let arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
        let socrataPolygon = WKT.convert(simplePolygon.geometry);
        let tempDataSets = null;
        if(!dataSets) {
          tempDataSets = [];
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
          let url = "https://data.detroitmi.gov/resource/but4-ky7y.json?$query=SELECT * WHERE permit_issued between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(site_location,"+ JSON.stringify(socrataPolygon) + ")";
          console.log(url);
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
          let url = "https://data.detroitmi.gov/resource/9xku-658c.json?$query=SELECT * WHERE sale_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
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
          let url = "https://data.detroitmi.gov/resource/s7hj-n86v.json?$query=SELECT * WHERE violation_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
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
          let url = "https://data.detroitmi.gov/resource/niaj-6fdd.json?$query=SELECT * WHERE demo_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
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
          let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.json?$query=SELECT * WHERE call_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") AND limit = 50000";
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
          let url = "https://data.detroitmi.gov/resource/9i6z-cm98.json?$query=SELECT * WHERE incident_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") AND limit = 50000";
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
          let url = "https://data.detroitmi.gov/resource/pav4-mvgv.json?$query=SELECT * WHERE call_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(incident_location,"+ JSON.stringify(socrataPolygon) + ") AND limit = 50000";
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
          let url = "https://data.detroitmi.gov/resource/xgha-35ji.json?$query=SELECT * WHERE live_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ")";
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

      case "neighborhood":
        simplePolygon = turf(controller.currentPolygon, 0.005, false);
        // console.log(simplePolygon);
        arcsimplePolygon = arcGIS.convert(simplePolygon.geometry);
        break;

      case "city":
        console.log("city");
        dataObj = {title: "City of Detroit"};
        tempDataSets = null;
        console.log(dataSets);
        if(!dataSets) {
          tempDataSets = ["boarded","permits","total-property-sales","blight-tickets","commercial-demos","911","crime","fire","green-lights"];
        }else{
          tempDataSets = dataSets;
        }
        console.log(tempDataSets);
        pBoarded = new Promise((resolve, reject) => {
          let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+between+%27" + controller.defaultSettings.startDate + "%27+and+%27" + controller.defaultSettings.endDate + "%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=";
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
        pBuildingPermits = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/but4-ky7y.json?$where=permit_issued between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
        pTotalPropertySales = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/9xku-658c.json?$where=sale_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
        pBlight = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/s7hj-n86v.json?$where=violation_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
        pCommDemos = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/niaj-6fdd.json?$where=demo_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'";
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
        p911 = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/dvu3-6qvr.json?$where=call_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
        pCrime = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/9i6z-cm98.json?$where=incident_timestamp between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
        pFire = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/pav4-mvgv.json?$where=call_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
        pGreenlight = new Promise((resolve, reject) => {
          let url = "https://data.detroitmi.gov/resource/xgha-35ji.json?$where=live_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "'&$limit=50000";
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
