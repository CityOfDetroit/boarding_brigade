'use strict';
const moment = require('moment');
const arcGIS = require('terraformer-arcgis-parser');
const WKT = require('terraformer-wkt-parser');

export default class DataManager{

    constructor() {
        this.startDate = moment().format('YYYY-MM-DD')
        this.endDate = moment().subtract(90, 'days').format('YYYY-MM-DD')
        this.possibleSources = ['blight', 'boarded', 'permits', 'sales', '911', 'crime', 'fire']
        this.possibleBounds = ['city', 'neighborhoods', 'council']
        this.bounds;
    }

    init(){
    }

    // Update the bounds that new data will scope to
    updateBounds(map, bounds){
      let geojson = {
          "type": "FeatureCollection",
          "features": [bounds]
      };
      this.bounds = bounds
      this.refresh(map);
      if(map.getSource('bounds')){
        map.getSource('bounds').setData(geojson);
      }else{
        this.outline(map, geojson)
      }
    }

    // adds a stroke to the selected bounds
    outline(map, bounds){
      //console.log("adding bounds")
      map.addSource('bounds', {
           type: 'geojson',
           data: bounds
      });

       map.addLayer({
           'id': 'bounds',
           'type': 'line',
           'source': 'bounds',
           "maxzoom": 15,
           "paint": {
             "line-color": "#888",
             "line-width": 8
           }
       });
    }

    // Refresh the current active data for new time gates and bounds
    refresh(map){
        let stats = ''
        for(let source of this.possibleSources){
            if(map.getSource(source)){
                const dataDetails = this.setupDatasetQuery(source)
                map.getSource(source).setData(dataDetails.url);
                let features = map.queryRenderedFeatures({layers:[source]})
                console.log(features)
                stats += `<li id="stat-${source}">${source}: has ${features.length} entries</li>`

            }else{
                //console.log("Source not found:", source)
            }
        }
        let statsList = document.querySelector(".stats");
        statsList.innerHTML = stats
    }

    // Update the stats for a specific selected bounds
    updateStats(layer, map){
      console.log(features);
      if(document.getElementById(layer)){
        let item = document.getElementById(`stat-${layer}`);
        item.remove();
      }else{
      }
    }

    // Pass the name of the bounds you would like to load and get
    // back an object with the url and unique styles
    getBoundsDetails(name){
      let options = {}
      switch(name){
        case 'city':
          options.url = 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/City_of_Detroit_Boundaries/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token='
          options.paint = {'fill-color': "rgba(81, 115, 167, 0.1)", 'fill-outline-color': "#551A8B"}
          break;
        case 'neighborhoods':
          options.url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/5/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=2898&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson"
          options.paint = {'fill-color': "rgba(81, 115, 167, 0.1)", 'fill-outline-color': "#551A8B"}
          break;
        case 'council':
          options.url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/theNeighborhoods/FeatureServer/7/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=geojson"
          options.paint = {'fill-color': "rgba(81, 115, 167, 0.1)", 'fill-outline-color': "#551A8B"}
          break;
        default:
          console.log("missing dataset: ", name)
      }
      return options
    }

    // Returns an object with the URL for the requested datasets
    // Scoped to the selected boundry and with the default colors
    setupDatasetQuery(name){
        let bb = JSON.parse(JSON.stringify(this.bounds.geometry));
        let arcsimplePolygon = arcGIS.convert(bb);
        let socrataPolygon = WKT.convert(bb);

        let options = {};
        switch(name){
            case 'boarded':
                options.url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Board_Up_Completed_Survey/FeatureServer/0/query?where=CreationDate+between'${this.startDate}'and'${this.endDate}'&objectIds=&time=&geometry=${encodeURI(JSON.stringify(arcsimplePolygon))}&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
                options.paint = {'circle-radius': 9, 'circle-color': "#a6bac2"}
                break;
            case 'blight':
                options.url = `https://data.detroitmi.gov/resource/s7hj-n86v.geojson?$query=SELECT * WHERE violation_date between '${this.endDate}' AND '${this.startDate}' AND within_polygon(location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#34d6f6"}
                break;
            case 'permits':
                options.url = `https://data.detroitmi.gov/resource/but4-ky7y.geojson?$query=SELECT * WHERE permit_issued between '${this.endDate}' AND '${this.startDate}' AND within_polygon(site_location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#c62329"}
                break;
            case 'sales':
                options.url = `https://data.detroitmi.gov/resource/9xku-658c.geojson?$query=SELECT * WHERE sale_date between '${this.endDate}' AND '${this.startDate}' AND within_polygon(location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#faf90d"}
                break;
            case 'demos':
                options.url = `https://data.detroitmi.gov/resource/uzpg-2pfj.geojson?$query=SELECT * WHERE demolition_date between '${this.endDate}' AND '${this.startDate}' AND within_polygon(location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#e98f1e"}
                break;
            case '911':
                options.url = `https://data.detroitmi.gov/resource/dvu3-6qvr.geojson?$query=SELECT * WHERE call_timestamp between '${this.endDate}' AND '${this.startDate}' AND within_polygon(location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#4c5d08"}
                break;
            case 'crime':
                options.url = `https://data.detroitmi.gov/resource/9i6z-cm98.geojson?$query=SELECT * WHERE incident_timestamp between '${this.endDate}' AND '${this.startDate}' AND within_polygon(location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#588dcd"}
                break;
            case 'fire':
                options.url = `https://data.detroitmi.gov/resource/pav4-mvgv.geojson?$query=SELECT * WHERE call_date between '${this.endDate}' AND '${this.startDate}' AND within_polygon(incident_location,${JSON.stringify(socrataPolygon)}) LIMIT 500000`;
                options.paint = {'circle-radius': 9, 'circle-color': "#d93f62"}
                break;
            default:
                console.log("missing dataset: ", name)
        }
        return options;
    }

    addToMap(map, options){
        const datasetDetails = this.setupDatasetQuery(options.name);
        if(!map.getSource(options.name)){
             map.addSource(options.name, {
                type: 'geojson',
                data: datasetDetails.url
            });
            map.addLayer({
                'id': options.name,
                'type': 'circle',
                'source': options.name,
                'paint': datasetDetails.paint
            })
        }else{
            map.removeSource(options.name)
            map.removeLayer(options.name)
        }
    }

    getParcelDetails(parcelNumber){
      let assessor = `https://apis.detroitmi.gov/assessments/parcel/${parcelNumber}/`
      fetch(assessor).then(response => {
        return response.json();
      }).then(data => {
        let assessorData = data
        let location = document.querySelector('.current-parcel')
        location.innerHTML = assessorData.propstreetcombined
      })
    }
}
