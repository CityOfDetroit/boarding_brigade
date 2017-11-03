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
    let breakException = {};
    let result = false;
    array.forEach(function(item){
      if(item[property] === value){
        result = true;
        throw breakException;
      }
    });
    return result;
  }
}
