'use strict';
export default class Panel {
  constructor() {
    this.title = null;
  }
  createPanel(values, controller){
    console.log(values);
    document.getElementById('initial-loader-overlay').className = '';
    document.getElementById("map-side-panel").className = "active";
  }
}
