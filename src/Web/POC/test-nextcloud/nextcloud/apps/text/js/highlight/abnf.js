(window.textWebpackJsonp=window.textWebpackJsonp||[]).push([[3],{385:function(s,e){s.exports=function(s){var e="^[a-zA-Z][a-zA-Z0-9-]*",a="[!@#$^&',?+~`|:]",n=s.COMMENT(";","$"),i={className:"attribute",begin:e+"(?=\\s*=)"};return{illegal:a,keywords:["ALPHA","BIT","CHAR","CR","CRLF","CTL","DIGIT","DQUOTE","HEXDIG","HTAB","LF","LWSP","OCTET","SP","VCHAR","WSP"].join(" "),contains:[i,n,{className:"symbol",begin:/%b[0-1]+(-[0-1]+|(\.[0-1]+)+){0,1}/},{className:"symbol",begin:/%d[0-9]+(-[0-9]+|(\.[0-9]+)+){0,1}/},{className:"symbol",begin:/%x[0-9A-F]+(-[0-9A-F]+|(\.[0-9A-F]+)+){0,1}/},{className:"symbol",begin:/%[si]/},s.QUOTE_STRING_MODE,s.NUMBER_MODE]}}}}]);
//# sourceMappingURL=abnf.js.map?v=29d3ed596517c96de327