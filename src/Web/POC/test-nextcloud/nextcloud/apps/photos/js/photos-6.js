(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{237:function(n,t,e){function r(n){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(n)}
/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */var i=e(307),a=i.prepareRequestOptions;i.prepareRequestOptions=function(n,t){t.cancelToken&&"object"===r(t.cancelToken)&&(n.cancelToken=t.cancelToken),a(n,t),t.method&&"string"==typeof t.method&&(n.method=t.method)},n.exports=i},263:function(n,t,e){"use strict";var r=e(306),i=e.n(r),a=e(61),o=e.n(a),c=e(297),s=e.n(c),d=e(13);i.a.getPatcher().patch("request",o.a);var l=Object(d.generateRemoteUrl)("dav"),u=i.a.createClient(l);s()(l).pathname;t.a=u},273:function(n,t,e){"use strict";var r=e(94),i=e.n(r)()(!0);i.push([n.i,".file[data-v-72c8239b],.folder[data-v-72c8239b]{position:relative;display:flex;align-items:center;justify-content:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-radius:var(--border-radius);overflow:hidden}.file .cover[data-v-72c8239b],.folder .cover[data-v-72c8239b]{z-index:2;width:100%;padding-bottom:100%;transition:opacity var(--animation-quick) ease-in-out;opacity:0;background-color:var(--color-main-text)}.file.active .cover[data-v-72c8239b],.file:active .cover[data-v-72c8239b],.file:hover .cover[data-v-72c8239b],.file:focus .cover[data-v-72c8239b],.folder.active .cover[data-v-72c8239b],.folder:active .cover[data-v-72c8239b],.folder:hover .cover[data-v-72c8239b],.folder:focus .cover[data-v-72c8239b]{opacity:.3}.file--clear.active .cover[data-v-72c8239b],.file--clear:active .cover[data-v-72c8239b],.file--clear:hover .cover[data-v-72c8239b],.file--clear:focus .cover[data-v-72c8239b],.folder--clear.active .cover[data-v-72c8239b],.folder--clear:active .cover[data-v-72c8239b],.folder--clear:hover .cover[data-v-72c8239b],.folder--clear:focus .cover[data-v-72c8239b]{opacity:.1}.fade-enter-active[data-v-72c8239b],.fade-leave-active[data-v-72c8239b]{transition:opacity var(--animation-quick) ease-in-out}.fade-enter[data-v-72c8239b],.fade-leave-to[data-v-72c8239b]{opacity:0}.folder-content[data-v-72c8239b]{position:absolute;display:grid;width:100%;height:100%}.folder-content--grid-1[data-v-72c8239b]{grid-template-columns:1fr;grid-template-rows:1fr}.folder-content--grid-2[data-v-72c8239b]{grid-template-columns:1fr;grid-template-rows:1fr 1fr}.folder-content--grid-3[data-v-72c8239b]{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}.folder-content--grid-3 img[data-v-72c8239b]:first-child{grid-column:span 2}.folder-content--grid-4[data-v-72c8239b]{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}.folder-content img[data-v-72c8239b]{width:100%;height:100%;-o-object-fit:cover;object-fit:cover}.folder-name[data-v-72c8239b]{position:absolute;z-index:3;display:flex;overflow:hidden;flex-direction:column;width:100%;height:100%;transition:opacity var(--animation-quick) ease-in-out;opacity:1}.folder-name__icon[data-v-72c8239b]{height:40%;margin-top:calc(30% - 1rem / 2);background-size:40%}.folder-name__name[data-v-72c8239b]{overflow:hidden;height:1rem;padding:0 10px;text-align:center;white-space:nowrap;text-overflow:ellipsis;color:var(--color-main-background);text-shadow:0 0 8px var(--color-main-text);font-size:1rem;line-height:1rem}.folder--clear .folder-name__icon[data-v-72c8239b]{opacity:.3}.folder--clear .folder-name__name[data-v-72c8239b]{color:var(--color-main-text);text-shadow:0 0 8px var(--color-main-background)}.folder:not(.folder--clear) .cover[data-v-72c8239b]{opacity:.3}.folder:not(.folder--clear):active .folder-name[data-v-72c8239b],.folder:not(.folder--clear):active .cover[data-v-72c8239b],.folder:not(.folder--clear):hover .folder-name[data-v-72c8239b],.folder:not(.folder--clear):hover .cover[data-v-72c8239b],.folder:not(.folder--clear):focus .folder-name[data-v-72c8239b],.folder:not(.folder--clear):focus .cover[data-v-72c8239b]{opacity:0}\n","",{version:3,sources:["webpack://src/mixins/FileFolder.scss","webpack://src/components/FolderTagPreview.vue"],names:[],mappings:"AAsBA,gDAEC,iBAAkB,CAClB,YAAa,CACb,kBAAmB,CACnB,sBAAuB,CACvB,wBAAiB,CAAjB,qBAAiB,CAAjB,oBAAiB,CAAjB,gBAAiB,CACjB,kCAAmC,CACnC,eAAgB,CARjB,8DAWE,SAAU,CAMV,UAAW,CACX,mBAAoB,CACpB,qDAAsD,CACtD,SAAU,CACV,uCAAwC,CArB1C,4SA6BG,UAAW,CACX,oWAQA,UAAW,CACX,wEAKF,qDAAsD,CACtD,6DAGA,SAAU,CCgFX,iCACC,iBAAkB,CAClB,YAAa,CACb,UAAW,CACX,WAAY,CAEZ,yCACC,yBAA0B,CAC1B,sBAAuB,CACvB,yCAEA,yBAA0B,CAC1B,0BAA2B,CAC3B,yCAEA,6BAA8B,CAC9B,0BAA2B,CAF3B,yDAIC,kBAAmB,CACnB,yCAGD,6BAA8B,CAC9B,0BAA2B,CAvB7B,qCA0BE,UAAW,CACX,WAAY,CAEZ,mBAAY,CAAZ,gBAAiB,CACjB,8BAMD,iBAAkB,CAClB,SAAU,CACV,YAAa,CACb,eAAgB,CAChB,qBAAsB,CACtB,UAAW,CACX,WAAY,CACZ,qDAAsD,CACtD,SAAU,CACV,oCACC,UAAW,CACX,+BAA2C,CAC3C,mBAAoB,CACpB,oCAEA,eAAgB,CAChB,WAnBgB,CAoBhB,cAAe,CACf,iBAAkB,CAClB,kBAAmB,CACnB,sBAAuB,CACvB,kCAAmC,CACnC,0CAA2C,CAC3C,cA1BgB,CA2BhB,gBA3BgB,CA4BhB,mDAQC,UAAW,CAFZ,mDAKC,4BAA6B,CAC7B,gDAAiD,CARpD,oDAiBG,UAAW,CAjBd,gXA2BI,SAAU",sourcesContent:["/**\n * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>\n *\n * @author John Molakvoæ <skjnldsv@protonmail.com>\n *\n * @license GNU AGPL version 3 or any later version\n *\n * This program is free software: you can redistribute it and/or modify\n * it under the terms of the GNU Affero General Public License as\n * published by the Free Software Foundation, either version 3 of the\n * License, or (at your option) any later version.\n *\n * This program is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n * GNU Affero General Public License for more details.\n *\n * You should have received a copy of the GNU Affero General Public License\n * along with this program. If not, see <http://www.gnu.org/licenses/>.\n *\n */\n\n.file,\n.folder {\n\tposition: relative;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\tuser-select: none;\n\tborder-radius: var(--border-radius);\n\toverflow: hidden;\n\n\t.cover {\n\t\tz-index: 2;\n\t\t// We want nice squares despite anything that is in it.\n\t\t// The .cover is what makes the exact square size of the grid.\n\t\t// We use padding-bottom because padding with percentage\n\t\t// always refers to the width. And we only want to fit\n\t\t// the css grid's width.\n\t\twidth: 100%;\n\t\tpadding-bottom: 100%;\n\t\ttransition: opacity var(--animation-quick) ease-in-out;\n\t\topacity: 0;\n\t\tbackground-color: var(--color-main-text);\n\t}\n\n\t&.active,\n\t&:active,\n\t&:hover,\n\t&:focus {\n\t\t.cover {\n\t\t\topacity: .3;\n\t\t}\n\t}\n\n\t&--clear.active,\n\t&--clear:active,\n\t&--clear:hover,\n\t&--clear:focus {\n\t\t.cover {\n\t\t\topacity: .1;\n\t\t}\n\t}\n}\n\n.fade-enter-active, .fade-leave-active {\n\ttransition: opacity var(--animation-quick) ease-in-out;\n}\n\n.fade-enter, .fade-leave-to {\n\topacity: 0;\n}\n","\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n@import '../mixins/FileFolder.scss';\n\n.folder-content {\n\tposition: absolute;\n\tdisplay: grid;\n\twidth: 100%;\n\theight: 100%;\n\t// folder layout if less than 4 pictures\n\t&--grid-1 {\n\t\tgrid-template-columns: 1fr;\n\t\tgrid-template-rows: 1fr;\n\t}\n\t&--grid-2 {\n\t\tgrid-template-columns: 1fr;\n\t\tgrid-template-rows: 1fr 1fr;\n\t}\n\t&--grid-3 {\n\t\tgrid-template-columns: 1fr 1fr;\n\t\tgrid-template-rows: 1fr 1fr;\n\t\timg:first-child {\n\t\t\tgrid-column: span 2;\n\t\t}\n\t}\n\t&--grid-4 {\n\t\tgrid-template-columns: 1fr 1fr;\n\t\tgrid-template-rows: 1fr 1fr;\n\t}\n\timg {\n\t\twidth: 100%;\n\t\theight: 100%;\n\n\t\tobject-fit: cover;\n\t}\n}\n\n$name-height: 1rem;\n\n.folder-name {\n\tposition: absolute;\n\tz-index: 3;\n\tdisplay: flex;\n\toverflow: hidden;\n\tflex-direction: column;\n\twidth: 100%;\n\theight: 100%;\n\ttransition: opacity var(--animation-quick) ease-in-out;\n\topacity: 1;\n\t&__icon {\n\t\theight: 40%;\n\t\tmargin-top: calc(30% - #{$name-height} / 2); // center name+icon\n\t\tbackground-size: 40%;\n\t}\n\t&__name {\n\t\toverflow: hidden;\n\t\theight: $name-height;\n\t\tpadding: 0 10px;\n\t\ttext-align: center;\n\t\twhite-space: nowrap;\n\t\ttext-overflow: ellipsis;\n\t\tcolor: var(--color-main-background);\n\t\ttext-shadow: 0 0 8px var(--color-main-text);\n\t\tfont-size: $name-height;\n\t\tline-height: $name-height;\n\t}\n}\n\n// Cover management empty/full\n.folder {\n\t// if no img, let's display the folder icon as default black\n\t&--clear {\n\t\t.folder-name__icon {\n\t\t\topacity: .3;\n\t\t}\n\t\t.folder-name__name {\n\t\t\tcolor: var(--color-main-text);\n\t\t\ttext-shadow: 0 0 8px var(--color-main-background);\n\t\t}\n\t}\n\n\t// show the cover as background\n\t// if  there are pictures in it\n\t// so we can sho the folder+name above it\n\t&:not(.folder--clear) {\n\t\t.cover {\n\t\t\topacity: .3;\n\t\t}\n\n\t\t// hide everything but pictures\n\t\t// on hover/active/focus\n\t\t&:active,\n\t\t&:hover,\n\t\t&:focus {\n\t\t\t.folder-name,\n\t\t\t.cover {\n\t\t\t\topacity: 0;\n\t\t\t}\n\t\t}\n\t}\n}\n\n"],sourceRoot:""}]),t.a=i},299:function(n,t,e){"use strict";e.d(t,"a",(function(){return r}));
/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
var r="\n\t<oc:fileid />\n\t<d:getlastmodified />\n\t<d:getetag />\n\t<d:getcontenttype />\n\t<d:getcontentlength />\n\t<nc:has-preview />\n\t<oc:favorite />\n\t<d:resourcetype />";'<?xml version="1.0"?>\n\t\t\t<d:propfind xmlns:d="DAV:"\n\t\t\t\txmlns:oc="http://owncloud.org/ns"\n\t\t\t\txmlns:nc="http://nextcloud.org/ns"\n\t\t\t\txmlns:ocs="http://open-collaboration-services.org/ns">\n\t\t\t\t<d:prop>\n\t\t\t\t\t'.concat(r,"\n\t\t\t\t</d:prop>\n\t\t\t</d:propfind>")},303:function(n,e,r){"use strict";var i=r(13),a={name:"FolderTagPreview",props:{icon:{type:String,default:"icon-folder"},id:{type:Number,required:!0},name:{type:String,required:!0},path:{type:String,required:!0},fileList:{type:Array,default:function(){return[]}}},data:function(){return{loaded:!1,failed:[]}},computed:{isEmpty:function(){return 0===this.previewList.length},ariaUuid:function(){return"folder-".concat(this.id)},ariaLabel:function(){return t("photos",'Open the "{name}" sub-directory',{name:this.name})},previewList:function(){var n=this;return this.fileList.filter((function(t){return-1===n.failed.indexOf(t.fileid)}))},to:function(){var n=/^\/?(.+)/i.exec(this.path)[1];return Object.assign({},this.$route,{params:{path:n.split("/")}})}},methods:{generateImgSrc:function(n){var t=n.fileid,e=n.etag;return Object(i.generateUrl)("/core/preview?fileId=".concat(t,"&x=",256,"&y=",256,"&a=true&v=").concat(e))},onPreviewFail:function(n){var t=n.fileid;this.failed.push(t)}}},o=r(93),c=r.n(o),s=r(273),d={insert:"head",singleton:!1},l=(c()(s.a,d),s.a.locals,r(43)),u=Object(l.a)(a,(function(){var n=this,t=n.$createElement,e=n._self._c||t;return e("router-link",{staticClass:"folder",class:{"folder--clear":n.isEmpty},attrs:{to:n.to,"aria-label":n.ariaLabel}},[e("transition",{attrs:{name:"fade"}},[e("div",{directives:[{name:"show",rawName:"v-show",value:n.loaded,expression:"loaded"}],staticClass:"folder-content",class:"folder-content--grid-"+n.previewList.length,attrs:{role:"none"}},n._l(n.previewList,(function(t){return e("img",{key:t.fileid,attrs:{src:n.generateImgSrc(t),alt:""},on:{load:function(t){n.loaded=!0},error:function(e){return n.onPreviewFail(t)}}})})),0)]),n._v(" "),e("div",{staticClass:"folder-name"},[e("span",{staticClass:"folder-name__icon",class:[n.isEmpty?"icon-dark":"icon-white",n.icon],attrs:{role:"img"}}),n._v(" "),e("p",{staticClass:"folder-name__name",attrs:{id:n.ariaUuid}},[n._v("\n\t\t\t"+n._s(n.name)+"\n\t\t")])]),n._v(" "),e("div",{staticClass:"cover",attrs:{role:"none"}})],1)}),[],!1,null,"72c8239b",null);e.a=u.exports},323:function(n,t){},324:function(n,t){},333:function(n,t){},334:function(n,t){},354:function(n,t){},356:function(n,t){},357:function(n,t){},360:function(n,t){},361:function(n,t){},366:function(n,t){},367:function(n,t){},374:function(n,t){},377:function(n,t){},383:function(n,t){},386:function(n,t){},671:function(n,t,e){"use strict";var r=e(94),i=e.n(r)()(!0);i.push([n.i,"@media (min-width: 0px) and (max-width: 400px){.grid-container[data-v-36caba91]{padding:66px 8px 256px 8px}}@media (min-width: 400px) and (max-width: 700px){.grid-container[data-v-36caba91]{padding:66px 8px 256px 8px}}@media (min-width: 700px) and (max-width: 1024px){.grid-container[data-v-36caba91]{padding:66px 44px 256px 44px}}@media (min-width: 1024px) and (max-width: 1280px){.grid-container[data-v-36caba91]{padding:66px 44px 256px 44px}}@media (min-width: 1280px) and (max-width: 1440px){.grid-container[data-v-36caba91]{padding:88px 66px 256px 66px}}@media (min-width: 1440px) and (max-width: 1600px){.grid-container[data-v-36caba91]{padding:88px 66px 256px 66px}}@media (min-width: 1600px) and (max-width: 2048px){.grid-container[data-v-36caba91]{padding:88px 66px 256px 66px}}@media (min-width: 2048px) and (max-width: 2560px){.grid-container[data-v-36caba91]{padding:88px 88px 256px 88px}}@media (min-width: 2560px) and (max-width: 3440px){.grid-container[data-v-36caba91]{padding:88px 88px 256px 88px}}@media (min-width: 3440px){.grid-container[data-v-36caba91]{padding:88px 88px 256px 88px}}\n","",{version:3,sources:["webpack://src/views/Tags.vue"],names:[],mappings:"AAkSC,+CACC,iCACC,0BAAgE,CAChE,CAHF,iDACC,iCACC,0BAAgE,CAChE,CAHF,kDACC,iCACC,4BAAgE,CAChE,CAHF,mDACC,iCACC,4BAAgE,CAChE,CAHF,mDACC,iCACC,4BAAgE,CAChE,CAHF,mDACC,iCACC,4BAAgE,CAChE,CAHF,mDACC,iCACC,4BAAgE,CAChE,CAHF,mDACC,iCACC,4BAAgE,CAChE,CAHF,mDACC,iCACC,4BAAgE,CAChE,CAHF,2BACC,iCACC,4BAAgE,CAChE",sourcesContent:["\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n$previous: 0;\n@each $size, $config in get('sizes') {\n\t$marginTop: map-get($config, 'marginTop');\n\t$marginW: map-get($config, 'marginW');\n\t// if this is the last entry, only use min-width\n\t$rule: '(min-width: #{$previous}px) and (max-width: #{$size}px)';\n\t@if $size == 'max' {\n\t\t$rule: '(min-width: #{$previous}px)';\n\t}\n\t@media #{$rule} {\n\t\t.grid-container {\n\t\t\tpadding: #{$marginTop}px #{$marginW}px 256px #{$marginW}px;\n\t\t}\n\t}\n\t$previous: $size;\n}\n"],sourceRoot:""}]),t.a=i},681:function(n,t,e){"use strict";e.r(t);var r=e(62),i=e(272),a=e.n(i),o=e(263),c=e(35);function s(n,t,e,r,i,a,o){try{var c=n[a](o),s=c.value}catch(n){return void e(n)}c.done?t(s):Promise.resolve(s).then(r,i)}function d(n){return function(){var t=this,e=arguments;return new Promise((function(r,i){var a=n.apply(t,e);function o(n){s(a,r,i,o,c,"next",n)}function c(n){s(a,r,i,o,c,"throw",n)}o(void 0)}))}}
/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */var l=function(n){return u.apply(this,arguments)};function u(){return(u=d(regeneratorRuntime.mark((function n(t){var e,r,i=arguments;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return e=i.length>1&&void 0!==i[1]?i[1]:{},n.next=3,o.a.getDirectoryContents("/systemtags/",Object.assign({},{data:'<?xml version="1.0"?>\n\t\t\t<d:propfind  xmlns:d="DAV:"\n\t\t\t\txmlns:oc="http://owncloud.org/ns">\n\t\t\t\t<d:prop>\n\t\t\t\t\t<oc:id />\n\t\t\t\t\t<oc:display-name />\n\t\t\t\t\t<oc:user-visible />\n\t\t\t\t\t<oc:user-assignable />\n\t\t\t\t\t<oc:can-assign />\n\t\t\t\t</d:prop>\n\t\t\t</d:propfind>',details:!0},e));case 3:return r=n.sent,n.abrupt("return",r.data.map((function(n){return Object(c.b)(n)})));case 5:case"end":return n.stop()}}),n)})))).apply(this,arguments)}var p=e(23),f=e(299),m=e(95);function h(n,t,e,r,i,a,o){try{var c=n[a](o),s=c.value}catch(n){return void e(n)}c.done?t(s):Promise.resolve(s).then(r,i)}function v(n){return function(){var t=this,e=arguments;return new Promise((function(r,i){var a=n.apply(t,e);function o(n){h(a,r,i,o,c,"next",n)}function c(n){h(a,r,i,o,c,"throw",n)}o(void 0)}))}}
/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */var A=function(n){return g.apply(this,arguments)};function g(){return(g=v(regeneratorRuntime.mark((function n(t){var e,r,i,a=arguments;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return e=a.length>1&&void 0!==a[1]?a[1]:{},e=Object.assign({method:"REPORT",data:'<?xml version="1.0"?>\n\t\t\t<oc:filter-files\n\t\t\t\txmlns:d="DAV:"\n\t\t\t\txmlns:oc="http://owncloud.org/ns"\n\t\t\t\txmlns:nc="http://nextcloud.org/ns"\n\t\t\t\txmlns:ocs="http://open-collaboration-services.org/ns">\n\t\t\t\t<d:prop>\n\t\t\t\t\t'.concat(f.a,"\n\t\t\t\t</d:prop>\n\t\t\t\t<oc:filter-rules>\n\t\t\t\t\t<oc:systemtag>").concat(t,"</oc:systemtag>\n\t\t\t\t</oc:filter-rules>\n\t\t\t</oc:filter-files>"),details:!0},e),r="/files/".concat(Object(p.getCurrentUser)().uid),n.next=5,o.a.getDirectoryContents(r,e);case 5:return i=n.sent,n.abrupt("return",i.data.map((function(n){return Object(c.b)(n)})).filter((function(n){return n.mime&&-1!==m.b.indexOf(n.mime)})).map((function(n){return Object.assign({},n,{filename:n.filename.replace(r,"")})})));case 7:case"end":return n.stop()}}),n)})))).apply(this,arguments)}var C=e(300),b=e(257);function x(n,t,e,r,i,a,o){try{var c=n[a](o),s=c.value}catch(n){return void e(n)}c.done?t(s):Promise.resolve(s).then(r,i)}function w(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function y(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?w(Object(e),!0).forEach((function(t){B(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):w(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function B(n,t,e){return t in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}var j={name:"Tag",components:{FolderTagPreview:e(303).a},inheritAttrs:!1,props:{item:{type:Object,required:!0}},data:function(){return{cancelRequest:null}},computed:y(y({},Object(r.c)(["files","tags"])),{},{folderContent:function(){return this.tags[this.item.injected.id].files},fileList:function(){var n=this;return this.folderContent?this.folderContent.map((function(t){return n.files[t]})).filter((function(n){return!!n})).slice(0,4):[]}}),beforeDestroy:function(){this.cancelRequest&&this.cancelRequest("Navigated away")},created:function(){var n,t=this;return(n=regeneratorRuntime.mark((function n(){var e,r,i,a;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return e=Object(b.a)(A),r=e.request,i=e.cancel,t.cancelRequest=i,n.prev=2,n.next=5,r(t.item.injected.id);case 5:a=n.sent,t.$store.dispatch("updateTag",{id:t.item.injected.id,files:a}),t.$store.dispatch("appendFiles",a),n.next=13;break;case 10:n.prev=10,n.t0=n.catch(2),n.t0.response&&n.t0.response.status&&console.error("Failed to get folder content",t.item.injected.id,n.t0.response);case 13:return n.prev=13,t.cancelRequest=null,n.finish(13);case 16:case"end":return n.stop()}}),n,null,[[2,10,13,16]])})),function(){var t=this,e=arguments;return new Promise((function(r,i){var a=n.apply(t,e);function o(n){x(a,r,i,o,c,"next",n)}function c(n){x(a,r,i,o,c,"throw",n)}o(void 0)}))})()}},O=e(43),k=Object(O.a)(j,(function(){var n=this.$createElement;return(this._self._c||n)("FolderTagPreview",{attrs:{id:this.item.injected.id,icon:"icon-tag",name:this.item.injected.displayName,path:this.item.injected.displayName,"file-list":this.fileList}})}),[],!1,null,null,null).exports,R=e(301),E=e(302),D=e(304);function q(n,t,e,r,i,a,o){try{var c=n[a](o),s=c.value}catch(n){return void e(n)}c.done?t(s):Promise.resolve(s).then(r,i)}function P(n){return function(){var t=this,e=arguments;return new Promise((function(r,i){var a=n.apply(t,e);function o(n){q(a,r,i,o,c,"next",n)}function c(n){q(a,r,i,o,c,"throw",n)}o(void 0)}))}}function _(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function $(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?_(Object(e),!0).forEach((function(t){S(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):_(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function S(n,t,e){return t in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}var F={name:"Tags",components:{VirtualGrid:a.a,EmptyContent:C.a,Navigation:E.a},mixins:[D.a],props:{rootTitle:{type:String,required:!0},path:{type:String,default:""},loading:{type:Boolean,required:!0},isRoot:{type:Boolean,default:!0}},data:function(){return{error:null,cancelRequest:null}},computed:$($({},Object(r.c)(["files","tags","tagsNames"])),{},{tagId:function(){return this.$store.getters.tagId(this.path)},tag:function(){return this.tags[this.tagId]},tagsList:function(){var n=this;return Object.values(this.tagsNames).map((function(t){return n.tags[t]}))},fileList:function(){var n=this;return this.tag&&this.tag.files.map((function(t){return n.files[t]})).filter((function(n){return!!n}))},contentList:function(){var n=this;return this.isRoot?this.tagsList.flatMap((function(n){return""===n.id?[]:[{id:"tag-".concat(n.id),injected:$({},n),width:256,height:256,columnSpan:1,renderComponent:k}]})):this.fileList.map((function(t){return{id:"file-".concat(t.fileid),injected:$($({},t),{},{list:n.fileList}),width:256,height:256,columnSpan:1,renderComponent:R.a}}))},isEmpty:function(){return this.isRoot?0===Object.keys(this.tagsNames).length:0===this.fileList.length}}),watch:{path:function(){var n=this;return P(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n.tagId){t.next=3;break}return t.next=3,n.fetchRootContent();case 3:n.isRoot||n.fetchContent();case 4:case"end":return t.stop()}}),t)})))()}},beforeDestroy:function(){this.cancelRequest&&this.cancelRequest("Navigated away")},beforeMount:function(){var n=this;return P(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n.tagId){t.next=3;break}return t.next=3,n.fetchRootContent();case 3:n.isRoot||n.fetchContent();case 4:case"end":return t.stop()}}),t)})))()},methods:{fetchRootContent:function(){var n=this;return P(regeneratorRuntime.mark((function t(){var e,r,i,a;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n.cancelRequest&&n.cancelRequest("Changed folder"),OCA.Viewer.close(),n.tags[n.tagId]||n.$emit("update:loading",!0),n.error=null,e=Object(b.a)(l),r=e.request,i=e.cancel,n.cancelRequest=i,t.prev=6,t.next=9,r();case 9:a=t.sent,n.$store.dispatch("updateTags",a),t.next=17;break;case 13:t.prev=13,t.t0=t.catch(6),console.error(t.t0),n.error=!0;case 17:return t.prev=17,n.$emit("update:loading",!1),n.cancelRequest=null,t.finish(17);case 21:case"end":return t.stop()}}),t,null,[[6,13,17,21]])})))()},fetchContent:function(){var n=this;return P(regeneratorRuntime.mark((function t(){var e,r,i,a;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n.cancelRequest&&n.cancelRequest(),OCA.Viewer.close(),n.tags[n.tagId]||n.$emit("update:loading",!0),n.error=null,e=Object(b.a)(A),r=e.request,i=e.cancel,n.cancelRequest=i,t.prev=6,t.next=9,r(n.tagId);case 9:a=t.sent,n.$store.dispatch("updateTag",{id:n.tagId,files:a}),n.$store.dispatch("appendFiles",a),t.next=18;break;case 14:t.prev=14,t.t0=t.catch(6),console.error(t.t0),n.error=!0;case 18:return t.prev=18,n.$emit("update:loading",!1),n.cancelRequest=null,t.finish(18);case 22:case"end":return t.stop()}}),t,null,[[6,14,18,22]])})))()}}},T=e(93),U=e.n(T),L=e(671),W={insert:"head",singleton:!1},I=(U()(L.a,W),L.a.locals,Object(O.a)(F,(function(){var n=this,t=n.$createElement,e=n._self._c||t;return n.error?e("EmptyContent",[n._v("\n\t"+n._s(n.t("photos","An error occurred"))+"\n")]):n.loading?n._e():e("div",[e("Navigation",{key:"navigation",attrs:{basename:n.path,filename:"/"+n.path,"root-title":n.rootTitle}}),n._v(" "),n.isEmpty?e("EmptyContent",{key:"emptycontent",attrs:{"illustration-name":"empty"},scopedSlots:n._u([{key:"desc",fn:function(){return[n._v("\n\t\t\t"+n._s(n.t("photos","Photos with tags will show up here"))+"\n\t\t")]},proxy:!0}],null,!1,4132175345)},[n._v("\n\t\t"+n._s(n.t("photos","No tags yet"))+"\n\t\t")]):e("div",{staticClass:"grid-container"},[e("VirtualGrid",{ref:"virtualgrid",attrs:{items:n.contentList,"get-column-count":function(){return n.gridConfig.count},"get-grid-gap":function(){return n.gridConfig.gap}}})],1)],1)}),[],!1,null,"36caba91",null));t.default=I.exports}}]);
//# sourceMappingURL=photos-6.js.map?v=ff415dabb1d936c46520