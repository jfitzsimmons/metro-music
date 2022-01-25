//import { useState, useEffect } from "react";

export const debounce = (func:Function, delay:number) => {
    let debounceTimer:NodeJS.Timeout;
    return function (this:Function) {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(()=> func.apply(context,args),delay);
    }     
};
  
  