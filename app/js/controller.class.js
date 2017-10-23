'use strict';
import Map from './map.class.js';
import Connector from './connector.class.js';
import Panel from './panel.class.js';
import Router from './router.class.js';
import mapboxgl from 'mapbox-gl';
const turf = require('@turf/simplify');
const arcGIS = require('terraformer-arcgis-parser');
const GeoJSON = require('geojson');
export default class Controller {
  constructor(map, router) {
    this.panel = new Panel();
    this.map = new Map(map);
    this.router = new Router(router);
    this.initialLoad();
  }
  initialLoad(){
    this.panel.createView('stats', {boarded: 150, needBoarding: 75});
    // let tempDate = new Date(this.surveyPeriod.start);
    // document.getElementById('start-date').value = (tempDate.getMonth()+1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
    // tempDate = new Date(this.surveyPeriod.end);
    // document.getElementById('end-date').value = (tempDate.getMonth()+1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
    // let tempParent = this;
    // Connector.getData('https://apis.detroitmi.gov/data_cache/hydrants_admin_info/', function(response){
    //   Connector.postData("https://cors-anywhere.herokuapp.com/"+"https://gisweb.glwater.org/arcgis/tokens/generateToken", JSON.parse(response).data, function(response){
    //     // console.log(response);
    //     tempParent.token = response;
    //     Connector.getData('https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/HydrantCompanies/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=geojson', function(response){
    //       // console.log(JSON.parse(response));
    //       let tempHTML = "";
    //       tempParent.cityData.companies = {};
    //       JSON.parse(response).features.forEach(function(company){
    //         tempHTML += '<option value="' + company.properties.new_engine + '"></option>';
    //         tempParent.cityData.companies[""+ company.properties.new_engine] =  {inspected: 0, total: 0};
    //       });
    //       document.getElementById("company-list").innerHTML = tempHTML;
    //       Connector.getData('https://apis.detroitmi.gov/data_cache/hydrants/', function(response){
    //         // console.log(JSON.parse(response));
    //         tempParent.cityData.hydrants = JSON.parse(response);
    //         tempParent.loadCityData(tempParent);
    //       });
    //     });
    //   });
    // });
  }
  loadCityData(controller){
    document.querySelector('.tabular-titles').innerHTML = "";
    document.querySelector('.tabular-body').innerHTML = '';
    document.querySelector('.blocks-body').innerHTML = "";
    document.querySelector('.cf').innerHTML = '<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>';
    // document.querySelector('.companies-snapshots.active').innerHTML = '<article class="loading-box">LOADING <span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span></article>';
    controller.map.map.flyTo({
        center: [-83.10, 42.36],
        zoom: 10.75,
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
    for(let tempComp in controller.cityData.companies){
      controller.cityData.companies[tempComp] = {inspected: 0, total: 0};
    }
    controller.cityData.hydrants.data.features.forEach(function(hydrant){
      if(hydrant.attributes.FIREDISTID != null){
        let tempCompanyName = hydrant.attributes.FIREDISTID.split('-')[0];
        if(controller.cityData.companies[tempCompanyName]){
          if(hydrant.attributes.INSPECTDT >= controller.surveyPeriod.start && hydrant.attributes.INSPECTDT <= controller.surveyPeriod.end){
            controller.cityData.companies[tempCompanyName].inspected++;
          }
          controller.cityData.companies[tempCompanyName].total++;
        }
      }
    });
    let tempSnaps = "";
    let totalInspected = 0;
    // console.log(controller.cityData.companies);
    for(let comp in controller.cityData.companies){
      totalInspected += controller.cityData.companies[comp].inspected;
      tempSnaps += '<article class="snap"><label for="'+ comp +'" class="tooltip--triangle" data-tooltip="'+ controller.cityData.companies[comp].inspected +'/'+ controller.cityData.companies[comp].total +'"><span>' + comp + '</span><div id="'+ comp +'" ';
      switch (true) {
        case (controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) < .25:
          tempSnaps += 'class="progress zero">';
          break;
        case ((controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) >= .25 && (controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) < .5):
          tempSnaps += 'class="progress twenty-five">';
          break;
        case ((controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) >= .5 && (controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) < .75):
          tempSnaps += 'class="progress fifty">';
          break;
        case ((controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) >= .75 && (controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) < 1):
          tempSnaps += 'class="progress seventy-five">';
          break;
        default:
          tempSnaps += 'class="progress hundred">';
      }
      tempSnaps += '<div class="progress-bar"><div class="percentage">' + Math.trunc((controller.cityData.companies[comp].inspected/controller.cityData.companies[comp].total) * 100) + '%</div></div></div></label></article>';
    }
    document.querySelector('.companies-snapshots.active').innerHTML = tempSnaps;
    document.getElementById('surveyed-num').innerHTML = totalInspected.toLocaleString();
    document.getElementById('not-surveyed-num').innerHTML = (controller.cityData.hydrants.data.features.length - totalInspected).toLocaleString();
    document.getElementById('initial-loader-overlay').className = '';
    let bars = document.querySelectorAll('.progress');
    bars.forEach(function(bar){
      bar.addEventListener('click', function(ev){
        // console.log(ev);
        let id = null;
        if(ev.target.id != ''){
          id = ev.target.id;
        }else{
          id = ev.target.parentNode.parentNode.id;
        }
        // console.log(id);
        controller.filterByCompany(id, controller);
      });
    });
  }
  closeAlert(ev){
    (ev.target.parentNode.parentNode.id === 'alert-overlay') ? document.getElementById('alert-overlay').className = '': document.getElementById('drill-down-overlay').className = '';
  }
  loadDrillDown(ev, controller){
    // console.log(ev);
    // console.log(ev.target.parentNode.id);
    // console.log(controller.state.selectedCompany.data[ev.target.parentNode.id]);
    let tempHTML = '<h1>District - ' + ev.target.parentNode.id + '</h1><article class="hydrant-title"><article>HYDRANT ID</article><article>ADDRESS</article><article>LAST INSPECTED</article></article>';
    controller.state.selectedCompany.data[ev.target.parentNode.id].notInspected.forEach(function(hydrant){
      let date = new Date(hydrant.attributes.INSPECTDT);
      tempHTML += '<article class="hydrant-row"><article>' + hydrant.attributes.HYDRANTID + '</article><article>' + hydrant.attributes.LOCDESC + '</article><article>' + date.toLocaleString("en-us", { month: "short" }) + ' ' + date.getDate() + ', ' + date.getFullYear() + '</article></article>';
    });
    document.querySelector('#drill-down-overlay div').innerHTML = tempHTML;
    document.getElementById('drill-down-overlay').className = 'active';
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
    let tmpObj = [{
      layer: {
        id: null
      },
      properties: {

      }
    }];
    switch (viewType) {
      case 'City':
        tmpObj[0].layer.id = "city";
        break;
      case 'Company':
        tmpObj[0].layer.id = "companies-fill";
        tmpObj[0].properties.new_engine = item;
        break;
      case 'District':
        tmpObj[0].layer.id = "districts-fill";
        tmpObj[0].properties.company_di = item;
        break;
      default:
        // console.log("Hydrant view can't go back");
    }
    controller.filterData(tmpObj, controller);
  }
  filterData(e, controller){
    let tempParent = this;
    let startDate = null;
    let endDate = null;
    let polygon = null;
    if(Array.isArray(e)){
      // console.log(e[0].layer.id);
      switch (e[0].layer.id) {
        case 'city':
          controller.loadCityData(controller);
          break;
        case "companies-fill":
          polygon = e[0].properties.new_engine;
          controller.filterByCompany(polygon,controller);
          break;
        case "districts-fill":
          polygon = e[0].properties.company_di;
          controller.filterByDistrict(polygon,controller);
          break;
        default:
          controller.filterByHydrant(e[0],controller);
      }
    }else{
      startDate = document.getElementById('start-date').value;
      endDate = document.getElementById('end-date').value;
      polygon = document.getElementById('company').value;
      switch (true) {
        case startDate === '':
          document.querySelector('#alert-overlay div').innerHTML = "Need start date.";
          document.getElementById('alert-overlay').className = 'active';
          break;
        case endDate === '':
          document.querySelector('#alert-overlay div').innerHTML = "Need end date.";
          document.getElementById('alert-overlay').className = 'active';
          break;
        case polygon === '':
          document.querySelector('#alert-overlay div').innerHTML = "Need company.";
          document.getElementById('alert-overlay').className = 'active';
          break;
        default:
          let temp = startDate.split('/');
          startDate = temp[2] + '-' + temp[0] + '-' + temp[1];
          temp = endDate.split('/');
          endDate = temp[2] + '-' + temp[0] + '-' + temp[1];
          controller.filterByCompany(polygon, controller);
      }
    }
  }
  filterByCompany(company, controller){
    document.getElementById('initial-loader-overlay').className = 'active';
    document.querySelector('.blocks-body').innerHTML = "";
    document.querySelector('.companies-snapshots.active').innerHTML = "";
    document.querySelector('.data-panel').className = "data-panel active";
    document.querySelector('.map-panel').className = "map-panel active";
    document.getElementById('surveyed-num').innerHTML = 0;
    document.getElementById('not-surveyed-num').innerHTML = 0;
    controller.state.currentActiveView = 'company';
    controller.state.selectedCompany.name = company;
    Connector.getData('https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/CompanyLabels/FeatureServer/0/query?where=new_engine+%3D+%27'+ company +'%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=g4NXFvRNPFo0AROh2sRU-9MlwhWQbJcP5y2zgB8yNHXt9oCcvXRpMf9DE30RZNN2FM1BY21cS9ZWyQTJK37Ibu-klccdG-NEveDbpZgdYMVZYJH_1Rnvafu4muozNPxDVHSo2C4V67BRBr_A8ynk5X0HknYq0JcrY7Jl7TW8aUSeX6vrCvouwycojbNdMzRx467trhtF6HuwSUo1QX7t5HATP9-bKNbj49o69JWup0p4wBFwk8bouMJx8UvzvUsZ', function(response){
        let centerPoint = JSON.parse(response);
        // console.log(centerPoint);
        controller.map.map.flyTo({
            center: [centerPoint.features[0].geometry.x, centerPoint.features[0].geometry.y],
            zoom: 13.5,
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
    });
    document.querySelector('.cf').innerHTML = '<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li><li><a href="#"><span>2</span><span class="breadcrumb-title">Company - '+company+'</span></a></li>';
    let breadcrumbs = document.querySelectorAll('.cf a');
    breadcrumbs.forEach(function(bread){
      bread.addEventListener('click', function(e){
        controller.loadPrevious(e, controller);
      });
    });
    Connector.getData('https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/2017FireHydrantDistricts/FeatureServer/0/query?where=fire_compa+%3D+%27' + company + '%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=', function(response){
      let responseObj = JSON.parse(response);
      document.querySelector('.tabular-titles').innerHTML = "<div>District</div><div>Inspected</div><div>Not Inspected</div>";
      // document.querySelector('.tabular-body').innerHTML = '<article class="loading-box">LOADING <span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span></article>';
      controller.map.map.getSource('districts').setData(responseObj);
      Connector.getData('https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/HydrantLabels/FeatureServer/0/query?where=fire_compa+%3D+%27' + company + '%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=KuKzzHoi-V1Xbrt9BpRvifKqLAt3o7IHA7JajpvzKBxz19rKag0N_gq2StwxStE_9KVqrxr3oJoqq3A5xcfkivrs12AIxs7Pzhcwbx-iFsMySoQANOJSIICBeMN0l7merAI_iUAbl2y9H9jTCC16HMTtaDSwm7yPKnPiQGelbNOULAw8IFLTI8RmB9anGe96AGfYWoqOgVvyTbiAMmKPualWjdKhBGxLSvUlcpyTOJdAah81I8GX9qFAngV1Bm0W', function(response){
        let responseObj = JSON.parse(response);
        // console.log(responseObj);
        controller.map.map.getSource('districts-labels').setData(responseObj);
        let tempTabBody = "";
        let totalSurveyed = 0;
        let totalNotSurved = 0;
        let districtListing = {};
        JSON.parse(response).features.forEach(function(district){
          districtListing["" + district.properties.company_di] = {inspected: 0, total: 0, notInspected: []};
        });
        controller.cityData.hydrants.data.features.forEach(function(hydrant){
          if(  districtListing[hydrant.attributes.FIREDISTID]){
            if(hydrant.attributes.INSPECTDT >= controller.surveyPeriod.start && hydrant.attributes.INSPECTDT <= controller.surveyPeriod.end){
              districtListing[hydrant.attributes.FIREDISTID].inspected++;
            }else{
              districtListing[hydrant.attributes.FIREDISTID].notInspected.push(hydrant);
            }
            districtListing[hydrant.attributes.FIREDISTID].total++;
          }
        });
        // console.log(districtListing);
        controller.state.selectedCompany.data = districtListing;
        // console.log(controller.state.selectedCompany.data);
        for(let dist in districtListing){
          let tempRowHtml = "<article id=\""+ dist +"\" class=\"tabular-row\"><div>"+ dist +"</div><div>"+ districtListing[dist].inspected +"</div><div class=\"not-inspected\">" + (districtListing[dist].total - districtListing[dist].inspected) + "</div></article>";
          tempTabBody += tempRowHtml;
          totalSurveyed += districtListing[dist].inspected;
          totalNotSurved += districtListing[dist].total - districtListing[dist].inspected;
        }
        document.querySelector('.tabular-body').innerHTML = tempTabBody;
        document.getElementById('surveyed-num').innerHTML = totalSurveyed.toLocaleString();
        document.getElementById('not-surveyed-num').innerHTML = totalNotSurved.toLocaleString();
        let drillDownBtns = document.querySelectorAll('.not-inspected');
        drillDownBtns.forEach(function(btn){
          btn.addEventListener('click',function(ev){
             controller.loadDrillDown(ev, controller);
          });
        });
        document.getElementById('initial-loader-overlay').className = '';
      });
    });
  }
  filterByDistrict(district, controller){
    document.getElementById('initial-loader-overlay').className = 'active';
    document.querySelector('.blocks-body').innerHTML = "";
    document.querySelector('.companies-snapshots.active').innerHTML = "";
    document.querySelector('.data-panel').className = "data-panel active";
    document.querySelector('.map-panel').className = "map-panel active";
    document.getElementById('surveyed-num').innerHTML = 0;
    document.getElementById('not-surveyed-num').innerHTML = 0;
    controller.state.currentActiveView = 'district';
    controller.state.selectedDistrict.name = district;
    Connector.getData('https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/HydrantLabels/FeatureServer/0/query?where=company_di%3D+%27' + district + '%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=KuKzzHoi-V1Xbrt9BpRvifKqLAt3o7IHA7JajpvzKBxz19rKag0N_gq2StwxStE_9KVqrxr3oJoqq3A5xcfkivrs12AIxs7Pzhcwbx-iFsMySoQANOJSIICBeMN0l7merAI_iUAbl2y9H9jTCC16HMTtaDSwm7yPKnPiQGelbNOULAw8IFLTI8RmB9anGe96AGfYWoqOgVvyTbiAMmKPualWjdKhBGxLSvUlcpyTOJdAah81I8GX9qFAngV1Bm0W', function(response){
        let centerPoint = JSON.parse(response);
        // console.log(centerPoint);
        controller.map.map.flyTo({
            center: [centerPoint.features[0].geometry.x, centerPoint.features[0].geometry.y],
            zoom: 15.5,
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
    });
    document.querySelector('.tabular-titles').innerHTML = "<div>ID</div><div>Address</div><div>Condition</div><div>Inspected</div><div>Notes</div>";
    document.querySelector('.tabular-body').innerHTML = '<article class="loading-box">LOADING <span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span></article>';
    document.querySelector('.cf').innerHTML = '<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li><li><a href="#"><span>2</span><span class="breadcrumb-title">Company - '+ controller.state.selectedCompany.name +'</span></a></li><li><a href="#"><span>3</span><span class="breadcrumb-title">District - '+ district +'</span></a></li>';
    let breadcrumbs = document.querySelectorAll('.cf a');
    breadcrumbs.forEach(function(bread){
      bread.addEventListener('click', function(e){
        controller.loadPrevious(e, controller);
      });
    });
    let params = {
      token : controller.token,
      where: "FIREDISTID='" + district + "'",
      geometryType: "esriGeometryEnvelope",
      spatialRel: "esriSpatialRelIntersects",
      outFields: '*',
      returnGeometry: true,
      returnTrueCurves: false,
      returnIdsOnly: false,
      returnCountOnly: false,
      outSR: 4326,
      returnZ: false,
      returnM: false,
      returnDistinctValues: false,
      f: 'json'
    }
    Connector.postData("https://cors-anywhere.herokuapp.com/"+"https://gisweb.glwater.org/arcgis/rest/services/Hydrants/dwsd_HydrantInspection_v2/MapServer/0/query",params, function(response){
      console.log(JSON.parse(response));
      let responseObj = JSON.parse(response);
      let hydrantList = {
        "type": "FeatureCollection",
        "features": []
      };
      let tempBody = '';
      let inspectedNum = 0;
      let notInspectedNum = 0;
      responseObj.features.forEach(function(hydrant, index){
        let temHydrantObj = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              hydrant.geometry.x,
              hydrant.geometry.y
            ]
          },
          "properties": {
            ID: hydrant.attributes.OBJECTID,
            hydrantID: hydrant.attributes.HYDRANTID,
            inspectedOn: hydrant.attributes.INSPECTDT,
            address: hydrant.attributes.LOCDESC,
            notes: hydrant.attributes.NOTES,
            inspectionStatus: null,
            facility: hydrant.attributes.FACILITYID,
            fireDistrict: hydrant.attributes.FIREDISTID,
            grid: hydrant.attributes.GRIDNUM,
            operable: hydrant.attributes.OPERABLE,
            flowed: hydrant.attributes.FLOWED,
            noFlow: hydrant.attributes.NOFLOW,
            brokenStem: hydrant.attributes.BROKESTEM,
            frostJack: hydrant.attributes.FROSTJACK,
            hydrantCap: hydrant.attributes.HYDCAP,
            hydrantDrain: hydrant.attributes.HYDDRAIN,
            defectiveThread: hydrant.attributes.DEFTHREAD,
            leaking: hydrant.attributes.LEAKING,
            chatter: hydrant.attributes.CHATTER,
            frozen: hydrant.attributes.FROZEN,
            nearCriticalFacility: hydrant.attributes.CRITICALFAC,
            hardToOpen: hydrant.attributes.HARDOPEN,
            hardToClose: hydrant.attributes.HARDCLOSE,
            hitByVehicle: hydrant.attributes.HITVEHICLE,
            missing: hydrant.attributes.MISSHYDRANT,
            installDate: hydrant.attributes.INSTALLDATE,
            manufacturer: hydrant.attributes.MANUFACTURER,
            model: hydrant.attributes.HYDMODEL,
            castingYear: hydrant.attributes.CASTYEAR,
            activeFlag: hydrant.attributes.ACTIVEFLAG,
            ownedBy: hydrant.attributes.OWNEDBY,
            maintainedBy: hydrant.attributes.MAINTBY,
            lastUpdate: hydrant.attributes.LASTUPDATE,
            lastEditor: hydrant.attributes.LASTEDITOR,
            hydrantTYP: hydrant.attributes.HYDRANTTYP,
            status: hydrant.attributes.STATUS,
            condition: hydrant.attributes.CONDITION,
            security: hydrant.attributes.SECURITY,
            facingCorridor: hydrant.attributes.FACINGCORR,
            operateNut: hydrant.attributes.OPERATENUT,
            photo: hydrant.attributes.PHOTO,
            x: hydrant.attributes.XCOORDI,
            y: hydrant.attributes.YCOORDI,
            ownership: hydrant.attributes.OWNERSHIP,
            district: hydrant.attributes.DISTRICT,
            pressure: hydrant.attributes.PRESSUREZO,
            barrelDiameter: hydrant.attributes.BARRELDIAM,
            crossStreet: hydrant.attributes.CROSSTREET,
            mainSize: hydrant.attributes.WMAINSIZE,
            distanceToCrossStreet: hydrant.attributes.DISTTOCROSSST,
            createdBy: hydrant.attributes.CREATEDBY,
            createdDate: hydrant.attributes.CREATEDATE,
            createdUser: hydrant.attributes.CREATED_USER,
            lastEditedUser: hydrant.attributes.LAST_EDITED_USER,
            lastEditedDate: hydrant.attributes.LAST_EDITED_DATE,
            priority: hydrant.attributes.CUSTOMPRIORITY,
            lowFlow: hydrant.attributes.LowFlow,
            inaccessibleHydrant: hydrant.attributes.InaccessibleHydrant,
            carrollDrain: hydrant.attributes.CarrollDrain,
            lastPaintDate: hydrant.attributes.LASTPAINTDATE,
            hydrantValveLock: hydrant.attributes.HYDRANTVALVELOC,
            operatedBy: hydrant.attributes.OPERATEDBY,
            pressureTestFail: hydrant.attributes.HYD_PRESS_TEST_FAIL,
            pressureTestFailReason: hydrant.attributes.PRESSTESTFAILREASON,
            flushing: hydrant.attributes.HYD_FLUSHING,
            DeadEndHydrant: hydrant.attributes.DeadEndHydrant,
            missingChains: hydrant.attributes.MISSINGCHAINS,
            needsPainting: hydrant.attributes.NEEDSPAINTING,
            seizedCaps: hydrant.attributes.SEIZEDCAPS,
            greased: hydrant.attributes.GREASED
          }
        };
        tempBody += "<article id=\"row-"+ index +"\" class=\"tabular-row ";
        if(hydrant.attributes.INSPECTDT >= controller.surveyPeriod.start && hydrant.attributes.INSPECTDT <= controller.surveyPeriod.end){
          inspectedNum++;
          tempBody += "inspected-true\"><div>" + hydrant.attributes.HYDRANTID + "</div><div>" + hydrant.attributes.LOCDESC + "</div><div>" + hydrant.attributes.CONDITION + "</div><div>TRUE</div><div>" + hydrant.attributes.NOTES + "</div></article>";
          temHydrantObj.properties.inspectionStatus = true;
        }else{
          notInspectedNum++;
          tempBody += "inspected-false\"><div>" + hydrant.attributes.HYDRANTID + "</div><div>" + hydrant.attributes.LOCDESC + "</div><div>" + hydrant.attributes.CONDITION + "</div><div>FALSE</div><div>" + hydrant.attributes.NOTES + "</div></article>";
          temHydrantObj.properties.inspectionStatus = false;
        }
        hydrantList.features.push(temHydrantObj);
      });
      document.querySelector('.tabular-body').innerHTML = tempBody;
      document.querySelector('#surveyed-num').innerHTML = inspectedNum;
      document.querySelector('#not-surveyed-num').innerHTML = notInspectedNum;
      if(controller.map.map.getSource('hydrants')){
        // console.log("Updating hydrants");
        controller.map.map.getSource('hydrants').setData(hydrantList);
      }else{
        // console.log("adding hydrants");
        controller.map.map.addSource('hydrants', {
          type: 'geojson',
          data: hydrantList
        });
        controller.map.map.loadImage('img/fire-hydrant-blue.png', function(error, image) {
          if (error) throw error;
          controller.map.map.addImage('inspected-hydrant', image);
          controller.map.map.addLayer({
              "id": "inspected-hydrants",
              "type": "symbol",
              "source": 'hydrants',
              "minzoom": 15,
              "layout": {
                  "icon-image": "inspected-hydrant",
                  "icon-size": 0.5
              },
              'filter': ['==', 'inspectionStatus', true]
          });
        });
        controller.map.map.loadImage('img/fire-hydrant-red.png', function(error, image) {
          if (error) throw error;
          controller.map.map.addImage('not-inspected-hydrant', image);
          controller.map.map.addLayer({
              "id": "not-inspected-hydrants",
              "type": "symbol",
              "source": 'hydrants',
              "minzoom": 15,
              "layout": {
                  "icon-image": "not-inspected-hydrant",
                  "icon-size": 0.5
              },
              'filter': ['==', 'inspectionStatus', false]
          });
        });
      }
      document.getElementById('initial-loader-overlay').className = '';
    });
  }
  filterByHydrant(hydrant, controller){
    document.getElementById('initial-loader-overlay').className = 'active';
    document.querySelector('.cf').innerHTML = '<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li><li><a href="#"><span>2</span><span class="breadcrumb-title">Company - '+ controller.state.selectedCompany.name +'</span></a></li><li><a href="#"><span>3</span><span class="breadcrumb-title">District - '+ controller.state.selectedDistrict.name +'</span></a></li><li><a href="#"><span>4</span><span class="breadcrumb-title">Hydrant - '+ hydrant.properties.hydrantID +'</span></a></li>';
    let breadcrumbs = document.querySelectorAll('.cf a');
    breadcrumbs.forEach(function(bread){
      bread.addEventListener('click', function(e){
        controller.loadPrevious(e, controller);
      });
    });
    controller.state.selectedHydrant = hydrant.properties.hydrantID;
    document.querySelector('.tabular-titles').innerHTML = '';
    document.querySelector('.tabular-body').innerHTML = '';
    document.querySelector('.blocks-body').innerHTML = '<article class="block"><article><h4>HYDRANT ID</h4><p>' + hydrant.properties.hydrantID + '</p></article></article><article class="block"><article><h4>ADDRESS</h4><p>' + hydrant.properties.address + '</p></article></article><article class="block"><article><h4>INSPECTED ON</h4><p>' + hydrant.properties.inspectedOn + '</p></article></article></article><article class="block"><article><h4>NOTES</h4><p>' + hydrant.properties.notes + '</p></article></article></article><article class="block"><article><h4>INSPECTED</h4><p>' + hydrant.properties.inspectionStatus + '</p></article></article></article><article class="block"><article><h4>FACILITY</h4><p>' + hydrant.properties.facility + '</p></article></article></article><article class="block"><article><h4>FIRE DISTRICT</h4><p>' + hydrant.properties.fireDistrict + '</p></article></article></article><article class="block"><article><h4>GRID</h4><p>' + hydrant.properties.grid + '</p></article></article></article><article class="block"><article><h4>OPERABLE</h4><p>' + hydrant.properties.operable + '</p></article></article></article><article class="block"><article><h4>FLOWED</h4><p>' + hydrant.properties.flowed + '</p></article></article></article><article class="block"><article><h4>NO FLOW</h4><p>' + hydrant.properties.noFlow + '</p></article></article></article><article class="block"><article><h4>BROKEN STEM</h4><p>' + hydrant.properties.brokenStem + '</p></article></article></article><article class="block"><article><h4>HYDRANT CAP</h4><p>' + hydrant.properties.hydrantCap + '</p></article></article></article><article class="block"><article><h4>HYDRANT DRAIN</h4><p>' + hydrant.properties.hydrantDrain + '</p></article></article></article><article class="block"><article><h4>DEFECTIVE THREAD</h4><p>' + hydrant.properties.defectiveThread + '</p></article></article></article><article class="block"><article><h4>LEAKING</h4><p>' + hydrant.properties.leaking + '</p></article></article></article><article class="block"><article><h4>CHATTER</h4><p>' + hydrant.properties.chatter + '</p></article></article></article><article class="block"><article><h4>FROZEN</h4><p>' + hydrant.properties.frozen + '</p></article></article></article><article class="block"><article><h4>NEAR CRITICAL FACILITY</h4><p>' + hydrant.properties.nearCriticalFacility + '</p></article></article><article class="block"><article><h4>HARD TO OPEN</h4><p>' + hydrant.properties.hardToOpen + '</p></article></article><article class="block"><article><h4>HARD TO CLOSE</h4><p>' + hydrant.properties.hardToClose + '</p></article></article><article class="block"><article><h4>HIT BY VEHICLE</h4><p>' + hydrant.properties.hitByVehicle + '</p></article></article><article class="block"><article><h4>MISSING</h4><p>' + hydrant.properties.missing + '</p></article></article><article class="block"><article><h4>INSTALL DATE</h4><p>' + hydrant.properties.installDate + '</p></article></article><article class="block"><article><h4>MANUFACTURER</h4><p>' + hydrant.properties.manufacturer + '</p></article></article><article class="block"><article><h4>MODEL</h4><p>' + hydrant.properties.model + '</p></article></article><article class="block"><article><h4>CASTING YEAR</h4><p>' + hydrant.properties.castingYear + '</p></article></article><article class="block"><article><h4>ACTIVE FLAG</h4><p>' + hydrant.properties.activeFlag + '</p></article></article><article><h4>OWNED BY</h4><p>' + hydrant.properties.ownedBy + '</p></article></article><article><h4>OWNED BY</h4><p>' + hydrant.properties.ownedBy + '</p></article></article>';


    // maintainedBy: hydrant.attributes.MAINTBY,
    // lastUpdate: hydrant.attributes.LASTUPDATE,
    // lastEditor: hydrant.attributes.LASTEDITOR,
    // hydrantTYP: hydrant.attributes.HYDRANTTYP,
    // status: hydrant.attributes.STATUS,
    // condition: hydrant.attributes.CONDITION,
    // security: hydrant.attributes.SECURITY,
    // facingCorridor: hydrant.attributes.FACINGCORR,
    // operateNut: hydrant.attributes.OPERATENUT,
    // photo: hydrant.attributes.PHOTO,
    // x: hydrant.attributes.XCOORDI,
    // y: hydrant.attributes.YCOORDI,
    // ownership: hydrant.attributes.OWNERSHIP,
    // district: hydrant.attributes.DISTRICT,
    // pressure: hydrant.attributes.PRESSUREZO,
    // barrelDiameter: hydrant.attributes.BARRELDIAM,
    // crossStreet: hydrant.attributes.CROSSTREET,
    // mainSize: hydrant.attributes.WMAINSIZE,
    // distanceToCrossStreet: hydrant.attributes.DISTTOCROSSST,
    // createdBy: hydrant.attributes.CREATEDBY,
    // createdDate: hydrant.attributes.CREATEDATE,
    // createdUser: hydrant.attributes.CREATED_USER,
    // lastEditedUser: hydrant.attributes.LAST_EDITED_USER,
    // lastEditedDate: hydrant.attributes.LAST_EDITED_DATE,
    // priority: hydrant.attributes.CUSTOMPRIORITY,
    // lowFlow: hydrant.attributes.LowFlow,
    // inaccessibleHydrant: hydrant.attributes.InaccessibleHydrant,
    // carrollDrain: hydrant.attributes.CarrollDrain,
    // lastPaintDate: hydrant.attributes.LASTPAINTDATE,
    // hydrantValveLock: hydrant.attributes.HYDRANTVALVELOC,
    // operatedBy: hydrant.attributes.OPERATEDBY,
    // pressureTestFail: hydrant.attributes.HYD_PRESS_TEST_FAIL,
    // pressureTestFailReason: hydrant.attributes.PRESSTESTFAILREASON,
    // flushing: hydrant.attributes.HYD_FLUSHING,
    // DeadEndHydrant: hydrant.attributes.DeadEndHydrant,
    // missingChains: hydrant.attributes.MISSINGCHAINS,
    // needsPainting: hydrant.attributes.NEEDSPAINTING,
    // seizedCaps: hydrant.attributes.SEIZEDCAPS,
    // greased: hydrant.attributes.GREASED,
    document.getElementById('initial-loader-overlay').className = '';
  }
}
