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
  createView(view, data, panel){
    console.log(view);
    console.log(data);
    console.log(panel);
    panel.title = data.title;
    panel.currentView = view;
    panel.views[view] = data;
    switch (view) {
      case 'STAT':
        console.log('creating stats view');
        let tempHTML = `
          <article class="title">
            <h1>${panel.title}</h1>
          </article>
          <article class="highlights">
            <div class="item">
              <h2>${panel.views[view].boarded}<br><span>BOARDED</span></h2>
            </div>
            <div class="item">
              <h2>${panel.views[view].needBoarding}<br><span>NEED BOARDING</span></h2>
            </div>
          </article>
        `;
        document.querySelector('.panel-content').innerHTML = tempHTML;
        break;
      case 'LAYER':
        console.log('creating layers view');
        break;
      case 'SET':
        console.log('creating settings view');
        break;
      case 'FORM':
        console.log('creating forms view');
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
