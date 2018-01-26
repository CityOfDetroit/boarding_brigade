'use strict';
const moment = require('moment');
export default class Panel {
  constructor() {
    this.title = null;
    this.layer = null;
  }

  creatPanel(type, data, controller){
    console.log(type);
    console.log(data);
    console.log(controller.panel.layer);
    if(controller.panel.layer === null || controller.panel.layer === data.layer.id){
      if(typeof(data) != "object"){
        controller.panel.layer = type;
      }else{
        controller.panel.layer = data.layer.id;
      }
      switch (controller.panel.layer) {
        case "parcel-fill":
          let assessorsData = new Promise((resolve, reject) => {
            let url = "https://apis.detroitmi.gov/assessments/parcel/" + data + "/";
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "assessors-data", "data": data});
            });
          });
          let dteData = new Promise((resolve, reject) => {
            let url = "https://apis.detroitmi.gov/property_data/dte/active_connections/" + data + "/";
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "dte-data", "data": data});
            });
          });
          let permitData = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/but4-ky7y.json?parcel_no=" + data;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "permit-data", "data": data});
            });
          });
          let blightData = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/s7hj-n86v.json?parcelno=" + data;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "blight-data", "data": data});
            });
          });
          let salesHistoryData = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/9xku-658c.json?parcel_no=" + data;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "sales-data", "data": data});
            });
          });
          let demosData = new Promise((resolve, reject) => {
            let url = "https://data.detroitmi.gov/resource/uzpg-2pfj.json?parcel_id=" + data;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "demos-data", "data": data});
            });
          });
          Promise.all([assessorsData,dteData,permitData,blightData,salesHistoryData,demosData]).then(values => {
            console.log(values); //one, two
            let tempHTML = controller.panel.createMarkup(controller.panel.layer, values, controller);
            document.querySelector('#map-side-panel .panel-information').innerHTML = tempHTML;
            document.getElementById('initial-loader-overlay').className = '';
            document.getElementById("map-side-panel-small").className = "";
            document.getElementById("map-data-panel").className = "";
            document.getElementById("map-side-panel").className = "active";
            controller.panel.layer = null;
          }).catch(reason => {
            console.log(reason);
          });
          break;
        default:
          let tempHTML = controller.panel.createMarkup(controller.panel.layer, data, controller);
          document.querySelector('#map-side-panel-small .panel-information').innerHTML = tempHTML;
          document.getElementById('initial-loader-overlay').className = '';
          document.getElementById("map-side-panel").className = "";
          document.getElementById("map-data-panel").className = "";
          document.getElementById("map-side-panel-small").className = "active";
          controller.panel.layer = null;
      }
    }else{
      console.log("already active layer");
    }
  }
  createMarkup(type, values, controller){
    console.log(values);
    let tempHTML = '';
    switch (type) {
      case "parcel-fill":
        tempHTML += `<h2>${values[0].data.propstreetcombined}</h2><article class="badges">`;
        if(values[1].data.active){
          tempHTML += `<span class="active">DTE</span><span class="active">DWSW</span>`;
        }else{
          tempHTML += `<span class="inactive">DTE</span><span class="inactive">DWSW</span>`;
        }
        tempHTML += `</article>
        <article class="info-section section-owner">
          <span>OWNER</span>
          <p><strong>NAME:</strong> ${values[0].data.ownername1}</p>
          <p><strong>CITY:</strong> ${values[0].data.ownercity}</p>
          <p><strong>STATE:</strong> ${values[0].data.ownerstate}</p>
          <p><strong>ADDRESS:</strong> ${values[0].data.ownerstreetaddr}</p>
          <p><strong>ZIP:</strong> ${values[0].data.ownerzip}</p>
        </article>
        <article class="info-section section-property">
          <span>PROPERTY</span>
          <p><strong>PARCEL NUMBER:</strong> ${values[0].data.pnum}</p>
          <p><strong>YEAR BUILD:</strong> ${values[0].data.resb_yearbuilt}</p>
          <p><strong>CALCULATED VALUE:</strong> $${values[0].data.resb_value.toLocaleString()}</p>
          <p><strong>FLOOR AREA:</strong> ${values[0].data.resb_floorarea} SQFT</p>
          <p><strong>BASEMENT AREA:</strong>  ${values[0].data.resb_basementarea} SQFT</p>
          <p><strong>BUILDING CLASS:</strong> ${values[0].data.resb_bldgclass}</p>
          <p><strong>EXTERIOR:</strong> ${values[0].data.resb_exterior}</p>
          <p><strong>NUMBER OF FIREPLACES:</strong> ${values[0].data.resb_fireplaces}</p>
          <p><strong>GARAGE AREA:</strong> ${values[0].data.resb_garagearea} SQFT</p>
          <p><strong>NUMBER OF BEDROOMS:</strong> ${values[0].data.resb_nbed}</p>
        </article>
        <article class="info-section section-blight">
        <span>BLIGHT TICKETS</span>`;
        if(values[3].data.length){
          values[3].data.forEach(function(value){
            tempHTML += `
            <div class="">
              <p><strong>TICKET ID:</strong> ${value.ticket_id}</p>
              <p><strong>FINE AMOUNT:</strong> $${value.fine_amount}</p>
              <p><strong>AGENCY NAME:</strong> ${value.agency_name}</p>
              <p><strong>DISPOSITION:</strong> ${value.disposition}</p>
              <p><strong>DESCRIPTION:</strong> ${value.violation_description}</p>
              <p><strong>HEARING DATE:</strong> ${moment(value.hearing_date).format('MMM DD, YYYY')}</p>
              <p><strong>HEARING TIME:</strong> ${value.hearing_time}</p>
            </div>
            `;
          });
        }else{
          tempHTML += `
          <div class="">
            <p>NOT BLIGHT TICKETS</p>
          </div>`;
        }
        tempHTML += `</article>
        <article class="info-section section-sales">
        <span>PROPERTY SALES HISTORY</span>`;
        if(values[4].data.length){
          values[4].data.forEach(function(value){
            tempHTML += `
            <div class="">
              <p><strong>SALE ID:</strong> ${value.id}</p>
              <p><strong>SALE DATE:</strong> ${moment(value.sale_date).format('MMM DD, YYYY')}</p>
              <p><strong>SALE PRICE:</strong> $${value.sale_price}</p>
              <p><strong>SALE NUMBER:</strong> ${value.sale_number}</p>
              <p><strong>INSTRUMENT:</strong> ${value.instrument}</p>
              <p><strong>TERMS:</strong> ${value.terms}</p>
            </div>
            `;
          });
        }else{
          tempHTML += `
          <div class="">
            <p>NOT PROPERTY SALES HISTORY</p>
          </div>`;
        }
        tempHTML += `</article>
        <article class="info-section section-permits">
        <span>BUILDING PERMITS</span>`;
        if(values[2].data.length){
          values[2].data.forEach(function(value){
            tempHTML += `
            <div class="">
              <p><strong>PERMIT NUMBER:</strong> ${value.permit_no}</p>
              <p><strong>PERMIT TYPE:</strong> ${value.bld_permit_type}</p>
              <p><strong>PERMIT BUILDING TYPE:</strong> ${value.residential}</p>
              <p><strong>PERMIT STATUS:</strong> ${value.permit_status}</p>
              <p><strong>PERMIT ISSUED:</strong> ${moment(value.permit_issued).format('MMM DD, YYYY')}</p>
              <p><strong>PERMIT EXPIRED:</strong> ${moment(value.permit_expire).format('MMM DD, YYYY')}</p>
              <p><strong>PERMIT DESCRIPTION:</strong> ${value.bld_permit_desc}</p>
            </div>
            `;
          });
        }else{
          tempHTML += `
          <div class="">
            <p>NOT BUILDING PERMITS</p>
          </div>`;
        }
        tempHTML += `</article>
        <article class="info-section section-demos">
        <span>DEMOLITIONS</span>`;
        if(values[5].data.length){
          values[5].data.forEach(function(value){
            tempHTML += `
            <div class="">
              <p><strong>ADDRESS:</strong> ${value.address}</p>
              <p><strong>COMMERCIAL:</strong> ${value.commercial}</p>
              <p><strong>PRICE:</strong> $${value.price}</p>
              <p><strong>PARCEL:</strong> ${value.parcel_id}</p>
              <p><strong>CONTRACTOR:</strong> ${value.contractor_name}</p>
              <p><strong>COUNCIL DISTRICT:</strong> ${value.council_district}</p>
              <p><strong>NEIGHBORHOOD:</strong> ${value.neighborhood}</p>
              <p><strong>DATE:</strong> ${moment(value.demolition_date).format('MMM DD, YYYY')}</p>
            </div>
            `;
          });
        }else{
          tempHTML += `
          <div class="">
            <p>NO DEMOLITIONS</p>
          </div>`;
        }
        tempHTML += `</article>`;

        break;
      case "911":
        tempHTML += `
        <h2>911 - ${values.properties.incident_id}</h2>
        <article class="sub-box">
          <p><strong>CODE:</strong> ${values.properties.callcode}</p>
          <p><strong>CATEGORY:</strong> ${values.properties.category}</p>
          <p><strong>RESPONSE TIME:</strong> ${values.properties.totalresponsetime} min</p>
          <p><strong>TIME ON SCENE:</strong> ${values.properties.time_on_scene} min</p>
          <p><strong>PRIORITY:</strong> ${values.properties.priority}</p>
          <p><strong>RESPONDING UNIT:</strong> ${values.properties.respondingunit}</p>
          <p><strong>PRECINT/SCOUT CAR:</strong> ${values.properties.precinct_sca}</p>
          <p><strong>DESCRIPTION:</strong> ${values.properties.calldescription}</p>
          <p><strong>ADDRESS:</strong> ${values.properties.incident_address}</p>
          <p><strong>DATE:</strong> ${moment(values.properties.call_timestamp).format('MMM DD, YYYY')}</p>
          <p><strong>TIME:</strong> ${values.properties.time_of_call}</p>
          <p><strong>COUNCIL DISTRICT:</strong> ${values.properties.council_district}</p>
          <p><strong>NEIGHBORHOOD:</strong> ${values.properties.neighborhood}</p>
          <p><strong>BLOCK ID:</strong> ${values.properties.block_id}</p>
          <p><strong>OFFICER INITIATED:</strong> ${values.properties.officerinitiated}</p>
          <p><strong>ZIP CODE:</strong> ${values.properties.zip_code}</p>
        </article>
        `;
        break;
      case "demos":
        tempHTML += `
        <h2>${values.properties.address}</h2>
        <article class="sub-box">
          <p><strong>COMMERCIAL:</strong> ${values.properties.commercial}</p>
          <p><strong>PRICE:</strong> $${values.properties.price}</p>
          <p><strong>PARCEL:</strong> ${values.properties.parcel_id}</p>
          <p><strong>CONTRACTOR:</strong> ${values.properties.contractor_name}</p>
          <p><strong>COUNCIL DISTRICT:</strong> ${values.properties.council_district}</p>
          <p><strong>NEIGHBORHOOD:</strong> ${values.properties.neighborhood}</p>
          <p><strong>DATE:</strong> ${moment(values.properties.demolition_date).format('MMM DD, YYYY')}</p>
        </article>
        `;
        break;
      default:
        tempHTML += `
        <h2>COMING SOON</h2>
        `;
    }
    return tempHTML;
  }
}
