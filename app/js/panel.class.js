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
}
