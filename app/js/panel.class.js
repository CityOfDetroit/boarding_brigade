'use strict';
import flatpickr from "flatpickr";
import JSUtilities from './utilities.class.js';
export default class Panel {
  constructor() {
    this.title = null;
    this.currentView = null;
    this.views = {
      STAT: {},
      LAYER: {},
      SET: {},
      FORM: {}
    };
  }
  createStats(view, data, controller){
    let markUp = "";
    let breadcrumbs = "";
    switch (true) {
      case (data.boarded === null && data.needBoarding === null):
        breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>
                      <li><a href="#"><span>2</span><span class="breadcrumb-title">${controller.panel.title}</span></a></li>`;
        markUp = `
        <article class="data-sets-boundaries">
          <div>
            <p>No data sets selected.</p>
          </div>
        </article>`;
        break;
      case (data.boarded === null && data.needBoarding != null):
        breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>
                      <li><a href="#"><span>2</span><span class="breadcrumb-title">${controller.panel.title}</span></a></li>`;
        markUp = `
        <div class="item">
          <h2>${controller.panel.views[view].needBoarding}<br><span>NEED BOARDING</span></h2>
        </div>`;
        break;
      case (data.boarded != null && data.needBoarding === null):
        breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>
                      <li><a href="#"><span>2</span><span class="breadcrumb-title">${controller.panel.title}</span></a></li>`;
        markUp = `
        <div class="item">
          <h2>${controller.panel.views[view].boarded}<br><span>BOARDED</span></h2>
        </div>`;
        break;
      default:
        if(controller.router.getQueryVariable('polygon') != 'city'){
          breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>
                        <li><a href="#"><span>2</span><span class="breadcrumb-title">${controller.panel.title}</span></a></li>`;
        }else{
          breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>`;
        }
        markUp = `
        <div class="item">
          <h2>${controller.panel.views[view].boarded}<br><span>BOARDED</span></h2>
        </div>
        <div class="item">
          <h2>${controller.panel.views[view].needBoarding}<br><span>NEED BOARDING</span></h2>
        </div>`;
    }
    return [markUp, breadcrumbs];
  }
  createView(view, data, controller){
    if(data != null){
      (data.title) ? controller.panel.title = data.title : 0;
      controller.panel.currentView = view;
      controller.panel.views[view] = data;
    }else{
      console.log('No data');
    }
    let tempHTML = '';
    switch (view) {
      case 'STAT':
        // console.log('creating stats view');
        let tempMarkup = this.createStats(view, data, controller);
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <section class="breadcrumbs">
            <article class="inner">
              <ul class="cf">
                ${tempMarkup[1]}
              </ul>
            </article>
          </section>
          <article class="highlights">
            ${tempMarkup[0]}
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        let breadcrumbs = document.querySelectorAll('.cf a');
        breadcrumbs.forEach(function(bread){
          bread.addEventListener('click', function(e){
            controller.loadPrevious(e, controller);
          });
        });
        document.getElementById('initial-loader-overlay').className = '';
        break;
      case 'LAYER':
        // console.log('creating layers view');
        let boundariesHTML = '';
        let datasetsHTML = '';
        let activeOptions = [];
        let tempDataSets = '';
        if(controller.router.getQueryVariable('dataSets')){
          tempDataSets = controller.router.getQueryVariable('dataSets');
          tempDataSets = tempDataSets.split(',');
        }
        if(Array.isArray(tempDataSets)){
          tempDataSets.forEach(function(set){
            (set != '') ? activeOptions.push(set) : 0;
          });
        }
        activeOptions.push(controller.router.getQueryVariable('boundary'));
        data.data.boundaries.forEach(function(bound){
          let tempCheck = '';
          (JSUtilities.inArray(activeOptions,bound.id)) ? tempCheck = 'checked' : tempCheck = '';
          boundariesHTML += `
          <input type="radio" id="${bound.id}" name="boundaries" ${tempCheck}>
          <label class="layer-btn radio" data-id="${bound.id}" for="${bound.id}">${bound.name}</label>
          `;
        });
        data.data.dataSets.forEach(function(set){
          let tempCheck = '';
          (JSUtilities.inArray(activeOptions,set.id)) ? tempCheck = 'checked' : tempCheck = '';
          datasetsHTML += `
          <input type="checkbox" id="${set.id}" name="datasets" ${tempCheck}>
          <label class="layer-btn checkbox" data-id="${set.id}" for="${set.id}">${set.name}</label>
          `;
        });
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <article class="data-sets-boundaries">
            <div class="time-range">
              <h2>DATES</h2>
              <article>
                <label for="start-date">
                  Start Date:
                  <input type="text" id="start-date" name="start-date" value="">
                </label>
                <label for="end-date">
                  End Date:
                  <input type="text" id="end-date" name="end-date" value="">
                </label>
              </article>
            </div>
            <div class="boundaries">
              <h2>BOUNDARIES</h2>
              <article>
                ${boundariesHTML}
              </article>
            </div>
            <div class="data-sets">
              <h2>DATA SETS</h2>
              <article>
                ${datasetsHTML}
              </article>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        let layerBtns = document.querySelectorAll('.layer-btn');
        layerBtns.forEach(function(btn){
          btn.addEventListener('click', function(ev){
            // console.log(ev);
            // console.log(ev.target.attributes[1].nodeValue);
            if(ev.target.className === 'layer-btn radio'){
              if(document.getElementById(ev.target.attributes[1].nodeValue).checked){
                console.log('radio already checked');
              }else{
                console.log('switching active radio');
                // controller.layerAddRemove(ev.target.attributes[1].nodeValue,controller);
              }
            }else{
              // console.log(document.getElementById(ev.target.attributes[1].nodeValue).checked);
              if(document.getElementById(ev.target.attributes[1].nodeValue).checked){
                // console.log('unchecking');
                controller.layerAddRemove(ev.target.attributes[1].nodeValue,'remove',controller);
              }else{
                // console.log('checking');
                controller.layerAddRemove(ev.target.attributes[1].nodeValue,'add',controller);
              }
            }
          });
        });
        flatpickr('#start-date', {
          altInput: true,
          altFormat: "F j, Y",
          dateFormat: "Y-m-d",
        });
        flatpickr('#end-date', {
          altInput: true,
          altFormat: "F j, Y",
          dateFormat: "Y-m-d",
        });
        break;
      case 'TOOLS':
        // console.log('creating settings view');
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <article class="data-sets-boundaries">
            <div>
              <p>Tools panel comming soon.</p>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        break;
      case 'SET':
        // console.log('creating settings view');
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <article class="data-sets-boundaries">
            <div>
              <p>Settings panel comming soon.</p>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        break;
      case 'FORM':
        // console.log('creating forms view');
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <article class="data-sets-boundaries">
            <div>
              <p>Form submitions panel comming soon.</p>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        break;
      default:
        console.log('invalid view reverting back');
    }
  }
}
