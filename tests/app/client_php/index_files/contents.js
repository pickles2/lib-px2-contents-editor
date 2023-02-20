/*! For license information please see contents.js.LICENSE.txt */
(()=>{var t={2702:function(t,n,e){var r=e(4155);t.exports=function(){"use strict";function t(t){return"function"==typeof t||"object"==typeof t&&null!==t}function n(t){return"function"==typeof t}var i=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},o=0,s=void 0,u=void 0,c=function(t,n){b[o]=t,b[o+1]=n,2===(o+=2)&&(u?u(x):A())};function a(t){u=t}function f(t){c=t}var l="undefined"!=typeof window?window:void 0,h=l||{},p=h.MutationObserver||h.WebKitMutationObserver,d="undefined"==typeof self&&void 0!==r&&"[object process]"==={}.toString.call(r),v="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function m(){return function(){return r.nextTick(x)}}function g(){return function(){s(x)}}function _(){var t=0,n=new p(x),e=document.createTextNode("");return n.observe(e,{characterData:!0}),function(){e.data=t=++t%2}}function w(){var t=new MessageChannel;return t.port1.onmessage=x,function(){return t.port2.postMessage(0)}}function y(){var t=setTimeout;return function(){return t(x,1)}}var b=new Array(1e3);function x(){for(var t=0;t<o;t+=2)(0,b[t])(b[t+1]),b[t]=void 0,b[t+1]=void 0;o=0}function T(){try{var t=e(4327);return s=t.runOnLoop||t.runOnContext,g()}catch(t){return y()}}var A=void 0;function E(t,n){var e=arguments,r=this,i=new this.constructor(S);void 0===i[C]&&Z(i);var o,s=r._state;return s?(o=e[s-1],c((function(){return H(s,i,o,r._result)}))):K(r,i,t,n),i}function j(t){var n=this;if(t&&"object"==typeof t&&t.constructor===n)return t;var e=new n(S);return U(e,t),e}A=d?m():p?_():v?w():void 0===l?T():y();var C=Math.random().toString(36).substring(16);function S(){}var k=void 0,L=1,O=2,M=new W;function P(){return new TypeError("You cannot resolve a promise with itself")}function $(){return new TypeError("A promises callback cannot return that same promise.")}function F(t){try{return t.then}catch(t){return M.error=t,M}}function N(t,n,e,r){try{t.call(n,e,r)}catch(t){return t}}function Y(t,n,e){c((function(t){var r=!1,i=N(e,n,(function(e){r||(r=!0,n!==e?U(t,e):D(t,e))}),(function(n){r||(r=!0,I(t,n))}),"Settle: "+(t._label||" unknown promise"));!r&&i&&(r=!0,I(t,i))}),t)}function B(t,n){n._state===L?D(t,n._result):n._state===O?I(t,n._result):K(n,void 0,(function(n){return U(t,n)}),(function(n){return I(t,n)}))}function J(t,e,r){e.constructor===t.constructor&&r===E&&e.constructor.resolve===j?B(t,e):r===M?I(t,M.error):void 0===r?D(t,e):n(r)?Y(t,e,r):D(t,e)}function U(n,e){n===e?I(n,P()):t(e)?J(n,e,F(e)):D(n,e)}function z(t){t._onerror&&t._onerror(t._result),R(t)}function D(t,n){t._state===k&&(t._result=n,t._state=L,0!==t._subscribers.length&&c(R,t))}function I(t,n){t._state===k&&(t._state=O,t._result=n,c(z,t))}function K(t,n,e,r){var i=t._subscribers,o=i.length;t._onerror=null,i[o]=n,i[o+L]=e,i[o+O]=r,0===o&&t._state&&c(R,t)}function R(t){var n=t._subscribers,e=t._state;if(0!==n.length){for(var r=void 0,i=void 0,o=t._result,s=0;s<n.length;s+=3)r=n[s],i=n[s+e],r?H(e,r,i,o):i(o);t._subscribers.length=0}}function W(){this.error=null}var q=new W;function G(t,n){try{return t(n)}catch(t){return q.error=t,q}}function H(t,e,r,i){var o=n(r),s=void 0,u=void 0,c=void 0,a=void 0;if(o){if((s=G(r,i))===q?(a=!0,u=s.error,s=null):c=!0,e===s)return void I(e,$())}else s=i,c=!0;e._state!==k||(o&&c?U(e,s):a?I(e,u):t===L?D(e,s):t===O&&I(e,s))}function Q(t,n){try{n((function(n){U(t,n)}),(function(n){I(t,n)}))}catch(n){I(t,n)}}var V=0;function X(){return V++}function Z(t){t[C]=V++,t._state=void 0,t._result=void 0,t._subscribers=[]}function tt(t,n){this._instanceConstructor=t,this.promise=new t(S),this.promise[C]||Z(this.promise),i(n)?(this._input=n,this.length=n.length,this._remaining=n.length,this._result=new Array(this.length),0===this.length?D(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&D(this.promise,this._result))):I(this.promise,nt())}function nt(){return new Error("Array Methods must be provided an Array")}function et(t){return new tt(this,t).promise}function rt(t){var n=this;return i(t)?new n((function(e,r){for(var i=t.length,o=0;o<i;o++)n.resolve(t[o]).then(e,r)})):new n((function(t,n){return n(new TypeError("You must pass an array to race."))}))}function it(t){var n=new this(S);return I(n,t),n}function ot(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function st(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function ut(t){this[C]=X(),this._result=this._state=void 0,this._subscribers=[],S!==t&&("function"!=typeof t&&ot(),this instanceof ut?Q(this,t):st())}function ct(){var t=void 0;if(void 0!==e.g)t=e.g;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(t){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;if(n){var r=null;try{r=Object.prototype.toString.call(n.resolve())}catch(t){}if("[object Promise]"===r&&!n.cast)return}t.Promise=ut}return tt.prototype._enumerate=function(){for(var t=this.length,n=this._input,e=0;this._state===k&&e<t;e++)this._eachEntry(n[e],e)},tt.prototype._eachEntry=function(t,n){var e=this._instanceConstructor,r=e.resolve;if(r===j){var i=F(t);if(i===E&&t._state!==k)this._settledAt(t._state,n,t._result);else if("function"!=typeof i)this._remaining--,this._result[n]=t;else if(e===ut){var o=new e(S);J(o,t,i),this._willSettleAt(o,n)}else this._willSettleAt(new e((function(n){return n(t)})),n)}else this._willSettleAt(r(t),n)},tt.prototype._settledAt=function(t,n,e){var r=this.promise;r._state===k&&(this._remaining--,t===O?I(r,e):this._result[n]=e),0===this._remaining&&D(r,this._result)},tt.prototype._willSettleAt=function(t,n){var e=this;K(t,void 0,(function(t){return e._settledAt(L,n,t)}),(function(t){return e._settledAt(O,n,t)}))},ut.all=et,ut.race=rt,ut.resolve=j,ut.reject=it,ut._setScheduler=a,ut._setAsap=f,ut._asap=c,ut.prototype={constructor:ut,then:E,catch:function(t){return this.then(null,t)}},ct(),ut.polyfill=ct,ut.Promise=ut,ut}()},9844:(t,n,e)=>{!function(t){var n=e(2702).Promise;t.ary=function(t,e,r){return new function(t,e,r){for(var i in this.idx=-1,this.idxs=[],t)this.idxs.push(i);this.ary=t||[],this.fnc=e||function(){},this.fncComplete=r||function(){},this.next=function(){var t=this;return new n((function(t){t()})).then((function(){return new n((function(n,e){if(t.idx+1>=t.idxs.length)return t.fncComplete(),t;t.idx++,t.fnc(t,t.ary[t.idxs[t.idx]],t.idxs[t.idx])}))})),this},this.next()}(t,e,r)},t.fnc=function(t){var e="explicit",r=void 0;arguments.length>=2&&(e="implicit",r=arguments[0],t=arguments[arguments.length-1]);var i=new function(t){var e=0,r=t=t||[],i=!1;this.start=function(t){var e=this;return i||(i=!0,new n((function(t){t()})).then((function(){return new n((function(n,r){e.next(t)}))}))),this},this.next=function(t){var i=this;return t=t||{},r.length<=e||new n((function(t){t()})).then((function(){return new n((function(n,o){r[e++](i,t)}))})),this}}(t);return"implicit"==e?(i.start(r),i):i}}(n)},4155:t=>{var n,e,r=t.exports={};function i(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function s(t){if(n===setTimeout)return setTimeout(t,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(t,0);try{return n(t,0)}catch(e){try{return n.call(null,t,0)}catch(e){return n.call(this,t,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:i}catch(t){n=i}try{e="function"==typeof clearTimeout?clearTimeout:o}catch(t){e=o}}();var u,c=[],a=!1,f=-1;function l(){a&&u&&(a=!1,u.length?c=u.concat(c):f=-1,c.length&&h())}function h(){if(!a){var t=s(l);a=!0;for(var n=c.length;n;){for(u=c,c=[];++f<n;)u&&u[f].run();f=-1,n=c.length}u=null,a=!1,function(t){if(e===clearTimeout)return clearTimeout(t);if((e===o||!e)&&clearTimeout)return e=clearTimeout,clearTimeout(t);try{return e(t)}catch(n){try{return e.call(null,t)}catch(n){return e.call(this,t)}}}(t)}}function p(t,n){this.fun=t,this.array=n}function d(){}r.nextTick=function(t){var n=new Array(arguments.length-1);if(arguments.length>1)for(var e=1;e<arguments.length;e++)n[e-1]=arguments[e];c.push(new p(t,n)),1!==c.length||a||s(h)},p.prototype.run=function(){this.fun.apply(null,this.array)},r.title="browser",r.browser=!0,r.env={},r.argv=[],r.version="",r.versions={},r.on=d,r.addListener=d,r.once=d,r.off=d,r.removeListener=d,r.removeAllListeners=d,r.emit=d,r.prependListener=d,r.prependOnceListener=d,r.listeners=function(t){return[]},r.binding=function(t){throw new Error("process.binding is not supported")},r.cwd=function(){return"/"},r.chdir=function(t){throw new Error("process.chdir is not supported")},r.umask=function(){return 0}},4327:()=>{},5038:t=>{"use strict";t.exports=JSON.parse('{"origin":"http://127.0.0.1:8080","px2server":{"origin":"http://127.0.0.1:8081"}}')}},n={};function e(r){var i=n[r];if(void 0!==i)return i.exports;var o=n[r]={exports:{}};return t[r].call(o.exports,o,o.exports,e),o.exports}e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),(()=>{var t=e(9844);$(window).on("load",(function(){e(5038);var r=n(window.location.href),i=$("#canvas"),o=function(t){t=t||function(){},i.height($(window).height()-200),t()};t.fnc({},[function(n,e){$.ajax({url:"./apis.php",type:"get",data:{page_path:r.page_path,client_resources:1},error:function(t){console.error(t)},success:function(r){t.ary(r.css,(function(t,n,e){var r=document.createElement("link");r.addEventListener("load",(function(){t.next()})),$("head").append(r),r.rel="stylesheet",r.href="caches/"+n}),(function(){t.ary(r.js,(function(t,n,e){var r=document.createElement("script");r.addEventListener("load",(function(){t.next()})),$("head").append(r),r.src="caches/"+n}),(function(){n.next(e)}))}))}})},function(t,n){var e=new Pickles2ContentsEditor;o((function(){e.init({page_path:r.page_path,elmCanvas:i.get(0),preview:{origin:""},customFields:{custom1:function(t){}},lang:"ja",gpiBridge:function(t,n){console.info("=-=-=-=-=-=-=-= gpiBridge",t),$.ajax({url:"./apis.php",type:"post",data:{page_path:r.page_path,target_mode:r.target_mode,data:JSON.stringify(t)},error:function(t){console.error("-----",t),n(data)},success:function(t){console.log("-----",t),n(t)}})},complete:function(){alert("完了しました。")},onClickContentsLink:function(t,n){alert("編集: "+t)},onMessage:function(t){console.info("message: "+t)}},(function(){$(window).on("resize",(function(){o((function(){e.redraw()}))})),console.info("standby!!"),t.next(n)}))}))}])}));var n=function(t){var n=[];if(parameters=t.split("?"),parameters.length>1)for(var e=parameters[1].split("&"),r=0;r<e.length;r++){var i=e[r].split("=");for(var o in i)i[o]=decodeURIComponent(i[o]);n.push(i[0]),n[i[0]]=i[1]}return n}})()})();