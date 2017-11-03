'use strict';
import JSUtilities from './utilities.class.js';
export default class Router {
  constructor(params) {
    this.params = {};
    for(let param in params){
      this.params[param] = params[param];
    }
    window.onhashchange = this.routerChange;
  }
  getRoutingResults() {
    let currentRouting = [];
    let results = {
      zoom: (zoom) => {
        return zoom && zoom !== 0
      },
      lng: (lng) => {
        return lng && lng !== 0
      },
      lat: (lat) => {
        return lat && lat !== 0
      },
      parcel: (parcel) => {
        return parcel && parcel !== ''
      },
      dataSets: (dataSets) => {
        return dataSets && dataSets !== ''
      },
      boundary: (boundary) => {
        return boundary && boundary !== ''
      },
      view: (view) => {
        return view && view !== ''
      }
    };
    for (var key in results) {
      currentRouting.push(results[key](this.getQueryVariable(key)));
    }
    return currentRouting;
  }
  loadURLRouting() {
    var currentRouting = this.getRoutingResults();
    console.log(currentRouting);
    if (currentRouting[currentRouting.length - 1]) {
      return currentRouting[currentRouting.length - 1];
    } else {
      return null;
    }
  }
  getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        if (pair[1] !== '') {
          return pair[1];
        }
      }
    }
    return (false);
  }
  updateURLParams(newParams) {
    for (var item in newParams) {
      if (this.params.hasOwnProperty(item)) {
        switch (item) {
          case 'boundary':
            break;
          case 'dataSets':
            break;
          default:
            newParams[item] = JSUtilities.roundNumber(newParams[item], 4);
        }
        this.params[item] = newParams[item];
      }
    }
    var newTempURL = '';
    for (var property in this.params) {
      if (this.params.hasOwnProperty(property)) {
        // console.log(property);
        // console.log(currentURLParams[property]);
        switch (true) {
          case property !== 0:
            newTempURL += property + '=' + this.params[property] + '&';
            break;
          default:

        }
      }
    }
    // console.log(newTempURL);
    if (history.pushState) {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + newTempURL;
      window.history.pushState({
        path: newurl
      }, '', newurl);
    }
  }
}
