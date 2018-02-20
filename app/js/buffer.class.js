'use strict';
export default class Buffer {
  constructor() {
    this.settings = {
      active: false,
      size: 1,
      units: "miles",
      color: "#CF3234",
      opacity: 0.2
    };
  }
  editBuffer(controller){
    document.querySelector('#buffer-panel').className = "active";
  }
  addBuffer(controller){
    console.log(controller.map.drawTool.getAll());
    let polygon = controller.map.drawTool.getAll();
    let buffer = turf.buffer(polygon.features[0], 1, {units: 'miles'});
    console.log(buffer);
    let tempNewLayer = null;
    if(controller.map.map.getSource("buffer")){
      controller.map.map.getSource("buffer").setData(buffer);
      tempNewLayer = {
          "id": "buffer",
          "type": "fill",
          "source": "buffer",
          "layout": {
          },
          "paint": {
               "fill-color":"#CF3234",
               "fill-opacity":0.2
          },
          "event": true
       };
    }else{
      console.log("no source found");
      let sources = [{
        "id": "buffer",
        "type": "geojson",
        "data": buffer
      }];
      controller.map.addSources(sources, controller);
      tempNewLayer = {
        "id": "buffer",
        "type": "fill",
        "source": "buffer",
        "layout": {
        },
        "paint": {
             "fill-color":"#CF3234",
             "fill-opacity":0.5
        },
        "event": true
      };
    }
    controller.map.addLayers([tempNewLayer], controller);
    controller.activeLayers.push("buffer");
  }
  deleteBuffer(controller){
    if(controller.map.map.getLayer(id)){
      console.log('removing layer');
      let newActiveLayers = [];
      controller.activeLayers.forEach(function(layer){
        if(layer != id){newActiveLayers.push(layer);}
      });
      controller.activeLayers = newActiveLayers;
      controller.map.removeLayer(id, controller);
      // console.log(controller.map.currentState);
      let tempColors = document.querySelectorAll('#legend .color span');
      let tempLegend = document.querySelectorAll('#legend .text label');
      let newTempColors = "";
      let newTempLegend = "";
      console.log(tempColors);
      console.log(tempLegend);
      tempColors.forEach(function(color){
        (color.getAttribute('data-id') != id) ? newTempColors += `<span data-id="${color.getAttribute('data-id')}" data-color="${color.getAttribute('data-color')}" style="background: ${color.getAttribute('data-color')}"></span>` : 0;
      });
      tempLegend.forEach(function(legend){
        (legend.getAttribute('data-id') != id) ? newTempLegend += `<label data-id="${legend.getAttribute('data-id')}">${legend.getAttribute('data-id')}</label>`: 0;
      });
      console.log(newTempColors);
      console.log(newTempLegend);
      document.querySelector('#legend .text').innerHTML = newTempLegend;
      document.querySelector('#legend .color').innerHTML = newTempColors;
    }else{
      console.log('layer does not exist');
    }
  }
}
