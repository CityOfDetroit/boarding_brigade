'use strict';
export default class Connector {
  constructor() {
    this.params = {
    }
  }
  static getData(URL, callback){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.response);
    }
    xmlHttp.open("GET", URL, true); // true for asynchronous
    xmlHttp.send(null);
  }
  static postData(URL, data, success, parseType = null){
    // console.log(URL);
    let params = null;
    if(parseType){
      params = JSON.stringify(data);
    }else{
      params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); }
        ).join('&');
    }
    // console.log(params);
    let xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xmlHttp.open('POST', URL);
    xmlHttp.onload  = function() {
      if (xmlHttp.readyState>3 && xmlHttp.status==200) {
        // console.log('xmlHttp success');
        success(xmlHttp.response);
      }else{
        console.log('xmlHttp error');
        console.log('xmlHttp status: ' + xmlHttp.status);
      }
    };
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlHttp.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    xmlHttp.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.onerror = function (e) {
      console.log("** An error occurred during the transaction: " + e);
    };
    xmlHttp.send(params);
    return xmlHttp;
  }
}
