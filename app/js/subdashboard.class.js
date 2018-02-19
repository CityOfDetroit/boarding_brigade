'use strict';
import Chart from 'chart.js';
const moment = require('moment');
export default class SubDashboard {
  constructor() {
  }
  loadStartView(set, controller){
    console.log(controller.dataBank[set]);
    let properties = [];
    controller.layerAddRemove(set,'add',controller);
    document.getElementById(set).checked = true;
    document.getElementById(set).disabled = true;
    document.getElementById(set).parentElement.className = "active";
    for (let property in controller.dataBank[set].features[0].properties) {
      if (controller.dataBank[set].features[0].properties.hasOwnProperty(property)) {
        properties.push(property);
      }
    }
    console.log(properties);
    let tempHTML = `
    <article id="view-filters-btn"><span>FILTERS</span> <img src="img/settings-1.png" alt="filters"></article>
    <article id="view-map-btn"><span>VIEW MAP</span> <img src="img/map-view.png" alt="map"></article>
    <section class="breadcrumbs">
      <article class="inner">
        <ul class="cf">
          <li><a href="#"><span>1</span><span class="breadcrumb-title">Home</span></a></li>
          <li><a href="#" class="active"><span>2</span><span class="breadcrumb-title">${set}</span></a></li>
        </ul>
      </article>
    </section>
    <article class="sec-title"><h2>${set}</h2></article>
    <article class="highlights lots">
      <div class="item parent-item">
        <h2>${controller.dataBank[set].features.length.toLocaleString()}<br><span>TOTAL ${set}</span></h2>
      </div>
    </article>`;
    document.querySelector('.panel-content').className = "panel-content details";
    document.querySelector('.panel-content').innerHTML = tempHTML;
    document.getElementById(set).parentElement.className = "";
  }
}
