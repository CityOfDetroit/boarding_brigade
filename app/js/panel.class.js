'use strict';
import flatpickr from "flatpickr";
import JSUtilities from './utilities.class.js';
import Chart from 'chart.js';
export default class Panel {
  constructor() {
    this.title = null;
    this.currentView = null;
    this.views = {
      STAT: {},
      FILTERS: {},
      SET: {},
      FORM: {}
    };
    this.ctx = {};
    this.charts = {};
  }
  createStats(view, data){
    let markUp = "";
    let breadcrumbs = "";
    console.log(data);
    console.log(view);
    if(data.dataSets.length){
      data.dataSets.forEach(function(data){
        markUp += `
        <div class="item">
          <h2>${data.numbers}<br><span>${data.name}</span></h2>
        </div>`;
      });
    }else{
      markUp = `
      <article class="data-sets-boundaries">
        <div>
          <p>No data sets selected.</p>
        </div>
      </article>`;
    }
    if(data.title === "City of Detroit"){
      breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>`;
    }else{
      breadcrumbs = `<li><a href="#"><span>1</span><span class="breadcrumb-title">City</span></a></li>
                    <li><a href="#"><span>2</span><span class="breadcrumb-title">${controller.panel.title}</span></a></li>`;
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
        let chartingItems = [];
        let tempMarkup = this.createStats(view, data);
        tempHTML = `
          <article class="title">
            <h1>${controller.panel.title} : stats</h1>
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
        data.dataSets.forEach(function(set){
          switch (true) {
            case set.id === "911":
              chartingItems.push(set);
              break;
            case set.id === "crime":
              chartingItems.push(set);
              break;
            default:

          }
        });
        console.log(chartingItems);
        if(chartingItems.length){
          tempHTML += `<article class="chart-section">`;
          chartingItems.forEach(function(item){
            tempHTML += `
              <div>
                <h2>${item.id}</h2>
                <canvas id="${item.id}-chart"`;
            if(item.id === "crime"){
              tempHTML += `
                width="400" height="250"></canvas>
              </div>
              `;
            }else{
              tempHTML += `
                width="400" height="1200"></canvas>
              </div>
              `;
            }
          });
          tempHTML += `</article>`;
          document.querySelector('.panel-content').innerHTML = tempHTML;
          let rawChartData = controller.panel.buildChartData(chartingItems);
          let cleanChartData = {};
          for(let chart in rawChartData){
            cleanChartData[chart] = {"labels":[],"data":[],"color":[]};
            for(let value in rawChartData[chart]){
              cleanChartData[chart].labels.push(value);
              cleanChartData[chart].data.push(rawChartData[chart][value]);
              cleanChartData[chart].color.push(JSUtilities.dynamicColors());
            }
          }
          // controller.panel.ctx["crime"] = document.getElementById("crime-chart");
          // controller.panel.charts["crime"] = new Chart(controller.panel.ctx["crime"], {
          //     type: 'horizontalBar',
          //     data: {
          //         labels: cleanChartData["crime"].labels,
          //         datasets: [{
          //             data: cleanChartData["crime"].data,
          //             backgroundColor: "#E48F22",
          //             borderColor: "#E48F22"
          //         }]
          //     },
          //     options: {
          //       legend: {
          //           display: false
          //       },
          //       scales: {
          //           yAxes: [{
          //               ticks: {
          //                   fontColor: "white"
          //               }
          //           }],
          //           xAxes: [{
          //               ticks: {
          //                   fontColor: "white"
          //               }
          //           }]
          //       }
          //     }
          //  });
          console.log(cleanChartData);
          for (var chart in cleanChartData) {
            console.log(chart);
            console.log(cleanChartData[chart]);
            controller.panel.ctx[chart] = document.getElementById(chart + "-chart");
            controller.panel.charts[chart] = new Chart(controller.panel.ctx[chart], {
                type: 'horizontalBar',
                data: {
                    labels: cleanChartData[chart].labels,
                    datasets: [{
                        data: cleanChartData[chart].data,
                        backgroundColor: "#E48F22",
                        borderColor: "#E48F22"
                    }]
                },
                options: {
                  legend: {
                      display: false
                  },
                  scales: {
                      yAxes: [{
                          ticks: {
                              fontColor: "white"
                          },
                          gridLines: {
                            color: 'rgba(255,255,255,.25)'
                          }
                      }],
                      xAxes: [{
                          ticks: {
                              fontColor: "white"
                          },
                          gridLines: {
                            color: 'rgba(255,255,255,.25)'
                          }
                      }]
                  }
                }
             });
          }
        }
        let breadcrumbs = document.querySelectorAll('.cf a');
        breadcrumbs.forEach(function(bread){
          bread.addEventListener('click', function(e){
            controller.loadPrevious(e, controller);
          });
        });
        document.getElementById('initial-loader-overlay').className = '';
        break;
      case 'FILTERS':
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
          <span>
          <input type="radio" id="${bound.id}" name="boundaries" ${tempCheck}>
          <label class="layer-btn radio" data-id="${bound.id}" for="${bound.id}">${bound.name}</label>
          </span>
          `;
        });
        data.data.dataSets.forEach(function(set){
          let tempCheck = '';
          (JSUtilities.inArray(activeOptions,set.id)) ? tempCheck = 'checked' : tempCheck = '';
          datasetsHTML += `
          <span>
          <input type="checkbox" id="${set.id}" name="datasets" ${tempCheck}>
          <label class="layer-btn checkbox" data-id="${set.id}" for="${set.id}">${set.name}</label>
          </span>
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
              <h2>DEPARTMENTS & CATEGORIES</h2>
              <article>
                <input id="departments" type="text" list="departments-list" name="departments" value="All">
                <datalist id="departments-list">
                  <option value="All"></option>
                  <option value="Assessors"></option>
                  <option value="BSEED"></option>
                  <option value="Civil Rights"></option>
                  <option value="DAH"></option>
                  <option value="DBA/DLBA"></option>
                  <option value="DEGC"></option>
                  <option value="DDOT"></option>
                  <option value="DFD"></option>
                  <option value="DOIT"></option>
                  <option value="DPD"></option>
                  <option value="DPW"></option>
                  <option value="DWSD"></option>
                  <option value="GSD"></option>
                  <option value="Health"></option>
                  <option value="HRD"></option>
                  <option value=""></option>
                </datalist>
                <button id="department-btn">Filter</button>
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
          defaultDate: controller.defaultSettings.startDate,
          altInput: true,
          altFormat: "F j, Y",
          dateFormat: "Y-m-d",
          onChange: function(selectedDates){
            console.log(selectedDates);
            controller.defaultSettings.startDate = selectedDates;
          }
        });
        flatpickr('#end-date', {
          defaultDate: controller.defaultSettings.endDate,
          altInput: true,
          altFormat: "F j, Y",
          dateFormat: "Y-m-d",
          onChange: function(selectedDates){
            console.log(selectedDates);
            controller.defaultSettings.endDate = selectedDates;
          }
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
  buildChartData(data){
    let chartData = {};
    data.forEach(function(set){
      chartData[set.id] = {};
      set.data.forEach(function(item){
        if(set.id === "crime"){
          if(!chartData[set.id].hasOwnProperty(item.offense_category)){
            chartData[set.id][item.offense_category] = 1;
          }else{
            chartData[set.id][item.offense_category]++;
          }
        }else{
          if (!chartData[set.id].hasOwnProperty(item.calldescription)) {
            chartData[set.id][item.calldescription] = 1;
          }else{
            chartData[set.id][item.calldescription]++;
          }
        }
      });
    });
    console.log(chartData);
    return chartData;
  }
}
