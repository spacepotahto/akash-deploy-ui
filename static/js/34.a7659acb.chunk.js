(this["webpackJsonpakash-deploy-ui"]=this["webpackJsonpakash-deploy-ui"]||[]).push([[34],{831:function(e,n,t){!function(e){"use strict";var n="><+-.,[]".split("");e.defineMode("brainfuck",(function(){return{startState:function(){return{commentLine:!1,left:0,right:0,commentLoop:!1}},token:function(e,t){if(e.eatSpace())return null;e.sol()&&(t.commentLine=!1);var o=e.next().toString();return-1===n.indexOf(o)?(t.commentLine=!0,e.eol()&&(t.commentLine=!1),"comment"):!0===t.commentLine?(e.eol()&&(t.commentLine=!1),"comment"):"]"===o||"["===o?("["===o?t.left++:t.right++,"bracket"):"+"===o||"-"===o?"keyword":"<"===o||">"===o?"atom":"."===o||","===o?"def":void(e.eol()&&(t.commentLine=!1))}}})),e.defineMIME("text/x-brainfuck","brainfuck")}(t(82))}}]);
//# sourceMappingURL=34.a7659acb.chunk.js.map