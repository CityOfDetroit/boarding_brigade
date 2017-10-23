'use strict';
export default class Panel {
  constructor() {
    this.title = "City of Detroit";
    this.currentView = "stats";
    this.views = {
      stats: {},
      layers: {},
      settings: {},
      forms: {}
    }
  }
  createView(view, data){
    switch (view) {
      case 'stats':
        console.log('creating stats view');
        let tempHTML = `
          <article class="title">
            <h1>${this.title}</h1>
          </article>
          <article class="highlights">
            <div class="item">
              <h2>${data.boarded}<br><span>BOARDED</span></h2>
            </div>
            <div class="item">
              <h2>${data.needBoarding}<br><span>NEED BOARDING</span></h2>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        break;
      case 'layers':
        console.log('creating layers view');
        break;
      case 'settings':
        console.log('creating settings view');
        break;
      case 'forms':
        console.log('creating forms view');
        break;
      default:
        console.log('invalid view reverting back');
    }
  }
}
