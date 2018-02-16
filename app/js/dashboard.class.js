'use strict';
import flatpickr from "flatpickr";
import JSUtilities from './utilities.class.js';
import Chart from 'chart.js';
const moment = require('moment');
export default class Dashboard {
  constructor() {
    this.title = null;
    this.currentView = null;
    this.views = {
      DASH: {},
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
      (data.dataSets.length > 3) ? markUp += `<article class="highlights lots">` : markUp += `<article class="highlights">`;
      data.dataSets.forEach(function(data){
        markUp += `
        <div class="item link" data-id="${data.id}">
          <h2>${data.numbers}<br><span>${data.name}</span></h2>
        </div>`;
      });
      markUp += `
        <div class="item link" data-id="add-data-set">
          <h2><img class="light" src="img/add-light.png" alt="add dataset"><img class="dark" src="img/add-dark.png" alt="add dataset"></img><span>ADD DATASET</span></h2>
        </div>
      </article>`;
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
                    <li><a href="#"><span>2</span><span class="breadcrumb-title">${data.title}</span></a></li>`;
    }
    return [markUp, breadcrumbs];
  }
  createView(view, data, controller){
    if(data != null){
      (data.title) ? controller.dashboard.title = data.title : 0;
      controller.dashboard.currentView = view;
      controller.dashboard.views[view] = data;
    }else{
      console.log('No data');
    }
    let tempHTML = '';
    switch (view) {
      case 'DASH':
        // console.log('creating stats view');
        let chartingItems = [];
        let tempMarkup = this.createStats(view, data);
        tempHTML = `
          <article class="title">
            <h1>${controller.dashboard.title}</h1>
          </article>
          ${tempMarkup[0]}
        `;
        // NOTE: removing breadcrumbs
        // <section class="breadcrumbs">
        //   <article class="inner">
        //     <ul class="cf">
        //       ${tempMarkup[1]}
        //     </ul>
        //   </article>
        // </section>
        // NOTE: removing charting for now
        // data.dataSets.forEach(function(set){
        //   switch (true) {
        //     case set.id === "911":
        //       chartingItems.push(set);
        //       break;
        //     case set.id === "crime":
        //       chartingItems.push(set);
        //       break;
        //     default:
        //
        //   }
        // });
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
          let rawChartData = controller.dashboard.buildChartData(chartingItems);
          let cleanChartData = {};
          for(let chart in rawChartData){
            cleanChartData[chart] = {"labels":[],"data":[],"color":[]};
            for(let value in rawChartData[chart]){
              cleanChartData[chart].labels.push(value);
              cleanChartData[chart].data.push(rawChartData[chart][value]);
              cleanChartData[chart].color.push(JSUtilities.dynamicColors());
            }
          }
          console.log(cleanChartData);
          for (var chart in cleanChartData) {
            console.log(chart);
            console.log(cleanChartData[chart]);
            controller.dashboard.ctx[chart] = document.getElementById(chart + "-chart");
            controller.dashboard.charts[chart] = new Chart(controller.dashboard.ctx[chart], {
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
                              fontColor: "#004544"
                          },
                          gridLines: {
                            color: 'rgba(0,69,68,.25)'
                          }
                      }],
                      xAxes: [{
                          ticks: {
                              fontColor: "#004544"
                          },
                          gridLines: {
                            color: 'rgba(0,69,68,.25)'
                          }
                      }]
                  }
                }
             });
          }
        }else{
          document.querySelector('.panel-content').innerHTML = tempHTML;
        }
        let dashItems = document.querySelectorAll("nav .item.link");
        dashItems.forEach(function(item){
          item.addEventListener('click', function(e){
            controller.loadDatasetView(e, controller);
          });
        });
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
            <h1>${controller.dashboard.title}</h1>
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
              }else{DASH
                console.log('switching active radio');
                controller.boundaryAddRemove(ev.target.attributes[1].nodeValue, controller);
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
  loadPropertyView(controller){
    console.log("loading property view");
    let tempHTML = `
    <article id="view-map-btn"><span>VIEW ON MAP</span> <img src="img/map-view.png" alt="map"></article>
    <article class="sec-title property"><h2>PROPERTY LOOKUP <span><img src="img/property-green.png" alt="property search"></img></span></h2></article>
    <article id="property-search"></article>`;
    document.querySelector('.panel-content').className = "panel-content details";
    document.querySelector('.panel-content').innerHTML = tempHTML;
    document.getElementById('initial-loader-overlay').className = '';
  }
  buildSetView(set, controller){
    console.log(set);
    console.log(controller.dataBank[set]);
    switch (set) {
      case "911":
        controller.layerAddRemove("911",'add',controller);
        document.getElementById('911').checked = true;
        document.getElementById('911').disabled = true;
        document.getElementById('911').parentElement.className = "active";
        let categories = [];
        let categoriesData = {};
        let priorities = [];
        let prioritiesData = {};
        let district = [];
        let districtData = {};
        controller.dataBank[set].features.forEach(function(item){
          if(categories.includes(item.properties.calldescription)){
            categoriesData[item.properties.calldescription].count++;
            if(item.properties.totalresponsetime != null) {
              categoriesData[item.properties.calldescription].responseTimeSum += parseFloat(item.properties.totalresponsetime)
            }
            categoriesData[item.properties.calldescription].data.push(item);
          }else{
            categories.push(item.properties.calldescription);
            categoriesData[item.properties.calldescription] = {name: item.properties.calldescription, priority: item.properties.priority,  data: [item], count: 1};
            if(item.properties.totalresponsetime != null) {
              categoriesData[item.properties.calldescription].responseTimeSum = parseFloat(item.properties.totalresponsetime);
            }
          }
          if(priorities.includes(item.properties.priority)){
            prioritiesData[item.properties.priority].count++;
            if(item.properties.totalresponsetime != null) {
              prioritiesData[item.properties.priority].responseTimeSum += parseFloat(item.properties.totalresponsetime);
            }
            prioritiesData[item.properties.priority].data.push(item);
          }else{
            priorities.push(item.properties.priority);
            prioritiesData[item.properties.priority] = {priority: item.properties.priority, data: [item], count: 1, responseTimeSum: 0};
            if(item.properties.totalresponsetime != null) {
              prioritiesData[item.properties.priority].responseTimeSum = parseFloat(item.properties.totalresponsetime);
            }
          }
          if(district.includes(item.properties.council_district)){
            districtData[item.properties.council_district].count++;
            if(item.properties.totalresponsetime != null) {
              districtData[item.properties.council_district].responseTimeSum += parseFloat(item.properties.totalresponsetime);
            }
            districtData[item.properties.council_district].data.push(item);
          }else{
            district.push(item.properties.council_district);
            districtData[item.properties.council_district] = {district: item.properties.council_district, data: [item], count: 1, responseTimeSum: 0};
            if(item.properties.totalresponsetime != null) {
              districtData[item.properties.council_district].responseTimeSum = parseFloat(item.properties.totalresponsetime);
            }
          }
          // debugger;
        });
        console.log(categories);
        console.log(categoriesData);
        console.log(priorities);
        console.log(prioritiesData);
        console.log(district);
        console.log(districtData);
        let topSets1 = [];
        let topSets2 = [];
        let topSets3 = [];
        let topSets4 = [];
        let topSets5 = [];
        let checker1 = true;
        let checker2 = true;
        let checker3 = true;
        let checker4 = true;
        let checker5 = true;
        for (var cat in categoriesData) {
          checker1 = true;
          checker2 = true;
          checker3 = true;
          checker4 = true;
          checker5 = true;
          switch (categoriesData[cat].priority) {
            case "1":
              if(topSets1.length < 2){
                topSets1.push(categoriesData[cat]);
              }else{
                for (var i = 0; i < topSets1.length; i++) {
                  if(topSets1[i].count < categoriesData[cat].count){
                    if(checker1){
                      topSets1[i] = categoriesData[cat];
                      checker1 = false;
                    }
                  }
                }
              }
              break;
            case "2":
              if(topSets2.length < 2){
                topSets2.push(categoriesData[cat]);
              }else{
                for (var i = 0; i < topSets2.length; i++) {
                  if(topSets2[i].count < categoriesData[cat].count){
                    if(checker2){
                      topSets2[i] = categoriesData[cat];
                      checker2 = false;
                    }
                  }
                }
              }
              break;
            case "3":
              if(topSets3.length < 2){
                topSets3.push(categoriesData[cat]);
              }else{
                for (var i = 0; i < topSets3.length; i++) {
                  if(topSets3[i].count < categoriesData[cat].count){
                    if(checker3){
                      topSets3[i] = categoriesData[cat];
                      checker3 = false;
                    }
                  }
                }
              }
              break;
            case "4":
              if(topSets4.length < 2){
                topSets4.push(categoriesData[cat]);
              }else{
                for (var i = 0; i < topSets4.length; i++) {
                  if(topSets4[i].count < categoriesData[cat].count){
                    if(checker4){
                      topSets4[i] = categoriesData[cat];
                      checker4 = false;
                    }
                  }
                }
              }
              break;
            case "5":
              if(topSets5.length < 2){
                topSets5.push(categoriesData[cat]);
              }else{
                for (var i = 0; i < topSets5.length; i++) {
                  if(topSets5[i].count < categoriesData[cat].count){
                    if(checker5){
                      topSets5[i] = categoriesData[cat];
                      checker5 = false;
                    }
                  }
                }
              }
              break;
            default:

          }
        }
        let cityResponseTime = Math.round(((prioritiesData[1].responseTimeSum + prioritiesData[2].responseTimeSum + prioritiesData[3].responseTimeSum + prioritiesData[4].responseTimeSum + prioritiesData[5].responseTimeSum) / controller.dataBank[set].features.length) * 100)*.01;
        let rtime1 = Math.round((prioritiesData[1].responseTimeSum / prioritiesData[1].count) * 100)*.01;
        let rtime2 = Math.round((prioritiesData[2].responseTimeSum / prioritiesData[2].count) * 100)*.01;
        let rtime3 = Math.round((prioritiesData[3].responseTimeSum / prioritiesData[3].count) * 100)*.01;
        let rtime4 = Math.round((prioritiesData[4].responseTimeSum / prioritiesData[4].count) * 100)*.01;
        let rtime5 = Math.round((prioritiesData[5].responseTimeSum / prioritiesData[5].count) * 100)*.01;
        let tempHTML = `
        <article id="view-map-btn"><span>VIEW MAP</span> <img src="img/map-view.png" alt="map"></article>
        <section class="breadcrumbs">
          <article class="inner">
            <ul class="cf">
              <li><a href="#"><span>1</span><span class="breadcrumb-title">Home</span></a></li>
              <li><a href="#" class="active"><span>2</span><span class="breadcrumb-title">911 CALLS</span></a></li>
            </ul>
          </article>
        </section>
        <article class="sec-title"><h2>TOP FIVE 911 CALLS BY PRIORITY</h2></article>
        <article class="highlights lots">`;
        tempHTML  += `
        <div class="item parent-item">
          <h2>${controller.dataBank[set].features.length.toLocaleString()}<br><span>total 911 calls<br><u>avg. response time</u><br>${cityResponseTime} min</span></h2>
        </div>
        <div class="item">
          <h2>${topSets1[0].count.toLocaleString()}<br><span>${topSets1[0].name}<br><u>avg. response time</u><br>${rtime1} min</span></h2>
        </div>
        <div class="item">
          <h2>${topSets2[0].count.toLocaleString()}<br><span>${topSets2[0].name}<br><u>avg. response time</u><br>${rtime2} min</span></h2>
        </div>
        <div class="item">
          <h2>${topSets3[0].count.toLocaleString()}<br><span>${topSets3[0].name}<br><u>avg. response time</u><br>${rtime3} min</span></h2>
        </div>
        <div class="item">
          <h2>${topSets4[0].count.toLocaleString()}<br><span>${topSets4[0].name}<br><u>avg. response time</u><br>${rtime4} min</span></h2>
        </div>
        <div class="item">
          <h2>${topSets5[0].count.toLocaleString()}<br><span>${topSets5[0].name}<br><u>avg. response time</u><br>${rtime5} min</span></h2>
        </div>`;
        tempHTML += `</article>`;
        document.querySelector('.panel-content').className = "panel-content details";

        tempHTML += `<article class="chart-section">
        <div>
          <h2>RESPONSE TIMES BY PRIORITY</h2>
          <canvas id="911-chart" width="400" height="250"></canvas>
        </div>
        <div>
          <h2>REPSONSE TIME BY COUNCIL DIST.</h2>
          <canvas id="council-911-chart" width="400" height="250"></canvas>
        </div>
        </article>`;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        document.getElementById('view-map-btn').addEventListener('click', function(){
          document.querySelector('.tab-btn.active').className = "tab-btn";
          document.querySelector('.tab-btn[data-view="map"]').className = "tab-btn active";
          controller.createPanelData("MAP", controller);
        });
        controller.dashboard.ctx['911'] = document.getElementById("911-chart");
        controller.dashboard.charts['911'] = new Chart(controller.dashboard.ctx["911"], {
            type: 'bar',
            data: {
                labels: ["PRIORITY 1", "PRIORITY 2", "PRIORITY 3", "PRIORITY 4", "PRIORITY 5"],
                datasets: [{
                    data: [ Math.round((prioritiesData[1].responseTimeSum/prioritiesData[1].count)* 100)*.01, Math.round((prioritiesData[2].responseTimeSum/prioritiesData[2].count)* 100)*.01, Math.round((prioritiesData[3].responseTimeSum/prioritiesData[3].count)* 100)*.01, Math.round((prioritiesData[4].responseTimeSum/prioritiesData[4].count)* 100)*.01, Math.round((prioritiesData[5].responseTimeSum/prioritiesData[5].count)* 100)*.01],
                    backgroundColor: "#9fd5b3",
                    borderColor: "#9fd5b3"
                }]
            },
            options: {
              legend: {
                  display: false
              },
              yAxisID: "Min",
              scales: {
                  yAxes: [{
                      ticks: {
                          fontColor: "#004544"
                      },
                      gridLines: {
                        color: 'rgba(0,69,68,.25)'
                      }
                  }],
                  xAxes: [{
                      ticks: {
                          fontColor: "#004544"
                      },
                      gridLines: {
                        color: 'rgba(0,69,68,.25)'
                      }
                  }]
              }
            }
         });
         controller.dashboard.ctx['council-911'] = document.getElementById("council-911-chart");
         controller.dashboard.charts['council-911'] = new Chart(controller.dashboard.ctx["council-911"], {
             type: 'bar',
             data: {
                 labels: ["DISTRICT 1", "DISTRICT 2", "DISTRICT 3", "DISTRICT 4", "DISTRICT 5", "DISTRICT 6", "DISTRICT 7"],
                 datasets: [{
                     data: [ Math.round((districtData[1].responseTimeSum/districtData[1].count)* 100)*.01, Math.round((districtData[2].responseTimeSum/districtData[2].count)* 100)*.01, Math.round((districtData[3].responseTimeSum/districtData[3].count)* 100)*.01, Math.round((districtData[4].responseTimeSum/districtData[4].count)* 100)*.01, Math.round((districtData[5].responseTimeSum/districtData[5].count)* 100)*.01, Math.round((districtData[6].responseTimeSum/districtData[6].count)* 100)*.01, Math.round((districtData[7].responseTimeSum/districtData[7].count)* 100)*.01 ],
                     backgroundColor: "#9fd5b3",
                     borderColor: "#9fd5b3"
                 }]
             },
             options: {
               legend: {
                   display: false
               },
               scales: {
                   yAxes: [{
                       ticks: {
                           fontColor: "#004544"
                       },
                       gridLines: {
                         color: 'rgba(0,69,68,.25)'
                       }
                   }],
                   xAxes: [{
                       ticks: {
                           fontColor: "#004544"
                       },
                       gridLines: {
                         color: 'rgba(0,69,68,.25)'
                       }
                   }]
               }
             }
          });
        break;
      default:

    }
  }
}
