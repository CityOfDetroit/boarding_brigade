'use strict';
export default class Router {
  constructor(params) {
    this.params = {};
    for(let param in params){
      this.params[param] = params[param];
    }
  }
  zoomAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
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
        if(item === 'zoom'){
          newParams[item] = this.zoomAdjust('round', newParams[item], -4);
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
