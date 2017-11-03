'use strict';
import Controller from './controller.class.js';
import Connector from './connector.class.js';
(function(){
  let controller = new Controller({
    styleURL: 'mapbox://styles/mapbox',
    mapContainer: 'map',
    geocoder: false,
    baseLayers: {
      street: 'streets-v10',
      satellite: 'cj774gftq3bwr2so2y6nqzvz4'
    },
    center: [-83.10, 42.36],
    zoom: 10.75,
    boundaries: {
      sw: [-83.3437,42.2102],
      ne: [-82.8754,42.5197]
    },
    sources: [
      {
        id:'parcels',
        type: 'vector',
        url: 'mapbox://slusarskiddetroitmi.cwobdjn0'
      },
      {
        id: "council",
        type: "geojson",
        data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/7/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=geojson'
      },
      {
        id: "council-labels",
        type: "geojson",
        data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/3/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token='
      },
      {
        id: "boardups",
        type: "geojson",
        data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/service_d8ef2e7ac3074dc5907b49914d5d7f7b/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=PbQEdKIr7l-BB7bmiviGJE34VD2zz3Uph9tYIoM2_TKVLWmvm0QfQGLx_ooVXTNoahNxCE9HvRUQ6mkj_VWUJSnHEdKN3btRhL8z1iR96qxFNi4qg0POMeJdG_za9m9Kx-r7mzvxSMMCPtF7GY0-PwddLXIv-4YqnqgBi-NsK4Xg8kw0zDaSBSvZLp3ro_h5xEwpffkxtXmVBo5ks4ixP0je_XCixBbzuPQCL1ruU7c602j7FlToULceqYzHYpaD'
      }
    ],
    layers: [
      {
        "id": "council",
        "type": "fill",
        "source": "council",
        "maxzoom": 12.5,
        "layout": {},
        "paint": {
          "fill-color": '#9FD5B3',
          "fill-opacity": .2
        }
      },
      {
        "id": "council-borders",
        "type": "line",
        "source": "council",
        "maxzoom": 12.5,
        "layout": {},
        "paint": {
          "line-color": "#004544",
          "line-width": 3
        }
      },
      {
        "id": "council-hover",
        "type": "fill",
        "source": "council",
        "maxzoom": 12.5,
        "layout": {},
        "paint": {
          "fill-color": '#23A696',
          "fill-opacity": .3
        },
        "filter": ["==", "districts", ""]
      },
      {
        'id': 'council-labels',
        'type': 'symbol',
        'source': 'council-labels',
        "maxzoom": 12.5,
        'layout': {
          "text-font": ["Mark SC Offc Pro Bold"],
          "text-field": "District " + "{districts}",
          "symbol-placement": "point",
          "text-size": 22
        },
        'paint': {
          'text-color': '#004544'
        }
      },
      {
          "id": "parcel-fill",
          "type": "fill",
          "source": "parcels",
          "minzoom": 15.5,
          "layout": {
          },
          "paint": {
               "fill-color":"#fff",
               "fill-opacity":0
          },
          'source-layer': 'parcelsgeojson'
       },
       {
          "id": "parcel-line",
          "type": "line",
          "source": "parcels",
          "minzoom": 15.5,
          "layout": {
          },
          "paint": {
               "line-color":"#cbcbcb",
          },
          'source-layer': 'parcelsgeojson'
       }
    ]
  },{
    lat: 0,
    lng: 0,
    zoom: 0,
    boundary: '',
    dataSets: ''
  },{
    boundaries: [
      'council'
    ],
    dataSets: [
      'boarded',
      'needBoarding'
    ]
  });
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(function(btn){
    btn.addEventListener('click',function(ev){
      console.log(ev);
      if(ev.target.tagName === "DIV"){
        if(ev.target.className != "tab-btn active"){
          document.querySelector('.tab-btn.active').className = 'tab-btn';
          controller.createPanelData(ev.target.children[1].innerText, controller);
          ev.target.className = 'tab-btn active';
        }
      }else{
        if(ev.target.parentNode.className != "tab-btn active"){
          document.querySelector('.tab-btn.active').className = 'tab-btn';
          controller.createPanelData(ev.target.parentNode.children[1].innerText, controller);
          ev.target.parentNode.className = 'tab-btn active';
        }
      }
    });
  })
  controller.map.map.on("zoom", function(e, parent = this) {
    console.log(controller.map.map.getZoom());
    controller.router.updateURLParams({zoom: controller.map.map.getZoom()});
  });
  controller.map.map.on("dragend", function(e, parent = this) {
    console.log(controller.map.map.getCenter());
    controller.router.updateURLParams({lng: controller.map.map.getCenter().lng, lat: controller.map.map.getCenter().lat});
  });
  controller.map.map.on("mousemove", function(e, parent = this) {
    try {
      var features = this.queryRenderedFeatures(e.point, {
        layers: ["council"]
      });
      if (features.length) {
        this.setFilter("council-hover", ["==", "districts", features[0].properties.districts]);
      }else{
        this.setFilter("council-hover", ["==", "districts", ""]);
        if(controller.map.map.getLayer("boarded")){
          var features = this.queryRenderedFeatures(e.point, {
            layers: ["boarded"]
          });
        }
        if(controller.map.map.getLayer("needBoarding")){
          var features = this.queryRenderedFeatures(e.point, {
            layers: ["needBoarding"]
          });
        }
      }
      this.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    } catch (e) {
      console.log("Error: " + e);
    }
  });
  controller.map.map.on("click", function(e, parent = this) {
    try {
      var features = this.queryRenderedFeatures(e.point, {
        layers: ["council"]
      });
      if (features.length) {
        console.log(features);
        controller.checkLayerType(features[0].layer.id, controller);
      }else{
        var features = this.queryRenderedFeatures(e.point, {
          layers: ["boarded"]
        });
        if (features.length) {
          console.log(features);
          controller.checkLayerType(features[0].layer.id, controller);
        }else{
          var features = this.queryRenderedFeatures(e.point, {
            layers: ["needBoarding"]
          });
          if(features.length){
            console.log(features);
            controller.checkLayerType(features[0].layer.id, controller);
          }else{
            console.log('No features');
          }
        }
      }
    } catch (e) {
      console.log("Error: " + e);
    }
  });
  let closeAlertBtns = document.querySelectorAll('.close');
  closeAlertBtns.forEach(function(btn){
    btn.addEventListener('click', function(ev){
        controller.closeAlert(ev)
    });
  });
})(window);
