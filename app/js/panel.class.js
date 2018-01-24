'use strict';
const moment = require('moment');
export default class Panel {
  constructor() {
    this.title = null;
  }
  createPanel(values, controller){
    console.log(values);
    let tempHTML = `<h2>${values[0].data.propstreetcombined}</h2><article class="badges">`;
    if(values[1].data){
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
    tempHTML += `</article>`;
    document.querySelector('.panel-information').innerHTML = tempHTML;
    document.getElementById('initial-loader-overlay').className = '';
    document.getElementById("map-side-panel").className = "active";
  }
}
