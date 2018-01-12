'use strict';
export default class JSUtilities {
  constructor() {
  }
  static roundNumber(number, exp){
    return Math.round(number * Math.pow(10, exp))/Math.pow(10, exp);
  }
  static inArray(array, item){
    return (array.indexOf(item) != -1);
  }
  static inArrayByProperty(array, property, value){
    let result = false;
    for (var i = 0; i < array.length; i++) {
      if(array[i][property] === value){
        result = true;
        break;
      }
    }
    return result;
  }
  static dynamicColors() {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }
}
