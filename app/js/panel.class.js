'use strict';
export default class Panel {
  constructor() {
    this.title = null;
    this.currentView = null;
    this.views = {
      STAT: {},
      LAYER: {},
      SET: {},
      FORM: {}
    }
  }
  createView(view, data, controller){
    console.log(view);
    console.log(data);
    console.log(controller.panel);
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
        console.log('creating stats view');
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <article class="highlights">
            <div class="item">
              <h2>${controller.panel.views[view].boarded}<br><span>BOARDED</span></h2>
            </div>
            <div class="item">
              <h2>${controller.panel.views[view].needBoarding}<br><span>NEED BOARDING</span></h2>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        break;
      case 'LAYER':
        console.log('creating layers view');
        let boundariesHTML = '';
        let datasetsHTML = '';
        data.boundaries.forEach(function(bound){
          boundariesHTML += `
          <input type="radio" id="${bound.id}" name="boundaries" checked>
          <label class="layer-btn radio" data-id="${bound.id}" for="${bound.id}">${bound.name}</label>
          `;
        });
        data.dataSets.forEach(function(set){
          datasetsHTML += `
          <input type="checkbox" id="${set.id}" name="datasets">
          <label class="layer-btn checkbox" data-id="${set.id}" for="${set.id}">${set.name}</label>
          `;
        });
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title}</h1>
          </article>
          <article class="data-sets-boundaries">
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
            console.log(ev);
            console.log(ev.target.attributes[1].nodeValue);
            if(ev.target.className === 'layer-btn radio'){
              if(document.getElementById(ev.target.attributes[1].nodeValue).checked){
                console.log('radio already checked');
              }else{
                console.log('switching active radio');
                // controller.layerAddRemove(ev.target.attributes[1].nodeValue,controller);
              }
            }else{
              console.log(document.getElementById(ev.target.attributes[1].nodeValue).checked);
              if(document.getElementById(ev.target.attributes[1].nodeValue).checked){
                console.log('unchecking');
                controller.layerAddRemove(ev.target.attributes[1].nodeValue,'remove',controller);
              }else{
                console.log('checking');
                controller.layerAddRemove(ev.target.attributes[1].nodeValue,'add',controller);
              }
            }
          });
        });
        break;
      case 'TOOLS':
        console.log('creating settings view');
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
        console.log('creating settings view');
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
        console.log('creating forms view');
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
  viewToggle(view, panel){
    console.log(view);
    console.log(panel);
  }
}
