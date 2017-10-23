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
        id: "council",
        type: "geojson",
        data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/7/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=geojson'
      },
      {
        id: "council-labels",
        type: "geojson",
        data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/3/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token='
      }
    ],
    layers: [
      {
        "id": "council-fill",
        "type": "fill",
        "source": "council",
        "maxzoom": 12.5,
        "layout": {},
        "paint": {
          "fill-color": '#9FD5B3',
          "fill-opacity": .5
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
          "fill-opacity": .5
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
      }
    ]
  },{
    lat: 0,
    lng: 0,
    zoom: 0
  });
  console.log(controller);
  controller.map.map.on("zoom", function(e, parent = this) {
    console.log(controller.map.map.getZoom());
    controller.router.updateURLParams({zoom: controller.map.map.getZoom()});
  });
  controller.map.map.on("mousemove", function(e, parent = this) {
    try {
      var features = this.queryRenderedFeatures(e.point, {
        layers: ["council-fill"]
      });
      // console.log(features);
      if (features.length) {
        this.setFilter("council-hover", ["==", "districts", features[0].properties.districts]);
      }else{
        this.setFilter("council-hover", ["==", "districts", ""]);
      }
      this.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    } catch (e) {
      console.log("Error: " + e);
    }
  });
  controller.map.map.on("click", function(e, parent = this) {
    try {
      var features = this.queryRenderedFeatures(e.point, {
        layers: ["council-fill"]
      });
      if (features.length) {
        console.log(features);
        // controller.filterData(features, controller);
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
