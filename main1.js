var docCookies={getItem:function(e){return e&&decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},setItem:function(e,o,n,t,r,c){if(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))return!1;var s="";if(n)switch(n.constructor){case Number:s=n===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+n;break;case String:s="; expires="+n;break;case Date:s="; expires="+n.toUTCString()}return document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(o)+s+(r?"; domain="+r:"")+(t?"; path="+t:"")+(c?"; secure":""),!0},removeItem:function(e,o,n){return!!this.hasItem(e)&&(document.cookie=encodeURIComponent(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(n?"; domain="+n:"")+(o?"; path="+o:""),!0)},hasItem:function(e){return!(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))&&new RegExp("(?:^|;\\s*)"+encodeURIComponent(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(document.cookie)},keys:function(){for(var e=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),o=e.length,n=0;n<o;n++)e[n]=decodeURIComponent(e[n]);return e}};


!function(e){"use strict";function t(e,i,o){var a,n=document.createElement("img");return n.onerror=function(a){return t.onerror(n,a,e,i,o)},n.onload=function(a){return t.onload(n,a,e,i,o)},"string"==typeof e?(t.fetchBlob(e,function(i){i?(e=i,a=t.createObjectURL(e)):(a=e,o&&o.crossOrigin&&(n.crossOrigin=o.crossOrigin)),n.src=a},o),n):t.isInstanceOf("Blob",e)||t.isInstanceOf("File",e)?(a=n._objectURL=t.createObjectURL(e),a?(n.src=a,n):t.readFile(e,function(e){var t=e.target;t&&t.result?n.src=t.result:i&&i(e)})):void 0}function i(e,i){!e._objectURL||i&&i.noRevoke||(t.revokeObjectURL(e._objectURL),delete e._objectURL)}var o=window.createObjectURL&&window||window.URL&&URL.revokeObjectURL&&URL||window.webkitURL&&webkitURL;t.fetchBlob=function(e,t,i){t()},t.isInstanceOf=function(e,t){return Object.prototype.toString.call(t)==="[object "+e+"]"},t.transform=function(e,t,i,o,a){i(e,a)},t.onerror=function(e,t,o,a,n){i(e,n),a&&a.call(e,t)},t.onload=function(e,o,a,n,r){i(e,r),n&&t.transform(e,r,n,a,{})},t.createObjectURL=function(e){return!!o&&o.createObjectURL(e)},t.revokeObjectURL=function(e){return!!o&&o.revokeObjectURL(e)},t.readFile=function(e,t,i){if(window.FileReader){var o=new FileReader;if(o.onload=o.onerror=t,i=i||"readAsDataURL",o[i])return o[i](e),o}return!1},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:e.loadImage=t}(window),function(e){"use strict";"function"==typeof define&&define.amd?define(["./load-image"],e):e("object"==typeof module&&module.exports?require("./load-image"):window.loadImage)}(function(e){"use strict";var t=e.transform;e.transform=function(i,o,a,n,r){t.call(e,e.scale(i,o,r),o,a,n,r)},e.transformCoordinates=function(){},e.getTransformedOptions=function(e,t){var i,o,a,n,r=t.aspectRatio;if(!r)return t;i={};for(o in t)t.hasOwnProperty(o)&&(i[o]=t[o]);return i.crop=!0,a=e.naturalWidth||e.width,n=e.naturalHeight||e.height,a/n>r?(i.maxWidth=n*r,i.maxHeight=n):(i.maxWidth=a,i.maxHeight=a/r),i},e.renderImageToCanvas=function(e,t,i,o,a,n,r,s,l,d){return e.getContext("2d").drawImage(t,i,o,a,n,r,s,l,d),e},e.hasCanvasOption=function(e){return e.canvas||e.crop||!!e.aspectRatio},e.scale=function(t,i,o){function a(){var e=Math.max((l||v)/v,(d||w)/w);e>1&&(v*=e,w*=e)}function n(){var e=Math.min((r||v)/v,(s||w)/w);e<1&&(v*=e,w*=e)}i=i||{};var r,s,l,d,c,u,f,g,h,m,p,S=document.createElement("canvas"),b=t.getContext||e.hasCanvasOption(i)&&S.getContext,x=t.naturalWidth||t.width,y=t.naturalHeight||t.height,v=x,w=y;if(b&&(i=e.getTransformedOptions(t,i,o),f=i.left||0,g=i.top||0,i.sourceWidth?(c=i.sourceWidth,void 0!==i.right&&void 0===i.left&&(f=x-c-i.right)):c=x-f-(i.right||0),i.sourceHeight?(u=i.sourceHeight,void 0!==i.bottom&&void 0===i.top&&(g=y-u-i.bottom)):u=y-g-(i.bottom||0),v=c,w=u),r=i.maxWidth,s=i.maxHeight,l=i.minWidth,d=i.minHeight,b&&r&&s&&i.crop?(v=r,w=s,p=c/u-r/s,p<0?(u=s*c/r,void 0===i.top&&void 0===i.bottom&&(g=(y-u)/2)):p>0&&(c=r*u/s,void 0===i.left&&void 0===i.right&&(f=(x-c)/2))):((i.contain||i.cover)&&(l=r=r||l,d=s=s||d),i.cover?(n(),a()):(a(),n())),b){if(h=i.pixelRatio,h>1&&(S.style.width=v+"px",S.style.height=w+"px",v*=h,w*=h,S.getContext("2d").scale(h,h)),m=i.downsamplingRatio,m>0&&m<1&&v<c&&w<u)for(;c*m>v;)S.width=c*m,S.height=u*m,e.renderImageToCanvas(S,t,f,g,c,u,0,0,S.width,S.height),f=0,g=0,c=S.width,u=S.height,t=document.createElement("canvas"),t.width=c,t.height=u,e.renderImageToCanvas(t,S,0,0,c,u,0,0,c,u);return S.width=v,S.height=w,e.transformCoordinates(S,i),e.renderImageToCanvas(S,t,f,g,c,u,0,0,v,w)}return t.width=v,t.height=w,t}}),function(e){"use strict";"function"==typeof define&&define.amd?define(["./load-image"],e):e("object"==typeof module&&module.exports?require("./load-image"):window.loadImage)}(function(e){"use strict";var t=window.Blob&&(Blob.prototype.slice||Blob.prototype.webkitSlice||Blob.prototype.mozSlice);e.blobSlice=t&&function(){var e=this.slice||this.webkitSlice||this.mozSlice;return e.apply(this,arguments)},e.metaDataParsers={jpeg:{65505:[]}},e.parseMetaData=function(t,i,o,a){o=o||{},a=a||{};var n=this,r=o.maxMetaDataSize||262144,s=!(window.DataView&&t&&t.size>=12&&"image/jpeg"===t.type&&e.blobSlice);!s&&e.readFile(e.blobSlice.call(t,0,r),function(t){if(t.target.error)return console.log(t.target.error),void i(a);var r,s,l,d,c=t.target.result,u=new DataView(c),f=2,g=u.byteLength-4,h=f;if(65496===u.getUint16(0)){for(;f<g&&(r=u.getUint16(f),r>=65504&&r<=65519||65534===r);){if(s=u.getUint16(f+2)+2,f+s>u.byteLength){console.log("Invalid meta data: Invalid segment size.");break}if(l=e.metaDataParsers.jpeg[r])for(d=0;d<l.length;d+=1)l[d].call(n,u,f,s,a,o);f+=s,h=f}!o.disableImageHead&&h>6&&(c.slice?a.imageHead=c.slice(0,h):a.imageHead=new Uint8Array(c).subarray(0,h))}else console.log("Invalid JPEG file: Missing JPEG marker.");i(a)},"readAsArrayBuffer")||i(a)},e.hasMetaOption=function(e){return e&&e.meta};var i=e.transform;e.transform=function(t,o,a,n,r){e.hasMetaOption(o)?e.parseMetaData(n,function(r){i.call(e,t,o,a,n,r)},o,r):i.apply(e,arguments)}}),function(e){"use strict";"function"==typeof define&&define.amd?define(["./load-image","./load-image-meta"],e):"object"==typeof module&&module.exports?e(require("./load-image"),require("./load-image-meta")):e(window.loadImage)}(function(e){"use strict";"fetch"in window&&"Request"in window&&(e.fetchBlob=function(t,i,o){return e.hasMetaOption(o)?fetch(new Request(t,o)).then(function(e){return e.blob()}).then(i).catch(function(e){console.log(e),i()}):void i()})}),function(e){"use strict";"function"==typeof define&&define.amd?define(["./load-image","./load-image-meta"],e):"object"==typeof module&&module.exports?e(require("./load-image"),require("./load-image-meta")):e(window.loadImage)}(function(e){"use strict";e.ExifMap=function(){return this},e.ExifMap.prototype.map={Orientation:274},e.ExifMap.prototype.get=function(e){return this[e]||this[this.map[e]]},e.getExifThumbnail=function(e,t,i){var o,a,n;if(!i||t+i>e.byteLength)return void console.log("Invalid Exif data: Invalid thumbnail data.");for(o=[],a=0;a<i;a+=1)n=e.getUint8(t+a),o.push((n<16?"0":"")+n.toString(16));return"data:image/jpeg,%"+o.join("%")},e.exifTagTypes={1:{getValue:function(e,t){return e.getUint8(t)},size:1},2:{getValue:function(e,t){return String.fromCharCode(e.getUint8(t))},size:1,ascii:!0},3:{getValue:function(e,t,i){return e.getUint16(t,i)},size:2},4:{getValue:function(e,t,i){return e.getUint32(t,i)},size:4},5:{getValue:function(e,t,i){return e.getUint32(t,i)/e.getUint32(t+4,i)},size:8},9:{getValue:function(e,t,i){return e.getInt32(t,i)},size:4},10:{getValue:function(e,t,i){return e.getInt32(t,i)/e.getInt32(t+4,i)},size:8}},e.exifTagTypes[7]=e.exifTagTypes[1],e.getExifValue=function(t,i,o,a,n,r){var s,l,d,c,u,f,g=e.exifTagTypes[a];if(!g)return void console.log("Invalid Exif data: Invalid tag type.");if(s=g.size*n,l=s>4?i+t.getUint32(o+8,r):o+8,l+s>t.byteLength)return void console.log("Invalid Exif data: Invalid data offset.");if(1===n)return g.getValue(t,l,r);for(d=[],c=0;c<n;c+=1)d[c]=g.getValue(t,l+c*g.size,r);if(g.ascii){for(u="",c=0;c<d.length&&(f=d[c],"\0"!==f);c+=1)u+=f;return u}return d},e.parseExifTag=function(t,i,o,a,n){var r=t.getUint16(o,a);n.exif[r]=e.getExifValue(t,i,o,t.getUint16(o+2,a),t.getUint32(o+4,a),a)},e.parseExifTags=function(e,t,i,o,a){var n,r,s;if(i+6>e.byteLength)return void console.log("Invalid Exif data: Invalid directory offset.");if(n=e.getUint16(i,o),r=i+2+12*n,r+4>e.byteLength)return void console.log("Invalid Exif data: Invalid directory size.");for(s=0;s<n;s+=1)this.parseExifTag(e,t,i+2+12*s,o,a);return e.getUint32(r,o)},e.parseExifData=function(t,i,o,a,n){if(!n.disableExif){var r,s,l,d=i+10;if(1165519206===t.getUint32(i+4)){if(d+8>t.byteLength)return void console.log("Invalid Exif data: Invalid segment size.");if(0!==t.getUint16(i+8))return void console.log("Invalid Exif data: Missing byte alignment offset.");switch(t.getUint16(d)){case 18761:r=!0;break;case 19789:r=!1;break;default:return void console.log("Invalid Exif data: Invalid byte alignment marker.")}if(42!==t.getUint16(d+2,r))return void console.log("Invalid Exif data: Missing TIFF marker.");s=t.getUint32(d+4,r),a.exif=new e.ExifMap,s=e.parseExifTags(t,d,d+s,r,a),s&&!n.disableExifThumbnail&&(l={exif:{}},s=e.parseExifTags(t,d,d+s,r,l),l.exif[513]&&(a.exif.Thumbnail=e.getExifThumbnail(t,d+l.exif[513],l.exif[514]))),a.exif[34665]&&!n.disableExifSub&&e.parseExifTags(t,d,d+a.exif[34665],r,a),a.exif[34853]&&!n.disableExifGps&&e.parseExifTags(t,d,d+a.exif[34853],r,a)}}},e.metaDataParsers.jpeg[65505].push(e.parseExifData)}),function(e){"use strict";"function"==typeof define&&define.amd?define(["./load-image","./load-image-exif"],e):"object"==typeof module&&module.exports?e(require("./load-image"),require("./load-image-exif")):e(window.loadImage)}(function(e){"use strict";e.ExifMap.prototype.tags={256:"ImageWidth",257:"ImageHeight",34665:"ExifIFDPointer",34853:"GPSInfoIFDPointer",40965:"InteroperabilityIFDPointer",258:"BitsPerSample",259:"Compression",262:"PhotometricInterpretation",274:"Orientation",277:"SamplesPerPixel",284:"PlanarConfiguration",530:"YCbCrSubSampling",531:"YCbCrPositioning",282:"XResolution",283:"YResolution",296:"ResolutionUnit",273:"StripOffsets",278:"RowsPerStrip",279:"StripByteCounts",513:"JPEGInterchangeFormat",514:"JPEGInterchangeFormatLength",301:"TransferFunction",318:"WhitePoint",319:"PrimaryChromaticities",529:"YCbCrCoefficients",532:"ReferenceBlackWhite",306:"DateTime",270:"ImageDescription",271:"Make",272:"Model",305:"Software",315:"Artist",33432:"Copyright",36864:"ExifVersion",40960:"FlashpixVersion",40961:"ColorSpace",40962:"PixelXDimension",40963:"PixelYDimension",42240:"Gamma",37121:"ComponentsConfiguration",37122:"CompressedBitsPerPixel",37500:"MakerNote",37510:"UserComment",40964:"RelatedSoundFile",36867:"DateTimeOriginal",36868:"DateTimeDigitized",37520:"SubSecTime",37521:"SubSecTimeOriginal",37522:"SubSecTimeDigitized",33434:"ExposureTime",33437:"FNumber",34850:"ExposureProgram",34852:"SpectralSensitivity",34855:"PhotographicSensitivity",34856:"OECF",34864:"SensitivityType",34865:"StandardOutputSensitivity",34866:"RecommendedExposureIndex",34867:"ISOSpeed",34868:"ISOSpeedLatitudeyyy",34869:"ISOSpeedLatitudezzz",37377:"ShutterSpeedValue",37378:"ApertureValue",37379:"BrightnessValue",37380:"ExposureBias",37381:"MaxApertureValue",37382:"SubjectDistance",37383:"MeteringMode",37384:"LightSource",37385:"Flash",37396:"SubjectArea",37386:"FocalLength",41483:"FlashEnergy",41484:"SpatialFrequencyResponse",41486:"FocalPlaneXResolution",41487:"FocalPlaneYResolution",41488:"FocalPlaneResolutionUnit",41492:"SubjectLocation",41493:"ExposureIndex",41495:"SensingMethod",41728:"FileSource",41729:"SceneType",41730:"CFAPattern",41985:"CustomRendered",41986:"ExposureMode",41987:"WhiteBalance",41988:"DigitalZoomRatio",41989:"FocalLengthIn35mmFilm",41990:"SceneCaptureType",41991:"GainControl",41992:"Contrast",41993:"Saturation",41994:"Sharpness",41995:"DeviceSettingDescription",41996:"SubjectDistanceRange",42016:"ImageUniqueID",42032:"CameraOwnerName",42033:"BodySerialNumber",42034:"LensSpecification",42035:"LensMake",42036:"LensModel",42037:"LensSerialNumber",0:"GPSVersionID",1:"GPSLatitudeRef",2:"GPSLatitude",3:"GPSLongitudeRef",4:"GPSLongitude",5:"GPSAltitudeRef",6:"GPSAltitude",7:"GPSTimeStamp",8:"GPSSatellites",9:"GPSStatus",10:"GPSMeasureMode",11:"GPSDOP",12:"GPSSpeedRef",13:"GPSSpeed",14:"GPSTrackRef",15:"GPSTrack",16:"GPSImgDirectionRef",17:"GPSImgDirection",18:"GPSMapDatum",19:"GPSDestLatitudeRef",20:"GPSDestLatitude",21:"GPSDestLongitudeRef",22:"GPSDestLongitude",23:"GPSDestBearingRef",24:"GPSDestBearing",25:"GPSDestDistanceRef",26:"GPSDestDistance",27:"GPSProcessingMethod",28:"GPSAreaInformation",29:"GPSDateStamp",30:"GPSDifferential",31:"GPSHPositioningError"},e.ExifMap.prototype.stringValues={ExposureProgram:{0:"Undefined",1:"Manual",2:"Normal program",3:"Aperture priority",4:"Shutter priority",5:"Creative program",6:"Action program",7:"Portrait mode",8:"Landscape mode"},MeteringMode:{0:"Unknown",1:"Average",2:"CenterWeightedAverage",3:"Spot",4:"MultiSpot",5:"Pattern",6:"Partial",255:"Other"},LightSource:{0:"Unknown",1:"Daylight",2:"Fluorescent",3:"Tungsten (incandescent light)",4:"Flash",9:"Fine weather",10:"Cloudy weather",11:"Shade",12:"Daylight fluorescent (D 5700 - 7100K)",13:"Day white fluorescent (N 4600 - 5400K)",14:"Cool white fluorescent (W 3900 - 4500K)",15:"White fluorescent (WW 3200 - 3700K)",17:"Standard light A",18:"Standard light B",19:"Standard light C",20:"D55",21:"D65",22:"D75",23:"D50",24:"ISO studio tungsten",255:"Other"},Flash:{0:"Flash did not fire",1:"Flash fired",5:"Strobe return light not detected",7:"Strobe return light detected",9:"Flash fired, compulsory flash mode",13:"Flash fired, compulsory flash mode, return light not detected",15:"Flash fired, compulsory flash mode, return light detected",16:"Flash did not fire, compulsory flash mode",24:"Flash did not fire, auto mode",25:"Flash fired, auto mode",29:"Flash fired, auto mode, return light not detected",31:"Flash fired, auto mode, return light detected",32:"No flash function",65:"Flash fired, red-eye reduction mode",69:"Flash fired, red-eye reduction mode, return light not detected",71:"Flash fired, red-eye reduction mode, return light detected",73:"Flash fired, compulsory flash mode, red-eye reduction mode",77:"Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",79:"Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",89:"Flash fired, auto mode, red-eye reduction mode",93:"Flash fired, auto mode, return light not detected, red-eye reduction mode",95:"Flash fired, auto mode, return light detected, red-eye reduction mode"},SensingMethod:{1:"Undefined",2:"One-chip color area sensor",3:"Two-chip color area sensor",4:"Three-chip color area sensor",5:"Color sequential area sensor",7:"Trilinear sensor",8:"Color sequential linear sensor"},SceneCaptureType:{0:"Standard",1:"Landscape",2:"Portrait",3:"Night scene"},SceneType:{1:"Directly photographed"},CustomRendered:{0:"Normal process",1:"Custom process"},WhiteBalance:{0:"Auto white balance",1:"Manual white balance"},GainControl:{0:"None",1:"Low gain up",2:"High gain up",3:"Low gain down",4:"High gain down"},Contrast:{0:"Normal",1:"Soft",2:"Hard"},Saturation:{0:"Normal",1:"Low saturation",2:"High saturation"},Sharpness:{0:"Normal",1:"Soft",2:"Hard"},SubjectDistanceRange:{0:"Unknown",1:"Macro",2:"Close view",3:"Distant view"},FileSource:{3:"DSC"},ComponentsConfiguration:{0:"",1:"Y",2:"Cb",3:"Cr",4:"R",5:"G",6:"B"},Orientation:{1:"top-left",2:"top-right",3:"bottom-right",4:"bottom-left",5:"left-top",6:"right-top",7:"right-bottom",8:"left-bottom"}},e.ExifMap.prototype.getText=function(e){var t=this.get(e);switch(e){case"LightSource":case"Flash":case"MeteringMode":case"ExposureProgram":case"SensingMethod":case"SceneCaptureType":case"SceneType":case"CustomRendered":case"WhiteBalance":case"GainControl":case"Contrast":case"Saturation":case"Sharpness":case"SubjectDistanceRange":case"FileSource":case"Orientation":return this.stringValues[e][t];case"ExifVersion":case"FlashpixVersion":if(!t)return;return String.fromCharCode(t[0],t[1],t[2],t[3]);case"ComponentsConfiguration":if(!t)return;return this.stringValues[e][t[0]]+this.stringValues[e][t[1]]+this.stringValues[e][t[2]]+this.stringValues[e][t[3]];case"GPSVersionID":if(!t)return;return t[0]+"."+t[1]+"."+t[2]+"."+t[3]}return String(t)},function(e){var t,i=e.tags,o=e.map;for(t in i)i.hasOwnProperty(t)&&(o[i[t]]=t)}(e.ExifMap.prototype),e.ExifMap.prototype.getAll=function(){var e,t,i={};for(e in this)this.hasOwnProperty(e)&&(t=this.tags[e],t&&(i[t]=this.getText(t)));return i}}),function(e){"use strict";"function"==typeof define&&define.amd?define(["./load-image","./load-image-scale","./load-image-meta"],e):"object"==typeof module&&module.exports?e(require("./load-image"),require("./load-image-scale"),require("./load-image-meta")):e(window.loadImage)}(function(e){"use strict";var t=e.hasCanvasOption,i=e.hasMetaOption,o=e.transformCoordinates,a=e.getTransformedOptions;e.hasCanvasOption=function(i){return!!i.orientation||t.call(e,i)},e.hasMetaOption=function(t){return t&&t.orientation===!0||i.call(e,t)},e.transformCoordinates=function(t,i){o.call(e,t,i);var a=t.getContext("2d"),n=t.width,r=t.height,s=t.style.width,l=t.style.height,d=i.orientation;if(d&&!(d>8))switch(d>4&&(t.width=r,t.height=n,t.style.width=l,t.style.height=s),d){case 2:a.translate(n,0),a.scale(-1,1);break;case 3:a.translate(n,r),a.rotate(Math.PI);break;case 4:a.translate(0,r),a.scale(1,-1);break;case 5:a.rotate(.5*Math.PI),a.scale(1,-1);break;case 6:a.rotate(.5*Math.PI),a.translate(0,-r);break;case 7:a.rotate(.5*Math.PI),a.translate(n,-r),a.scale(-1,1);break;case 8:a.rotate(-.5*Math.PI),a.translate(-n,0)}},e.getTransformedOptions=function(t,i,o){var n,r,s=a.call(e,t,i),l=s.orientation;if(l===!0&&o&&o.exif&&(l=o.exif.get("Orientation")),!l||l>8||1===l)return s;n={};for(r in s)s.hasOwnProperty(r)&&(n[r]=s[r]);switch(n.orientation=l,l){case 2:n.left=s.right,n.right=s.left;break;case 3:n.left=s.right,n.top=s.bottom,n.right=s.left,n.bottom=s.top;break;case 4:n.top=s.bottom,n.bottom=s.top;break;case 5:n.left=s.top,n.top=s.left,n.right=s.bottom,n.bottom=s.right;break;case 6:n.left=s.top,n.top=s.right,n.right=s.bottom,n.bottom=s.left;break;case 7:n.left=s.bottom,n.top=s.right,n.right=s.top,n.bottom=s.left;break;case 8:n.left=s.bottom,n.top=s.left,n.right=s.top,n.bottom=s.right}return n.orientation>4&&(n.maxWidth=s.maxHeight,n.maxHeight=s.maxWidth,n.minWidth=s.minHeight,n.minHeight=s.minWidth,n.sourceWidth=s.sourceHeight,n.sourceHeight=s.sourceWidth),n}});
//# sourceMappingURL=load-image.all.min.js.map



//PNotify.js
var _extends=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=i[n])}return t},_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},PNotify=function(){"use strict";function t(){h.defaultStack.context=document.body,window.addEventListener("resize",function(){n&&clearTimeout(n),n=setTimeout(function(){h.positionAll()},10)})}function m(t){t.overlay.parentNode&&t.overlay.parentNode.removeChild(t.overlay)}function e(t,e){return"object"!==(void 0===t?"undefined":_typeof(t))&&(t={text:t}),e&&(t.type=e),{target:document.body,data:t}}var h=void 0,n=void 0;var i={runModules:function(t){if("init"===t){for(var e in h.modules)if(h.modules.hasOwnProperty(e)&&"function"==typeof h.modules[e].init){var i=h.modules[e].init(this);this.initModule(i)}}else{var n=this.get()._modules;for(var o in n)if(n.hasOwnProperty(o)){var s=_extends({_notice:this,_options:this.get()},this.get().modules[o]);n[o].set(s),"function"==typeof n[o][t]&&n[o][t]()}}},initModule:function(t){var e=this.get().modules;e.hasOwnProperty(t.constructor.key)||(e[t.constructor.key]={});var i=_extends({_notice:this,_options:this.get()},e[t.constructor.key]);t.initModule(i),this.get()._modules[t.constructor.key]=t},update:function(t){var e=this.get().hide,i=this.get().icon;this.set(t),this.runModules("update"),this.get().hide?e||this.queueClose():this.cancelClose(),this.queuePosition();var n=this.get().icon;return n!==i&&(!0===n&&"fontawesome5"===this.get().icons||"string"==typeof n&&n.match(/(^| )fa[srlb]($| )/))&&(this.set({icon:!1}),this.set({icon:n})),this},open:function(){var t=this,e=this.get(),i=e._state,n=e.hide;if("opening"!==i){if("open"!==i){this.set({_state:"opening",_animatingClass:"ui-pnotify-initial-hidden"}),this.runModules("beforeOpen");var o=this.get().stack;if(!this.refs.elem.parentNode||o&&o.context&&o.context!==this.refs.elem.parentNode)if(o&&o.context)o.context.appendChild(this.refs.elem);else{if(!document.body)throw new Error("No context to open this notice in.");document.body.appendChild(this.refs.elem)}return setTimeout(function(){o&&(o.animation=!1,h.positionAll(),o.animation=!0),t.animateIn(function(){t.get().hide&&t.queueClose(),t.set({_state:"open"}),t.runModules("afterOpen")})},0),this}n&&this.queueClose()}},remove:function(t){return this.close(t)},close:function(t){var e=this,i=this.get()._state;if("closing"!==i&&"closed"!==i){this.set({_state:"closing",_timerHide:!!t}),this.runModules("beforeClose");var n=this.get()._timer;return n&&clearTimeout&&(clearTimeout(n),this.set({_timer:null})),this.animateOut(function(){if(e.set({_state:"closed"}),e.runModules("afterClose"),e.queuePosition(),e.get().remove&&e.refs.elem.parentNode.removeChild(e.refs.elem),e.runModules("beforeDestroy"),e.get().destroy&&null!==h.notices){var t=h.notices.indexOf(e);-1!==t&&h.notices.splice(t,1)}e.runModules("afterDestroy")}),this}},animateIn:function(a){var c=this;this.set({_animating:"in"});function l(){c.refs.elem.removeEventListener("transitionend",l);var t=c.get(),e=t._animTimer,i=t._animating,n=t._moduleIsNoticeOpen;if(e&&clearTimeout(e),"in"===i){var o=n;if(!o){var s=c.refs.elem.getBoundingClientRect();for(var r in s)if(0<s[r]){o=!0;break}}o?(a&&a.call(),c.set({_animating:!1})):c.set({_animTimer:setTimeout(l,40)})}}"fade"===this.get().animation?(this.refs.elem.addEventListener("transitionend",l),this.set({_animatingClass:"ui-pnotify-in"}),this.refs.elem.style.opacity,this.set({_animatingClass:"ui-pnotify-in ui-pnotify-fade-in"}),this.set({_animTimer:setTimeout(l,650)})):(this.set({_animatingClass:"ui-pnotify-in"}),l())},animateOut:function(f){var d=this;this.set({_animating:"out"});function p(){d.refs.elem.removeEventListener("transitionend",p);var t=d.get(),e=t._animTimer,i=t._animating,n=t._moduleIsNoticeOpen;if(e&&clearTimeout(e),"out"===i){var o=n;if(!o){var s=d.refs.elem.getBoundingClientRect();for(var r in s)if(0<s[r]){o=!0;break}}if(d.refs.elem.style.opacity&&"0"!==d.refs.elem.style.opacity&&o)d.set({_animTimer:setTimeout(p,40)});else{d.set({_animatingClass:""});var a=d.get().stack;if(a&&a.overlay){for(var c=!1,l=0;l<h.notices.length;l++){var u=h.notices[l];if(u!==d&&u.get().stack===a&&"closed"!==u.get()._state){c=!0;break}}c||m(a)}f&&f.call(),d.set({_animating:!1})}}}"fade"===this.get().animation?(this.refs.elem.addEventListener("transitionend",p),this.set({_animatingClass:"ui-pnotify-in"}),this.set({_animTimer:setTimeout(p,650)})):(this.set({_animatingClass:""}),p())},position:function(){var t=this.get().stack,e=this.refs.elem;if(t){if(t.context||(t.context=document.body),"number"!=typeof t.nextpos1&&(t.nextpos1=t.firstpos1),"number"!=typeof t.nextpos2&&(t.nextpos2=t.firstpos2),"number"!=typeof t.addpos2&&(t.addpos2=0),!e.classList.contains("ui-pnotify-in")&&!e.classList.contains("ui-pnotify-initial-hidden"))return this;t.modal&&(t.overlay||function(t){var e=document.createElement("div");e.classList.add("ui-pnotify-modal-overlay"),t.context!==document.body&&(e.style.height=t.context.scrollHeight+"px",e.style.width=t.context.scrollWidth+"px"),e.addEventListener("click",function(){t.overlayClose&&h.closeStack(t)}),t.overlay=e}(t),function(t){t.overlay.parentNode!==t.context&&(t.overlay=t.context.insertBefore(t.overlay,t.context.firstChild))}(t)),e.getBoundingClientRect(),t.animation&&this.set({_moveClass:"ui-pnotify-move"});var i=t.context===document.body?window.innerHeight:t.context.scrollHeight,n=t.context===document.body?window.innerWidth:t.context.scrollWidth,o=void 0;if(t.dir1){o={down:"top",up:"bottom",left:"right",right:"left"}[t.dir1];var s=void 0;switch(t.dir1){case"down":s=e.offsetTop;break;case"up":s=i-e.scrollHeight-e.offsetTop;break;case"left":s=n-e.scrollWidth-e.offsetLeft;break;case"right":s=e.offsetLeft}void 0===t.firstpos1&&(t.firstpos1=s,t.nextpos1=t.firstpos1)}if(t.dir1&&t.dir2){var r={down:"top",up:"bottom",left:"right",right:"left"}[t.dir2],a=void 0;switch(t.dir2){case"down":a=e.offsetTop;break;case"up":a=i-e.scrollHeight-e.offsetTop;break;case"left":a=n-e.scrollWidth-e.offsetLeft;break;case"right":a=e.offsetLeft}void 0===t.firstpos2&&(t.firstpos2=a,t.nextpos2=t.firstpos2);var c=t.nextpos1+e.offsetHeight+(void 0===t.spacing1?25:t.spacing1),l=t.nextpos1+e.offsetWidth+(void 0===t.spacing1?25:t.spacing1);switch((("down"===t.dir1||"up"===t.dir1)&&i<c||("left"===t.dir1||"right"===t.dir1)&&n<l)&&(t.nextpos1=t.firstpos1,t.nextpos2+=t.addpos2+(void 0===t.spacing2?25:t.spacing2),t.addpos2=0),"number"==typeof t.nextpos2&&(e.style[r]=t.nextpos2+"px",t.animation||e.style[r]),t.dir2){case"down":case"up":e.offsetHeight+(parseFloat(e.style.marginTop,10)||0)+(parseFloat(e.style.marginBottom,10)||0)>t.addpos2&&(t.addpos2=e.offsetHeight);break;case"left":case"right":e.offsetWidth+(parseFloat(e.style.marginLeft,10)||0)+(parseFloat(e.style.marginRight,10)||0)>t.addpos2&&(t.addpos2=e.offsetWidth)}}else if(t.dir1){var u=void 0,f=void 0;switch(t.dir1){case"down":case"up":f=["left","right"],u=t.context.scrollWidth/2-e.offsetWidth/2;break;case"left":case"right":f=["top","bottom"],u=i/2-e.offsetHeight/2}e.style[f[0]]=u+"px",e.style[f[1]]="auto",t.animation||e.style[f[0]]}if(t.dir1)switch("number"==typeof t.nextpos1&&(e.style[o]=t.nextpos1+"px",t.animation||e.style[o]),t.dir1){case"down":case"up":t.nextpos1+=e.offsetHeight+(void 0===t.spacing1?25:t.spacing1);break;case"left":case"right":t.nextpos1+=e.offsetWidth+(void 0===t.spacing1?25:t.spacing1)}else{var d=n/2-e.offsetWidth/2,p=i/2-e.offsetHeight/2;e.style.left=d+"px",e.style.top=p+"px",t.animation||e.style.left}return this}},queuePosition:function(t){return n&&clearTimeout(n),t||(t=10),n=setTimeout(function(){h.positionAll()},t),this},cancelRemove:function(){return this.cancelClose()},cancelClose:function(){var t=this.get(),e=t._timer,i=t._animTimer,n=t._state,o=t.animation;return e&&clearTimeout(e),i&&clearTimeout(i),"closing"===n&&this.set({_state:"open",_animating:!1,_animatingClass:"fade"===o?"ui-pnotify-in ui-pnotify-fade-in":"ui-pnotify-in"}),this},queueRemove:function(){return this.queueClose()},queueClose:function(){var t=this;return this.cancelClose(),this.set({_timer:setTimeout(function(){return t.close(!0)},isNaN(this.get().delay)?0:this.get().delay)}),this},addModuleClass:function(){for(var t=this.get()._moduleClasses,e=arguments.length,i=Array(e),n=0;n<e;n++)i[n]=arguments[n];for(var o=0;o<i.length;o++){var s=i[o];-1===t.indexOf(s)&&t.push(s)}this.set({_moduleClasses:t})},removeModuleClass:function(){for(var t=this.get()._moduleClasses,e=arguments.length,i=Array(e),n=0;n<e;n++)i[n]=arguments[n];for(var o=0;o<i.length;o++){var s=i[o],r=t.indexOf(s);-1!==r&&t.splice(r,1)}this.set({_moduleClasses:t})},hasModuleClass:function(){for(var t=this.get()._moduleClasses,e=arguments.length,i=Array(e),n=0;n<e;n++)i[n]=arguments[n];for(var o=0;o<i.length;o++){var s=i[o];if(-1===t.indexOf(s))return!1}return!0}};function D(t,e,i){var n=Object.create(t);return n.module=e[i],n}function F(t,e,i){var n=Object.create(t);return n.module=e[i],n}function V(e,t,i){var n,o,s=i.module;function r(t){return{root:e.root,store:e.store}}if(s)var a=new s(r());function c(t){e.initModule(t.module)}return a&&a.on("init",c),{key:t,first:null,c:function(){n=d(),a&&a._fragment.c(),o=d(),this.first=n},m:function(t,e){et(t,n,e),a&&a._mount(t,e),et(t,o,e)},p:function(t,e){s!==(s=e.module)&&(a&&a.destroy(),s?((a=new s(r()))._fragment.c(),a._mount(o.parentNode,o),a.on("init",c)):a=null)},d:function(t){t&&(ot(n),ot(o)),a&&a.destroy(t)}}}function $(i,t){var n,o,s,r;return{c:function(){n=Q("div"),(o=Q("span")).className=s=!0===t.icon?t._icons[t.type]?t._icons[t.type]:"":t.icon,n.className=r="ui-pnotify-icon "+(t._styles.icon?t._styles.icon:"")},m:function(t,e){et(t,n,e),U(n,o),i.refs.iconContainer=n},p:function(t,e){(t.icon||t._icons||t.type)&&s!==(s=!0===e.icon?e._icons[e.type]?e._icons[e.type]:"":e.icon)&&(o.className=s),t._styles&&r!==(r="ui-pnotify-icon "+(e._styles.icon?e._styles.icon:""))&&(n.className=r)},d:function(t){t&&ot(n),i.refs.iconContainer===n&&(i.refs.iconContainer=null)}}}function G(i,t){var n,o;function s(t){return t.titleTrusted?l:c}var r=s(t),a=r(i,t);return{c:function(){n=Q("h4"),a.c(),n.className=o="ui-pnotify-title "+(t._styles.title?t._styles.title:"")},m:function(t,e){et(t,n,e),a.m(n,null),i.refs.titleContainer=n},p:function(t,e){r===(r=s(e))&&a?a.p(t,e):(a.d(1),(a=r(i,e)).c(),a.m(n,null)),t._styles&&o!==(o="ui-pnotify-title "+(e._styles.title?e._styles.title:""))&&(n.className=o)},d:function(t){t&&ot(n),a.d(),i.refs.titleContainer===n&&(i.refs.titleContainer=null)}}}function c(t,e){var i;return{c:function(){i=Y(e.title)},m:function(t,e){et(t,i,e)},p:function(t,e){t.title&&s(i,e.title)},d:function(t){t&&ot(i)}}}function l(t,i){var n,o;return{c:function(){n=Q("noscript"),o=Q("noscript")},m:function(t,e){et(t,n,e),n.insertAdjacentHTML("afterend",i.title),et(t,o,e)},p:function(t,e){t.title&&(r(n,o),n.insertAdjacentHTML("afterend",e.title))},d:function(t){t&&(r(n,o),ot(n),ot(o))}}}function J(i,t){var n,o;function s(t){return t.textTrusted?f:u}var r=s(t),a=r(i,t);return{c:function(){n=Q("div"),a.c(),n.className=o="ui-pnotify-text "+(t._styles.text?t._styles.text:""),Z(n,"role","alert")},m:function(t,e){et(t,n,e),a.m(n,null),i.refs.textContainer=n},p:function(t,e){r===(r=s(e))&&a?a.p(t,e):(a.d(1),(a=r(i,e)).c(),a.m(n,null)),t._styles&&o!==(o="ui-pnotify-text "+(e._styles.text?e._styles.text:""))&&(n.className=o)},d:function(t){t&&ot(n),a.d(),i.refs.textContainer===n&&(i.refs.textContainer=null)}}}function u(t,e){var i;return{c:function(){i=Y(e.text)},m:function(t,e){et(t,i,e)},p:function(t,e){t.text&&s(i,e.text)},d:function(t){t&&ot(i)}}}function f(t,i){var n,o;return{c:function(){n=Q("noscript"),o=Q("noscript")},m:function(t,e){et(t,n,e),n.insertAdjacentHTML("afterend",i.text),et(t,o,e)},p:function(t,e){t.text&&(r(n,o),n.insertAdjacentHTML("afterend",e.text))},d:function(t){t&&(r(n,o),ot(n),ot(o))}}}function K(e,t,i){var n,o,s=i.module;function r(t){return{root:e.root,store:e.store}}if(s)var a=new s(r());function c(t){e.initModule(t.module)}return a&&a.on("init",c),{key:t,first:null,c:function(){n=d(),a&&a._fragment.c(),o=d(),this.first=n},m:function(t,e){et(t,n,e),a&&a._mount(t,e),et(t,o,e)},p:function(t,e){s!==(s=e.module)&&(a&&a.destroy(),s?((a=new s(r()))._fragment.c(),a._mount(o.parentNode,o),a.on("init",c)):a=null)},d:function(t){t&&(ot(n),ot(o)),a&&a.destroy(t)}}}function o(t){var e=this;!function(t,e){t._handlers=X(),t._slots=X(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}(this,t),this.refs={},this._state=a(function(){var t=_extends({_state:"initializing",_timer:null,_animTimer:null,_animating:!1,_animatingClass:"",_moveClass:"",_timerHide:!1,_moduleClasses:[],_moduleIsNoticeOpen:!1,_modules:{},_modulesPrependContainer:h.modulesPrependContainer,_modulesAppendContainer:h.modulesAppendContainer},h.defaults);return t.modules=_extends({},h.defaults.modules),t}(),t.data),this._recompute({styling:1,icons:1,width:1,minHeight:1},this._state),this._intro=!0,document.getElementById("svelte-1eldsjg-style")||function(){var t=Q("style");t.id="svelte-1eldsjg-style",t.textContent='body > .ui-pnotify{position:fixed;z-index:100040}body > .ui-pnotify.ui-pnotify-modal{z-index:100042}.ui-pnotify{position:absolute;height:auto;z-index:1;display:none}.ui-pnotify.ui-pnotify-modal{z-index:3}.ui-pnotify.ui-pnotify-in{display:block}.ui-pnotify.ui-pnotify-initial-hidden{display:block;visibility:hidden}.ui-pnotify.ui-pnotify-move{transition:left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-slow{transition:opacity .4s linear;opacity:0}.ui-pnotify.ui-pnotify-fade-slow.ui-pnotify.ui-pnotify-move{transition:opacity .4s linear, left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-normal{transition:opacity .25s linear;opacity:0}.ui-pnotify.ui-pnotify-fade-normal.ui-pnotify.ui-pnotify-move{transition:opacity .25s linear, left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-fast{transition:opacity .1s linear;opacity:0}.ui-pnotify.ui-pnotify-fade-fast.ui-pnotify.ui-pnotify-move{transition:opacity .1s linear, left .5s ease, top .5s ease, right .5s ease, bottom .5s ease}.ui-pnotify.ui-pnotify-fade-in{opacity:1}.ui-pnotify .ui-pnotify-shadow{-webkit-box-shadow:0px 6px 28px 0px rgba(0,0,0,0.1);-moz-box-shadow:0px 6px 28px 0px rgba(0,0,0,0.1);box-shadow:0px 6px 28px 0px rgba(0,0,0,0.1)}.ui-pnotify-container{background-position:0 0;padding:.8em;height:100%;margin:0}.ui-pnotify-container:after{content:" ";visibility:hidden;display:block;height:0;clear:both}.ui-pnotify-container.ui-pnotify-sharp{-webkit-border-radius:0;-moz-border-radius:0;border-radius:0}.ui-pnotify-title{display:block;white-space:pre-line;margin-bottom:.4em;margin-top:0}.ui-pnotify.ui-pnotify-with-icon .ui-pnotify-title,.ui-pnotify.ui-pnotify-with-icon .ui-pnotify-text{margin-left:24px}[dir=rtl] .ui-pnotify.ui-pnotify-with-icon .ui-pnotify-title,[dir=rtl] .ui-pnotify.ui-pnotify-with-icon .ui-pnotify-text{margin-right:24px;margin-left:0}.ui-pnotify-title-bs4{font-size:1.2rem}.ui-pnotify-text{display:block;white-space:pre-line}.ui-pnotify-icon,.ui-pnotify-icon span{display:block;float:left}[dir=rtl] .ui-pnotify-icon,[dir=rtl] .ui-pnotify-icon span{float:right}.ui-pnotify-icon-bs3 > span{position:relative;top:2px}.ui-pnotify-icon-bs4 > span{position:relative;top:4px}.ui-pnotify-modal-overlay{background-color:rgba(0, 0, 0, .4);top:0;left:0;position:absolute;height:100%;width:100%;z-index:2}body > .ui-pnotify-modal-overlay{position:fixed;z-index:100041}',U(document.head,t)}(),this._fragment=function(o,t){for(var s,r,a,c,l,u,f,d,p,m=[],h=X(),y=[],g=X(),e=t._modulesPrependContainer,_=function(t){return t.module.key},i=0;i<e.length;i+=1){var n=F(t,e,i),v=_(n);m[i]=h[v]=V(o,v,n)}var b=!1!==t.icon&&$(o,t),x=!1!==t.title&&G(o,t),C=!1!==t.text&&J(o,t),w=t._modulesAppendContainer,k=function(t){return t.module.key};for(i=0;i<w.length;i+=1){var T=D(t,w,i),S=k(T);y[i]=g[S]=K(o,S,T)}function N(t){o.fire("mouseover",t)}function H(t){o.fire("mouseout",t)}function M(t){o.fire("mouseenter",t)}function O(t){o.fire("mouseleave",t)}function A(t){o.fire("mousemove",t)}function L(t){o.fire("mousedown",t)}function j(t){o.fire("mouseup",t)}function E(t){o.fire("click",t)}function P(t){o.fire("dblclick",t)}function W(t){o.fire("focus",t)}function z(t){o.fire("blur",t)}function R(t){o.fire("touchstart",t)}function q(t){o.fire("touchmove",t)}function B(t){o.fire("touchend",t)}function I(t){o.fire("touchcancel",t)}return{c:function(){for(s=Q("div"),r=Q("div"),i=0;i<m.length;i+=1)m[i].c();for(a=Y("\n    "),b&&b.c(),c=Y("\n    "),x&&x.c(),l=Y("\n    "),C&&C.c(),u=Y("\n    "),i=0;i<y.length;i+=1)y[i].c();r.className=f="\n        ui-pnotify-container\n        "+(t._styles.container?t._styles.container:"")+"\n        "+(t._styles[t.type]?t._styles[t.type]:"")+"\n        "+t.cornerClass+"\n        "+(t.shadow?"ui-pnotify-shadow":"")+"\n      ",r.style.cssText=d=t._widthStyle+" "+t._minHeightStyle,Z(r,"role","alert"),tt(s,"mouseover",N),tt(s,"mouseout",H),tt(s,"mouseenter",M),tt(s,"mouseleave",O),tt(s,"mousemove",A),tt(s,"mousedown",L),tt(s,"mouseup",j),tt(s,"click",E),tt(s,"dblclick",P),tt(s,"focus",W),tt(s,"blur",z),tt(s,"touchstart",R),tt(s,"touchmove",q),tt(s,"touchend",B),tt(s,"touchcancel",I),s.className=p="\n      ui-pnotify\n      "+(!1!==t.icon?"ui-pnotify-with-icon":"")+"\n      "+(t._styles.element?t._styles.element:"")+"\n      "+t.addClass+"\n      "+t._animatingClass+"\n      "+t._moveClass+"\n      "+("fade"===t.animation?"ui-pnotify-fade-"+t.animateSpeed:"")+"\n      "+(t.stack&&t.stack.modal?"ui-pnotify-modal":"")+"\n      "+t._moduleClasses.join(" ")+"\n    ",Z(s,"aria-live","assertive"),Z(s,"role","alertdialog"),Z(s,"ui-pnotify",!0)},m:function(t,e){for(et(t,s,e),U(s,r),i=0;i<m.length;i+=1)m[i].m(r,null);for(U(r,a),b&&b.m(r,null),U(r,c),x&&x.m(r,null),U(r,l),C&&C.m(r,null),U(r,u),i=0;i<y.length;i+=1)y[i].m(r,null);o.refs.container=r,o.refs.elem=s},p:function(t,e){var i=e._modulesPrependContainer;m=it(m,o,t,_,1,e,i,h,r,nt,V,"m",a,F),!1!==e.icon?b?b.p(t,e):((b=$(o,e)).c(),b.m(r,c)):b&&(b.d(1),b=null),!1!==e.title?x?x.p(t,e):((x=G(o,e)).c(),x.m(r,l)):x&&(x.d(1),x=null),!1!==e.text?C?C.p(t,e):((C=J(o,e)).c(),C.m(r,u)):C&&(C.d(1),C=null);var n=e._modulesAppendContainer;y=it(y,o,t,k,1,e,n,g,r,nt,K,"m",null,D),(t._styles||t.type||t.cornerClass||t.shadow)&&f!==(f="\n        ui-pnotify-container\n        "+(e._styles.container?e._styles.container:"")+"\n        "+(e._styles[e.type]?e._styles[e.type]:"")+"\n        "+e.cornerClass+"\n        "+(e.shadow?"ui-pnotify-shadow":"")+"\n      ")&&(r.className=f),(t._widthStyle||t._minHeightStyle)&&d!==(d=e._widthStyle+" "+e._minHeightStyle)&&(r.style.cssText=d),(t.icon||t._styles||t.addClass||t._animatingClass||t._moveClass||t.animation||t.animateSpeed||t.stack||t._moduleClasses)&&p!==(p="\n      ui-pnotify\n      "+(!1!==e.icon?"ui-pnotify-with-icon":"")+"\n      "+(e._styles.element?e._styles.element:"")+"\n      "+e.addClass+"\n      "+e._animatingClass+"\n      "+e._moveClass+"\n      "+("fade"===e.animation?"ui-pnotify-fade-"+e.animateSpeed:"")+"\n      "+(e.stack&&e.stack.modal?"ui-pnotify-modal":"")+"\n      "+e._moduleClasses.join(" ")+"\n    ")&&(s.className=p)},d:function(t){for(t&&ot(s),i=0;i<m.length;i+=1)m[i].d();for(b&&b.d(),x&&x.d(),C&&C.d(),i=0;i<y.length;i+=1)y[i].d();o.refs.container===r&&(o.refs.container=null),st(s,"mouseover",N),st(s,"mouseout",H),st(s,"mouseenter",M),st(s,"mouseleave",O),st(s,"mousemove",A),st(s,"mousedown",L),st(s,"mouseup",j),st(s,"click",E),st(s,"dblclick",P),st(s,"focus",W),st(s,"blur",z),st(s,"touchstart",R),st(s,"touchmove",q),st(s,"touchend",B),st(s,"touchcancel",I),o.refs.elem===s&&(o.refs.elem=null)}}}(this,this._state),this.root._oncreate.push(function(){(function(){var e=this;this.on("mouseenter",function(t){if(e.get().mouseReset&&"out"===e.get()._animating){if(!e.get()._timerHide)return;e.cancelClose()}e.get().hide&&e.get().mouseReset&&e.cancelClose()}),this.on("mouseleave",function(t){e.get().hide&&e.get().mouseReset&&"out"!==e.get()._animating&&e.queueClose(),h.positionAll()});var t=this.get().stack;t&&"top"===t.push?h.notices.splice(0,0,this):h.notices.push(this),this.runModules("init"),this.set({_state:"closed"}),this.get().autoDisplay&&this.open()}).call(e),e.fire("update",{changed:function(t,e){for(var i in e)t[i]=1;return t}({},e._state),current:e._state})}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),p(this))}function Q(t){return document.createElement(t)}function U(t,e){t.appendChild(e)}function X(){return Object.create(null)}function Y(t){return document.createTextNode(t)}function Z(t,e,i){null==i?t.removeAttribute(e):t.setAttribute(e,i)}function tt(t,e,i,n){t.addEventListener(e,i,n)}function et(t,e,i){t.insertBefore(e,i)}function it(t,e,i,n,o,s,r,a,c,l,u,f,d,p){for(var m=t.length,h=r.length,y=m,g={};y--;)g[t[y].key]=y;var _=[],v={},b={};for(y=h;y--;){var x=p(s,r,y),C=n(x),w=a[C];w?o&&w.p(i,x):(w=u(e,C,x)).c(),_[y]=v[C]=w,C in g&&(b[C]=Math.abs(y-g[C]))}var k={},T={};function S(t){t[f](c,d),a[t.key]=t,d=t.first,h--}for(;m&&h;){var N=_[h-1],H=t[m-1],M=N.key,O=H.key;N===H?(d=N.first,m--,h--):v[O]?!a[M]||k[M]?S(N):T[O]?m--:b[M]>b[O]?(T[M]=!0,S(N)):(k[O]=!0,m--):(l(H,a),m--)}for(;m--;){v[(H=t[m]).key]||l(H,a)}for(;h;)S(_[h-1]);return _}function nt(t,e){t.d(1),e[t.key]=null}function ot(t){t.parentNode.removeChild(t)}function st(t,e,i,n){t.removeEventListener(e,i,n)}function d(){return document.createComment("")}function s(t,e){t.data=""+e}function r(t,e){for(;t.nextSibling&&t.nextSibling!==e;)t.parentNode.removeChild(t.nextSibling)}function a(t,e){for(var i in e)t[i]=e[i];return t}function p(t){t._lock=!0,y(t._beforecreate),y(t._oncreate),y(t._aftercreate),t._lock=!1}function y(t){for(;t&&t.length;)t.shift()()}function g(){}return a(o.prototype,{destroy:function(t){this.destroy=g,this.fire("destroy"),this.set=g,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var i=t in this._handlers&&this._handlers[t].slice();if(!i)return;for(var n=0;n<i.length;n+=1){var o=i[n];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var i=this._handlers[t]||(this._handlers[t]=[]);return i.push(e),{cancel:function(){var t=i.indexOf(e);~t&&i.splice(t,1)}}},set:function(t){if(this._set(a({},t)),this.root._lock)return;p(this.root)},_set:function(t){var e=this._state,i={},n=!1;for(var o in t=a(this._staged,t),this._staged={},t)this._differs(t[o],e[o])&&(i[o]=n=!0);if(!n)return;this._state=a(a({},e),t),this._recompute(i,this._state),this._bind&&this._bind(i,this._state);this._fragment&&(this.fire("state",{changed:i,current:this._state,previous:e}),this._fragment.p(i,this._state),this.fire("update",{changed:i,current:this._state,previous:e}))},_stage:function(t){a(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,e){return t!=t?e==e:t!==e||t&&"object"===(void 0===t?"undefined":_typeof(t))||"function"==typeof t}}),a(o.prototype,i),o.prototype._recompute=function(t,e){t.styling&&this._differs(e._styles,e._styles=function(t){var e=t.styling;return"object"===(void 0===e?"undefined":_typeof(e))?e:h.styling[e]}(e))&&(t._styles=!0),t.icons&&this._differs(e._icons,e._icons=function(t){var e=t.icons;return"object"===(void 0===e?"undefined":_typeof(e))?e:h.icons[e]}(e))&&(t._icons=!0),t.width&&this._differs(e._widthStyle,e._widthStyle=function(t){var e=t.width;return"string"==typeof e?"width: "+e+";":""}(e))&&(t._widthStyle=!0),t.minHeight&&this._differs(e._minHeightStyle,e._minHeightStyle=function(t){var e=t.minHeight;return"string"==typeof e?"min-height: "+e+";":""}(e))&&(t._minHeightStyle=!0)},(h=o).VERSION="4.0.0",h.defaultStack={dir1:"down",dir2:"left",firstpos1:25,firstpos2:25,spacing1:36,spacing2:36,push:"bottom",context:window&&document.body},h.defaults={title:!1,titleTrusted:!1,text:!1,textTrusted:!1,styling:"brighttheme",icons:"brighttheme",addClass:"",cornerClass:"",autoDisplay:!0,width:"360px",minHeight:"16px",type:"notice",icon:!0,animation:"fade",animateSpeed:"normal",shadow:!0,hide:!0,delay:8e3,mouseReset:!0,remove:!0,destroy:!0,stack:h.defaultStack,modules:{}},h.notices=[],h.modules={},h.modulesPrependContainer=[],h.modulesAppendContainer=[],h.alert=function(t){return new h(e(t))},h.notice=function(t){return new h(e(t,"notice"))},h.info=function(t){return new h(e(t,"info"))},h.success=function(t){return new h(e(t,"success"))},h.error=function(t){return new h(e(t,"error"))},h.removeAll=function(){h.closeAll()},h.closeAll=function(){for(var t=0;t<h.notices.length;t++)h.notices[t].close&&h.notices[t].close(!1)},h.removeStack=function(t){h.closeStack(t)},h.closeStack=function(t){if(!1!==t)for(var e=0;e<h.notices.length;e++)h.notices[e].close&&h.notices[e].get().stack===t&&h.notices[e].close(!1)},h.positionAll=function(){if(n&&clearTimeout(n),n=null,0<h.notices.length){for(var t=0;t<h.notices.length;t++){var e=h.notices[t].get().stack;e&&(e.overlay&&m(e),e.nextpos1=e.firstpos1,e.nextpos2=e.firstpos2,e.addpos2=0)}for(var i=0;i<h.notices.length;i++)h.notices[i].position()}else delete h.defaultStack.nextpos1,delete h.defaultStack.nextpos2},h.styling={brighttheme:{container:"brighttheme",notice:"brighttheme-notice",info:"brighttheme-info",success:"brighttheme-success",error:"brighttheme-error"},bootstrap3:{container:"alert",notice:"alert-warning",info:"alert-info",success:"alert-success",error:"alert-danger",icon:"ui-pnotify-icon-bs3"},bootstrap4:{container:"alert",notice:"alert-warning",info:"alert-info",success:"alert-success",error:"alert-danger",icon:"ui-pnotify-icon-bs4",title:"ui-pnotify-title-bs4"}},h.icons={brighttheme:{notice:"brighttheme-icon-notice",info:"brighttheme-icon-info",success:"brighttheme-icon-success",error:"brighttheme-icon-error"},bootstrap3:{notice:"glyphicon glyphicon-exclamation-sign",info:"glyphicon glyphicon-info-sign",success:"glyphicon glyphicon-ok-sign",error:"glyphicon glyphicon-warning-sign"},fontawesome4:{notice:"fa fa-exclamation-circle",info:"fa fa-info-circle",success:"fa fa-check-circle",error:"fa fa-exclamation-triangle"},fontawesome5:{notice:"fas fa-exclamation-circle",info:"fas fa-info-circle",success:"fas fa-check-circle",error:"fas fa-exclamation-triangle"}},window&&document.body?t():document.addEventListener("DOMContentLoaded",t),o}();

//PNotify.js
var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},PNotifyAnimate=function(t){"use strict";t=t&&t.__esModule?t.default:t;var e;function n(e){!function(e,t){e._handlers=a(),e._slots=a(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}(this,e),this._state=s(_extends({_notice:null,_options:{}},t.modules.Animate.defaults),e.data),this._intro=!0,this._fragment=(this._state,{c:i,m:i,p:i,d:i}),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}function i(){}function s(e,t){for(var n in t)e[n]=t[n];return e}function a(){return Object.create(null)}function o(e){for(;e&&e.length;)e.shift()()}return s(n.prototype,{destroy:function(e){this.destroy=i,this.fire("destroy"),this.set=i,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(!n)return;for(var i=0;i<n.length;i+=1){var a=n[i];if(!a.__calling)try{a.__calling=!0,a.call(this,t)}finally{a.__calling=!1}}},on:function(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}},set:function(e){if(this._set(s({},e)),this.root._lock)return;!function(e){e._lock=!0,o(e._beforecreate),o(e._oncreate),o(e._aftercreate),e._lock=!1}(this.root)},_set:function(e){var t=this._state,n={},i=!1;for(var a in e=s(this._staged,e),this._staged={},e)this._differs(e[a],t[a])&&(n[a]=i=!0);if(!i)return;this._state=s(s({},t),e),this._recompute(n,this._state),this._bind&&this._bind(n,this._state);this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:t}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:t}))},_stage:function(e){s(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:function(e,t){return e!=e?t==t:e!==t||e&&"object"===(void 0===e?"undefined":_typeof(e))||"function"==typeof e}}),s(n.prototype,{initModule:function(e){this.set(e),this.setUpAnimations()},update:function(){this.setUpAnimations()},setUpAnimations:function(){var e=this.get(),t=e._notice,n=e._options;if(e.animate){t.set({animation:"none"}),t._animateIn||(t._animateIn=t.animateIn),t._animateOut||(t._animateOut=t.animateOut),t.animateIn=this.animateIn.bind(this),t.animateOut=this.animateOut.bind(this);var i=250;"slow"===n.animateSpeed?i=400:"fast"===n.animateSpeed?i=100:0<n.animateSpeed&&(i=n.animateSpeed),i/=1e3,t.refs.elem.style.WebkitAnimationDuration=i+"s",t.refs.elem.style.MozAnimationDuration=i+"s",t.refs.elem.style.animationDuration=i+"s"}else t._animateIn&&t._animateOut&&(t.animateIn=t._animateIn,delete t._animateIn,t.animateOut=t._animateOut,delete t._animateOut)},animateIn:function(e){var t=this.get()._notice;function n(){t.refs.elem.removeEventListener("webkitAnimationEnd",n),t.refs.elem.removeEventListener("mozAnimationEnd",n),t.refs.elem.removeEventListener("MSAnimationEnd",n),t.refs.elem.removeEventListener("oanimationend",n),t.refs.elem.removeEventListener("animationend",n),t.set({_animatingClass:"ui-pnotify-in animated"}),e&&e.call(),t.set({_animating:!1})}t.set({_animating:"in"}),t.refs.elem.addEventListener("webkitAnimationEnd",n),t.refs.elem.addEventListener("mozAnimationEnd",n),t.refs.elem.addEventListener("MSAnimationEnd",n),t.refs.elem.addEventListener("oanimationend",n),t.refs.elem.addEventListener("animationend",n),t.set({_animatingClass:"ui-pnotify-in animated "+this.get().inClass})},animateOut:function(e){var t=this.get()._notice;function n(){t.refs.elem.removeEventListener("webkitAnimationEnd",n),t.refs.elem.removeEventListener("mozAnimationEnd",n),t.refs.elem.removeEventListener("MSAnimationEnd",n),t.refs.elem.removeEventListener("oanimationend",n),t.refs.elem.removeEventListener("animationend",n),t.set({_animatingClass:"animated"}),e&&e.call(),t.set({_animating:!1})}t.set({_animating:"out"}),t.refs.elem.addEventListener("webkitAnimationEnd",n),t.refs.elem.addEventListener("mozAnimationEnd",n),t.refs.elem.addEventListener("MSAnimationEnd",n),t.refs.elem.addEventListener("oanimationend",n),t.refs.elem.addEventListener("animationend",n),t.set({_animatingClass:"ui-pnotify-in animated "+this.get().outClass})}}),n.prototype._recompute=i,(e=n).key="Animate",e.defaults={animate:!1,inClass:"",outClass:""},e.init=function(i){return i.attention=function(e,t){function n(){i.refs.container.removeEventListener("webkitAnimationEnd",n),i.refs.container.removeEventListener("mozAnimationEnd",n),i.refs.container.removeEventListener("MSAnimationEnd",n),i.refs.container.removeEventListener("oanimationend",n),i.refs.container.removeEventListener("animationend",n),i.refs.container.classList.remove(e),t&&t.call(i)}i.refs.container.addEventListener("webkitAnimationEnd",n),i.refs.container.addEventListener("mozAnimationEnd",n),i.refs.container.addEventListener("MSAnimationEnd",n),i.refs.container.addEventListener("oanimationend",n),i.refs.container.addEventListener("animationend",n),i.refs.container.classList.add("animated"),i.refs.container.classList.add(e)},new e({target:document.body})},t.modules.Animate=e,n}(PNotify);



//emoji-mart.js
!function(e){var t={};function n(i){if(t[i])return t[i].exports;var o=t[i]={i:i,l:!1,exports:{}};return e[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(i,o,function(t){return e[t]}.bind(null,o));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=13)}([function(e,t,n){var i=n(6),o=n(16),r="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103,s=/^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,a=i.options.event;function l(e){return p.bind(null,e)}function u(e,t,n){return i.render(e,t),"function"==typeof n&&n(),null!=e?e.__c:null}i.options.event=function(e){return a&&(e=a(e)),e.persist=Object,e.nativeEvent=e,e};var c=function(){};function d(e){return u(i.h(c,{context:this.context},e.vnode),e.container),null}function h(e,t){return i.h(d,{vnode:e,container:t})}c.prototype.getChildContext=function(){return this.props.context},c.prototype.render=function(e){return e.children};var f=function(e,t){return null==e?null:(e=i.toChildArray(e)).map(t)},m={map:f,forEach:f,count:function(e){return e?i.toChildArray(e).length:0},only:function(e){if(1!==(e=i.toChildArray(e)).length)throw new Error("Children.only() expects only one child.");return e[0]},toArray:i.toChildArray};function p(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var n=i.h.apply(void 0,e),o=n.type,r=n.props;return"function"!=typeof o&&(r.defaultValue&&(r.value||0===r.value||(r.value=r.defaultValue),delete r.defaultValue),Array.isArray(r.value)&&r.multiple&&"select"===o&&(i.toChildArray(r.children).forEach(function(e){-1!==r.value.indexOf(e.props.value)&&(e.props.selected=!0)}),delete r.value),function(e,t){var n,i,o;for(o in t)if(n=s.test(o))break;if(n)for(o in i=e.props={},t)i[s.test(o)?o.replace(/([A-Z0-9])/,"-$1").toLowerCase():o]=t[o]}(n,r)),n.preactCompatNormalized=!1,g(n)}function g(e){return e.preactCompatNormalized=!0,function(e){var t=e.props;(t.class||t.className)&&(w.enumerable="className"in t,t.className&&(t.class=t.className),Object.defineProperty(t,"className",w))}(e),function(t){var n=e.type,i=e.props;if(i&&"string"==typeof n){var o={};for(var r in i)o[r.toLowerCase()]=r;if(o.ondoubleclick&&(i.ondblclick=i[o.ondoubleclick],delete i[o.ondoubleclick]),o.onbeforeinput&&(i.onbeforeinput=i[o.onbeforeinput],delete i[o.onbeforeinput]),o.onchange&&("textarea"===n||"input"===n.toLowerCase()&&!/^fil|che|rad/i.test(i.type))){var s=o.oninput||"oninput";i[s]||(i[s]=i[o.onchange],delete i[o.onchange])}}}(),e}function v(e){if(!_(e))return e;var t=g(i.cloneElement.apply(null,arguments));return t.$$typeof=r,t}function _(e){return null!=e&&e.$$typeof===r}function y(e){return null!=e.__t&&(i.render(null,e),!0)}var w={configurable:!0,get:function(){return this.class}};function b(e,t){for(var n in e)if(!(n in t))return!0;for(var i in t)if(e[i]!==t[i])return!0;return!1}function j(e){return e&&(e.base||1===e.nodeType&&e)||null}var k=function(e){function t(t){e.call(this,t),this.isPureReactComponent=!0}return e&&(t.__proto__=e),(t.prototype=Object.create(e&&e.prototype)).constructor=t,t.prototype.shouldComponentUpdate=function(e,t){return b(this.props,e)||b(this.state,t)},t}(i.Component);function E(e,t){function n(e){var n=this.props.ref,i=n==e.ref;return i||(n.call?n(null):n.current=null),(null==t?b(this.props,e):!t(this.props,e))||!i}function o(t){return this.shouldComponentUpdate=n,i.h(e,Object.assign({},t))}return o.displayName="Memo("+(e.displayName||e.name)+")",o.n=!0,o}function C(e,t){Object.defineProperty(e.prototype,"UNSAFE_"+t,{configurable:!0,get:function(){return this[t]},set:function(e){this[t]=e}})}function S(e){function t(t){var n=t.ref;return delete t.ref,e(t,n)}return t.n=!0,t.displayName="ForwardRef("+(e.displayName||e.name)+")",t}i.Component.prototype.isReactComponent={},C(i.Component,"componentWillMount"),C(i.Component,"componentWillReceiveProps"),C(i.Component,"componentWillUpdate");var P=i.options.vnode;i.options.vnode=function(e){e.$$typeof=r;var t=e.type;null!=t&&t.n&&null!=e.ref&&(e.props.ref=e.ref,e.ref=null),P&&P(e)};var R=Object.assign({},o,{version:"16.8.0",Children:m,render:u,hydrate:u,unmountComponentAtNode:y,createPortal:h,createElement:p,createContext:i.createContext,createFactory:l,cloneElement:v,createRef:i.createRef,Fragment:i.Fragment,isValidElement:_,findDOMNode:j,Component:i.Component,PureComponent:k,memo:E,forwardRef:S});Object.keys(o).forEach(function(e){t[e]=o[e]}),t.createContext=i.createContext,t.createRef=i.createRef,t.Fragment=i.Fragment,t.Component=i.Component,t.version="16.8.0",t.Children=m,t.render=u,t.hydrate=u,t.unmountComponentAtNode=y,t.createPortal=h,t.createElement=p,t.createFactory=l,t.cloneElement=v,t.isValidElement=_,t.findDOMNode=j,t.PureComponent=k,t.memo=E,t.forwardRef=S,t.default=R},function(e,t,n){e.exports=n(17)()},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=Object;t.default=i.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.throttleIdleTask=t.measureScrollbar=t.unifiedToNative=t.deepMerge=t.intersect=t.uniq=t.getSanitizedData=t.getData=void 0;var i=s(n(19)),o=n(5),r=s(n(20));function s(e){return e&&e.__esModule?e:{default:e}}const a=JSON,l=/^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/,u=["1F3FA","1F3FB","1F3FC","1F3FD","1F3FE","1F3FF"];function c(e){var t=e.split("-").map(e=>`0x${e}`);return r.default.apply(null,t)}function d(e,t,n,r){var s={};if("string"==typeof e){let n=e.match(l);if(n&&(e=n[1],n[2]&&(t=parseInt(n[2],10))),r.aliases.hasOwnProperty(e)&&(e=r.aliases[e]),!r.emojis.hasOwnProperty(e))return null;s=r.emojis[e]}else e.id&&(r.aliases.hasOwnProperty(e.id)&&(e.id=r.aliases[e.id]),r.emojis.hasOwnProperty(e.id)&&(s=r.emojis[e.id],t||(t=e.skin)));if((0,i.default)(s).length||((s=e).custom=!0,s.search||(s.search=(0,o.buildSearch)(e))),s.emoticons||(s.emoticons=[]),s.variations||(s.variations=[]),s.skin_variations&&t>1&&n){s=JSON.parse(a.stringify(s));var c=u[t-1],d=s.skin_variations[c];if(!d.variations&&s.variations&&delete s.variations,null==d[`has_img_${n}`]||d[`has_img_${n}`]){s.skin_tone=t;for(let e in d){let t=d[e];s[e]=t}}}return s.variations&&s.variations.length&&((s=JSON.parse(a.stringify(s))).unified=s.variations.shift()),s}function h(e){return e.reduce((e,t)=>(-1===e.indexOf(t)&&e.push(t),e),[])}t.getData=d,t.getSanitizedData=function(){return function(e){var{name:t,short_names:n,skin_tone:i,skin_variations:o,emoticons:r,unified:s,custom:a,imageUrl:l}=e,u=e.id||n[0],d=`:${u}:`;return a?{id:u,name:t,colons:d,emoticons:r,custom:a,imageUrl:l}:(i&&(d+=`:skin-tone-${i}:`),{id:u,name:t,colons:d,emoticons:r,unified:s.toLowerCase(),skin:i||(o?1:null),native:c(s)})}(d(...arguments))},t.uniq=h,t.intersect=function(e,t){const n=h(e),i=h(t);return n.filter(e=>i.indexOf(e)>=0)},t.deepMerge=function e(t,n){var i={};for(let o in t){let r=t[o],s=r;n.hasOwnProperty(o)&&(s=n[o]),"object"==typeof s&&(s=e(r,s)),i[o]=s}return i},t.unifiedToNative=c,t.measureScrollbar=function(){if("undefined"==typeof document)return 0;const e=document.createElement("div");e.style.width="100px",e.style.height="100px",e.style.overflow="scroll",e.style.position="absolute",e.style.top="-9999px",document.body.appendChild(e);const t=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),t},t.throttleIdleTask=function(e){const t="function"==typeof requestIdleCallback?requestIdleCallback:setTimeout;let n=!1;return function(){n||(n=!0,t(()=>{n=!1,e()}))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=c(n(2)),o=c(n(0)),r=c(n(1)),s=n(3),a=n(5),l=n(10),u=n(11);function c(e){return e&&e.__esModule?e:{default:e}}const d=e=>{var{emoji:t,skin:n,set:i,data:o}=e;return(0,s.getData)(t,n,i,o)},h=e=>{var{sheet_x:t,sheet_y:n}=d(e);return`${100/(e.sheetColumns-1)*t}% ${100/(e.sheetRows-1)*n}%`},f=e=>{var{emoji:t,skin:n,set:i,data:o}=e;return(0,s.getSanitizedData)(t,n,i,o)},m=e=>!isNaN(e-parseFloat(e)),p=e=>{e.data.compressed&&(0,a.uncompress)(e.data);for(let t in p.defaultProps)null==e[t]&&null!=p.defaultProps[t]&&(e[t]=p.defaultProps[t]);let t=d(e);if(!t)return e.fallback?e.fallback(null,e):null;let{unified:n,custom:r,short_names:l,imageUrl:u}=t,c={},g=e.children,v="emoji-mart-emoji",_=n&&(0,s.unifiedToNative)(n),y=[_].concat(l).filter(Boolean).join(", "),w=null;if(!n&&!r)return e.fallback?e.fallback(t,e):null;if(e.tooltip&&(w=l[0]),e.native&&n)v+=" emoji-mart-emoji-native",c={fontSize:e.size},g=_,e.forceSize&&(c.display="inline-block",c.width=e.size,c.height=e.size,c.wordBreak="keep-all");else if(r)v+=" emoji-mart-emoji-custom",c={width:e.size,height:e.size,display:"inline-block"},c=t.spriteUrl?(0,i.default)({},c,{backgroundImage:`url(${t.spriteUrl})`,backgroundSize:`${100*e.sheetColumns}% ${100*e.sheetRows}%`,backgroundPosition:h(e)}):(0,i.default)({},c,{backgroundImage:`url(${u})`,backgroundSize:"contain"});else{if(!(null==t[`has_img_${e.set}`]||t[`has_img_${e.set}`]))return e.fallback?e.fallback(t,e):null;c={width:e.size,height:e.size,display:"inline-block",backgroundImage:`url(${e.backgroundImageFn(e.set,e.sheetSize)})`,backgroundSize:`${100*e.sheetColumns}% ${100*e.sheetRows}%`,backgroundPosition:h(e)}}return e.php?`<button style='${c=(e=>{let t=document.createElement("div");for(let n in e){let i=e[n];m(i)&&(i+="px"),t.style[n]=i}return t.getAttribute("style")})(c)}' aria-label='${y}' ${w?`title='${w}'`:""} class='${v}'>${g||""}</button>`:o.default.createElement("button",{onClick:t=>((e,t)=>{if(t.onClick){var{onClick:n}=t;n(f(t),e)}})(t,e),onMouseEnter:t=>((e,t)=>{if(t.onOver){var{onOver:n}=t;n(f(t),e)}})(t,e),onMouseLeave:t=>((e,t)=>{if(t.onLeave){var{onLeave:n}=t;n(f(t),e)}})(t,e),"aria-label":y,title:w,className:v},o.default.createElement("span",{style:c},g))};p.propTypes=(0,i.default)({},l.EmojiPropTypes,{data:r.default.object.isRequired}),p.defaultProps=u.EmojiDefaultProps,t.default=p},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i={name:"a",unified:"b",non_qualified:"c",has_img_apple:"d",has_img_google:"e",has_img_twitter:"f",has_img_emojione:"g",has_img_facebook:"h",has_img_messenger:"i",keywords:"j",sheet:"k",emoticons:"l",text:"m",short_names:"n",added_in:"o"},o=e=>{const t=[];var n=(e,n)=>{e&&(Array.isArray(e)?e:[e]).forEach(e=>{(n?e.split(/[-|_|\s]+/):[e]).forEach(e=>{e=e.toLowerCase(),-1==t.indexOf(e)&&t.push(e)})})};return n(e.short_names,!0),n(e.name,!0),n(e.keywords,!1),n(e.emoticons,!1),t.join(",")};t.buildSearch=o,t.compress=(e=>{e.short_names=e.short_names.filter(t=>t!==e.short_name),delete e.short_name,e.sheet=[e.sheet_x,e.sheet_y],delete e.sheet_x,delete e.sheet_y,e.added_in=parseInt(e.added_in),6===e.added_in&&delete e.added_in;for(let t in i)e[i[t]]=e[t],delete e[t];for(let t in e){let n=e[t];Array.isArray(n)&&!n.length?delete e[t]:"string"!=typeof n||n.length?null===n&&delete e[t]:delete e[t]}}),t.uncompress=(e=>{e.compressed=!1;for(let t in e.emojis){let n=e.emojis[t];for(let e in i)n[e]=n[i[e]],delete n[i[e]];n.short_names||(n.short_names=[]),n.short_names.unshift(t),n.sheet_x=n.sheet[0],n.sheet_y=n.sheet[1],delete n.sheet,n.text||(n.text=""),n.added_in||(n.added_in=6),n.added_in=n.added_in.toFixed(1),n.search=o(n)}})},function(e,t,n){"use strict";n.r(t),n.d(t,"render",function(){return M}),n.d(t,"hydrate",function(){return A}),n.d(t,"createElement",function(){return f}),n.d(t,"h",function(){return f}),n.d(t,"Fragment",function(){return g}),n.d(t,"createRef",function(){return p}),n.d(t,"Component",function(){return _}),n.d(t,"cloneElement",function(){return F}),n.d(t,"createContext",function(){return N}),n.d(t,"toChildArray",function(){return j}),n.d(t,"options",function(){return i});var i,o,r,s,a,l={},u=[],c=/acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;function d(e,t){for(var n in t)e[n]=t[n];return e}function h(e){var t=e.parentNode;t&&t.removeChild(e)}function f(e,t,n){var i,o,r,s,a=arguments;if(null==t&&(t={}),arguments.length>3)for(n=[n],i=3;i<arguments.length;i++)n.push(a[i]);if(null!=n&&(t.children=n),null!=e&&null!=e.defaultProps)for(o in e.defaultProps)void 0===t[o]&&(t[o]=e.defaultProps[o]);return(r=t.ref)&&delete t.ref,(s=t.key)&&delete t.key,m(e,t,null,s,r)}function m(e,t,n,o,r){var s={type:e,props:t,text:n,key:o,ref:r,__k:null,__e:null,n:null,__c:null};return i.vnode&&i.vnode(s),s}function p(){return{}}function g(){}function v(e){return null==e||"boolean"==typeof e?null:"string"==typeof e||"number"==typeof e?m(null,null,e,null,null):Array.isArray(e)?f(g,null,e):null!=e.__e?m(e.type,e.props,e.text,e.key,null):e}function _(e,t){this.props=e,this.context=t}function y(e){!e.__d&&(e.__d=!0)&&1===o.push(e)&&(i.debounceRendering||r)(w)}function w(){for(var e;e=o.pop();)e.__d&&e.forceUpdate(!1)}function b(e,t,n,i,o,r,s,a){var c,d,f,m,p,_,y,w,b,k,E=t.__k||j(t.props.children,t.__k=[],v),S=null!=n&&n!=l&&n.__k||u,P=S.length,R=P?S[0]&&S[0].__e:null;if(null!=r)for(d=0;d<r.length;d++)if(null!=r[d]){R=r[d];break}for(d=0;d<E.length;d++){if(c=E[d]=v(E[d]),_=p=null,null!=(m=S[d])&&(null==c.key&&null==m.key?c.type===m.type:c.key===m.key))p=d;else for(f=0;f<P;f++)if(null!=(m=S[f])&&(null==c.key&&null==m.key?c.type===m.type:c.key===m.key)){p=f;break}if(null!=p&&(_=S[p],S[p]=null),w=null!=R&&R.nextSibling,y=C(null==_?null:_.__e,e,c,_,i,o,r,s,a,null),null!=c&&null!=y){if(k=document.activeElement,null!=c.n)y=c.n;else if(r==_||y!=R||null==y.parentNode)e:if(null==R||R.parentNode!==e)e.appendChild(y);else{for(b=R,f=0;(b=b.nextSibling)&&f++<P/2;)if(b===y)break e;e.insertBefore(y,R)}k!==document.activeElement&&k.focus(),R=null!=y?y.nextSibling:w}}if(null!=r&&t.type!==g)for(d=r.length;d--;)null!=r[d]&&h(r[d]);for(d=P;d--;)null!=S[d]&&x(S[d],a)}function j(e,t,n){if(null==t&&(t=[]),null==e||"boolean"==typeof e);else if(Array.isArray(e))for(var i=0;i<e.length;i++)j(e[i],t);else t.push(n?n(e):e);return t}function k(e,t,n,i,o){var r,a,l,u,d,h;if("class"!==t&&"className"!==t||(t=o?"class":"className"),"style"===t)if(a=e.style,"string"==typeof n)a.cssText=n;else{for(l in"string"==typeof i&&(a.cssText=""),i)null!=n&&l in n||a.setProperty(l.replace(s,"-"),"");for(u in n)r=n[u],null!=i&&r===i[u]||a.setProperty(u.replace(s,"-"),"number"==typeof r&&!1===c.test(u)?r+"px":r)}else{if("dangerouslySetInnerHTML"===t)return;"o"===t[0]&&"n"===t[1]?(d=t!==(t=t.replace(/Capture$/,"")),h=t.toLowerCase(),t=(h in e?h:t).substring(2),n?i||e.addEventListener(t,E,d):e.removeEventListener(t,E,d),(e.l||(e.l={}))[t]=n):"list"!==t&&!o&&t in e?e[t]=null==n?"":n:null==n||!1===n?e.removeAttribute(t):"function"!=typeof n&&e.setAttribute(t,n)}}function E(e){return this.l[e.type](i.event?i.event(e):e)}function C(e,t,n,o,r,s,a,u,c,h){var f,m,p,y,w,j,k,E,S,M,A,F,N,z;if(null==o||null==n||o.type!==n.type){if(null!=o&&x(o,c),null==n)return null;e=null,o=l}i.diff&&i.diff(n),p=!1,k=n.type;try{e:if(o.type===g||k===g)b(t,n,o,r,s,a,u,f),n.__k.length&&(e=n.__k[0].__e,n.n=n.__k[n.__k.length-1].__e);else if("function"==typeof k){if(M=(S=k.contextType)&&r[S.__c],A=null!=S?M?M.props.value:S.__p:r,o.__c?E=(f=n.__c=o.__c).__p:(p=!0,k.prototype&&k.prototype.render?n.__c=f=new k(n.props,A):(n.__c=f=new _(n.props,A),f.constructor=k,f.render=O),f.__a=c,M&&M.sub(f),f.props=n.props,f.state||(f.state={}),f.context=A,f.__n=r,f.__d=!0,f.__h=[]),f.__v=n,F=f.__s||f.state,null!=k.getDerivedStateFromProps&&(w=d({},f.state),F===f.state&&(F=d({},F)),d(F,k.getDerivedStateFromProps(n.props,F))),p)null==k.getDerivedStateFromProps&&null!=f.componentWillMount&&f.componentWillMount(),null!=f.componentDidMount&&u.push(f);else{if(null==k.getDerivedStateFromProps&&null==h&&null!=f.componentWillReceiveProps&&(f.componentWillReceiveProps(n.props,A),F=f.__s||f.state),!h&&null!=f.shouldComponentUpdate&&!1===f.shouldComponentUpdate(n.props,F,A)){f.props=n.props,f.state=F,f.__d=!1;break e}null!=f.componentWillUpdate&&f.componentWillUpdate(n.props,F,A)}y=f.props,w||(w=f.state),j=f.context=A,f.props=n.props,f.state=F,i.render&&i.render(n),N=f.__t,z=f.__t=v(f.render(f.props,f.state,f.context)),f.__d=!1,null!=f.getChildContext&&(r=d(d({},r),f.getChildContext())),p||null==f.getSnapshotBeforeUpdate||(j=f.getSnapshotBeforeUpdate(y,w)),f.base=e=C(e,t,z,N,r,s,a,u,f,null),null!=z&&(n.n=z.n),f.__P=t,n.ref&&R(n.ref,f,c)}else e=P(e,n,o,r,s,a,u,c),n.ref&&o.ref!==n.ref&&R(n.ref,e,c);if(n.__e=e,null!=f){for(;m=f.__h.pop();)m.call(f);p||null==y||null==f.componentDidUpdate||f.componentDidUpdate(y,w,j)}E&&(f.__p=null),i.diffed&&i.diffed(n)}catch(e){T(e,c)}return e}function S(e,t){for(var n;n=e.pop();)try{n.componentDidMount()}catch(e){T(e,n.__a)}i.commit&&i.commit(t)}function P(e,t,n,i,o,r,s,a){var l,c,d,h,f,m,p=e;if(o="svg"===t.type||o,null==e&&null!=r)for(l=0;l<r.length;l++)if(null!=(c=r[l])&&(null===t.type?3===c.nodeType:c.localName===t.type)){e=c,r[l]=null;break}if(null==e&&(e=null===t.type?document.createTextNode(t.text):o?document.createElementNS("http://www.w3.org/2000/svg",t.type):document.createElement(t.type),r=null),t.__e=e,null===t.type)null!==p&&e!==p||t.text===n.text||(e.data=t.text);else if(null!=r&&null!=e.childNodes&&(r=u.slice.call(e.childNodes)),t!==n){if(null==(d=n.props)&&(d={},null!=r))for(h=0;h<e.attributes.length;h++)d[e.attributes[h].name]=e.attributes[h].value;f=d.dangerouslySetInnerHTML,((m=t.props.dangerouslySetInnerHTML)||f)&&(m&&f&&m.__html==f.__html||(e.innerHTML=m&&m.__html||"")),t.props.multiple&&(e.multiple=t.props.multiple),b(e,t,n,i,"foreignObject"!==t.type&&o,r,s,a),function(e,t,n,i){var o,r;for(o in t)"children"===o||"key"===o||n&&n[o]==t[o]||k(e,o,t[o],n[o],i);for(r in n)"children"===r||"key"===r||t&&r in t||k(e,r,null,n[r],i)}(e,t.props,d,o)}return e}function R(e,t,n){try{"function"==typeof e?e(t):e.current=t}catch(e){T(e,n)}}function x(e,t,n){var o,r;if(i.unmount&&i.unmount(e),(o=e.ref)&&R(o,null,t),!n&&null==e.n&&(n=null!=(o=e.__e))&&h(o),e.__e=e.n=null,null!=(o=e.__c)){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(e){T(e,t)}o.base=o.__P=null,(o=o.__t)&&x(o,t,n)}else if(o=e.__k)for(r=0;r<o.length;r++)x(o[r],t,n)}function O(e,t,n){return this.constructor(e,n)}function T(e,t){for(;t;t=t.__a)if(!t.__p)try{if(null!=t.constructor.getDerivedStateFromError)t.setState(t.constructor.getDerivedStateFromError(e));else{if(null==t.componentDidCatch)continue;t.componentDidCatch(e)}return y(t.__p=t)}catch(t){e=t}throw e}function M(e,t){var n,i=t.__t;e=f(g,null,[e]),n=[],b(t,t.__t=e,i,l,void 0!==t.ownerSVGElement,i?null:u.slice.call(t.childNodes),n,e),S(n,e)}function A(e,t){t.__t=null,M(e,t)}function F(e,t){return t=d(d({},e.props),t),arguments.length>2&&(t.children=u.slice.call(arguments,2)),m(e.type,t,null,t.key||e.key,t.ref||e.ref)}function N(e){var t,n="__cC"+a++,i={__c:n,__p:e};function o(e,t){return e.children(t)}return o.contextType=i,i.Consumer=o,(t={})[n]=null,i.Provider=function(e){var i,o;return this.getChildContext||(o=[],(i=this).getChildContext=function(){return t[n]=i,t},i.componentDidUpdate=function(){var e=i.props.value;o.map(function(t){return e!==t.context&&(t.context=e,y(t))})},i.sub=function(e){o.push(e);var t=e.componentWillUnmount;e.componentWillUnmount=function(){o.splice(o.indexOf(e),1),t&&t()}}),e.children},i}i={},_.prototype.setState=function(e,t){var n=this.__s!==this.state&&this.__s||(this.__s=d({},this.state));("function"!=typeof e||(e=e(n,this.props)))&&d(n,e),null!=e&&(t&&this.__h.push(t),y(this))},_.prototype.forceUpdate=function(e){var t,n=this.__v,i=this.__v.__e,o=this.__P;o&&(null!=(i=C(i,o,n,n,this.__n,void 0!==o.ownerSVGElement,null,t=[],this.__a,!1!==e))&&i.parentNode!==o&&o.appendChild(i),S(t,n)),e&&e()},_.prototype.render=g,o=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,s=/-?(?=[A-Z])/g,a=0},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.search=t.categories=void 0;var i,o=n(0),r=(i=o)&&i.__esModule?i:{default:i};const s={activity:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12m9.949 11H17.05c.224-2.527 1.232-4.773 1.968-6.113A9.966 9.966 0 0 1 21.949 11M13 11V2.051a9.945 9.945 0 0 1 4.432 1.564c-.858 1.491-2.156 4.22-2.392 7.385H13zm-2 0H8.961c-.238-3.165-1.536-5.894-2.393-7.385A9.95 9.95 0 0 1 11 2.051V11zm0 2v8.949a9.937 9.937 0 0 1-4.432-1.564c.857-1.492 2.155-4.221 2.393-7.385H11zm4.04 0c.236 3.164 1.534 5.893 2.392 7.385A9.92 9.92 0 0 1 13 21.949V13h2.04zM4.982 4.887C5.718 6.227 6.726 8.473 6.951 11h-4.9a9.977 9.977 0 0 1 2.931-6.113M2.051 13h4.9c-.226 2.527-1.233 4.771-1.969 6.113A9.972 9.972 0 0 1 2.051 13m16.967 6.113c-.735-1.342-1.744-3.586-1.968-6.113h4.899a9.961 9.961 0 0 1-2.931 6.113"})),custom:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("g",{transform:"translate(2.000000, 1.000000)"},r.default.createElement("rect",{id:"Rectangle",x:"8",y:"0",width:"3",height:"21",rx:"1.5"}),r.default.createElement("rect",{id:"Rectangle",transform:"translate(9.843, 10.549) rotate(60) translate(-9.843, -10.549) ",x:"8.343",y:"0.049",width:"3",height:"21",rx:"1.5"}),r.default.createElement("rect",{id:"Rectangle",transform:"translate(9.843, 10.549) rotate(-60) translate(-9.843, -10.549) ",x:"8.343",y:"0.049",width:"3",height:"21",rx:"1.5"}))),flags:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M0 0l6.084 24H8L1.916 0zM21 5h-4l-1-4H4l3 12h3l1 4h13L21 5zM6.563 3h7.875l2 8H8.563l-2-8zm8.832 10l-2.856 1.904L12.063 13h3.332zM19 13l-1.5-6h1.938l2 8H16l3-2z"})),foods:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M17 4.978c-1.838 0-2.876.396-3.68.934.513-1.172 1.768-2.934 4.68-2.934a1 1 0 0 0 0-2c-2.921 0-4.629 1.365-5.547 2.512-.064.078-.119.162-.18.244C11.73 1.838 10.798.023 9.207.023 8.579.022 7.85.306 7 .978 5.027 2.54 5.329 3.902 6.492 4.999 3.609 5.222 0 7.352 0 12.969c0 4.582 4.961 11.009 9 11.009 1.975 0 2.371-.486 3-1 .629.514 1.025 1 3 1 4.039 0 9-6.418 9-11 0-5.953-4.055-8-7-8M8.242 2.546c.641-.508.943-.523.965-.523.426.169.975 1.405 1.357 3.055-1.527-.629-2.741-1.352-2.98-1.846.059-.112.241-.356.658-.686M15 21.978c-1.08 0-1.21-.109-1.559-.402l-.176-.146c-.367-.302-.816-.452-1.266-.452s-.898.15-1.266.452l-.176.146c-.347.292-.477.402-1.557.402-2.813 0-7-5.389-7-9.009 0-5.823 4.488-5.991 5-5.991 1.939 0 2.484.471 3.387 1.251l.323.276a1.995 1.995 0 0 0 2.58 0l.323-.276c.902-.78 1.447-1.251 3.387-1.251.512 0 5 .168 5 6 0 3.617-4.187 9-7 9"})),nature:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M15.5 8a1.5 1.5 0 1 0 .001 3.001A1.5 1.5 0 0 0 15.5 8M8.5 8a1.5 1.5 0 1 0 .001 3.001A1.5 1.5 0 0 0 8.5 8"}),r.default.createElement("path",{d:"M18.933 0h-.027c-.97 0-2.138.787-3.018 1.497-1.274-.374-2.612-.51-3.887-.51-1.285 0-2.616.133-3.874.517C7.245.79 6.069 0 5.093 0h-.027C3.352 0 .07 2.67.002 7.026c-.039 2.479.276 4.238 1.04 5.013.254.258.882.677 1.295.882.191 3.177.922 5.238 2.536 6.38.897.637 2.187.949 3.2 1.102C8.04 20.6 8 20.795 8 21c0 1.773 2.35 3 4 3 1.648 0 4-1.227 4-3 0-.201-.038-.393-.072-.586 2.573-.385 5.435-1.877 5.925-7.587.396-.22.887-.568 1.104-.788.763-.774 1.079-2.534 1.04-5.013C23.929 2.67 20.646 0 18.933 0M3.223 9.135c-.237.281-.837 1.155-.884 1.238-.15-.41-.368-1.349-.337-3.291.051-3.281 2.478-4.972 3.091-5.031.256.015.731.27 1.265.646-1.11 1.171-2.275 2.915-2.352 5.125-.133.546-.398.858-.783 1.313M12 22c-.901 0-1.954-.693-2-1 0-.654.475-1.236 1-1.602V20a1 1 0 1 0 2 0v-.602c.524.365 1 .947 1 1.602-.046.307-1.099 1-2 1m3-3.48v.02a4.752 4.752 0 0 0-1.262-1.02c1.092-.516 2.239-1.334 2.239-2.217 0-1.842-1.781-2.195-3.977-2.195-2.196 0-3.978.354-3.978 2.195 0 .883 1.148 1.701 2.238 2.217A4.8 4.8 0 0 0 9 18.539v-.025c-1-.076-2.182-.281-2.973-.842-1.301-.92-1.838-3.045-1.853-6.478l.023-.041c.496-.826 1.49-1.45 1.804-3.102 0-2.047 1.357-3.631 2.362-4.522C9.37 3.178 10.555 3 11.948 3c1.447 0 2.685.192 3.733.57 1 .9 2.316 2.465 2.316 4.48.313 1.651 1.307 2.275 1.803 3.102.035.058.068.117.102.178-.059 5.967-1.949 7.01-4.902 7.19m6.628-8.202c-.037-.065-.074-.13-.113-.195a7.587 7.587 0 0 0-.739-.987c-.385-.455-.648-.768-.782-1.313-.076-2.209-1.241-3.954-2.353-5.124.531-.376 1.004-.63 1.261-.647.636.071 3.044 1.764 3.096 5.031.027 1.81-.347 3.218-.37 3.235"})),objects:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M12 0a9 9 0 0 0-5 16.482V21s2.035 3 5 3 5-3 5-3v-4.518A9 9 0 0 0 12 0zm0 2c3.86 0 7 3.141 7 7s-3.14 7-7 7-7-3.141-7-7 3.14-7 7-7zM9 17.477c.94.332 1.946.523 3 .523s2.06-.19 3-.523v.834c-.91.436-1.925.689-3 .689a6.924 6.924 0 0 1-3-.69v-.833zm.236 3.07A8.854 8.854 0 0 0 12 21c.965 0 1.888-.167 2.758-.451C14.155 21.173 13.153 22 12 22c-1.102 0-2.117-.789-2.764-1.453z"}),r.default.createElement("path",{d:"M14.745 12.449h-.004c-.852-.024-1.188-.858-1.577-1.824-.421-1.061-.703-1.561-1.182-1.566h-.009c-.481 0-.783.497-1.235 1.537-.436.982-.801 1.811-1.636 1.791l-.276-.043c-.565-.171-.853-.691-1.284-1.794-.125-.313-.202-.632-.27-.913-.051-.213-.127-.53-.195-.634C7.067 9.004 7.039 9 6.99 9A1 1 0 0 1 7 7h.01c1.662.017 2.015 1.373 2.198 2.134.486-.981 1.304-2.058 2.797-2.075 1.531.018 2.28 1.153 2.731 2.141l.002-.008C14.944 8.424 15.327 7 16.979 7h.032A1 1 0 1 1 17 9h-.011c-.149.076-.256.474-.319.709a6.484 6.484 0 0 1-.311.951c-.429.973-.79 1.789-1.614 1.789"})),people:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10"}),r.default.createElement("path",{d:"M8 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 8 7M16 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 16 7M15.232 15c-.693 1.195-1.87 2-3.349 2-1.477 0-2.655-.805-3.347-2H15m3-2H6a6 6 0 1 0 12 0"})),places:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M6.5 12C5.122 12 4 13.121 4 14.5S5.122 17 6.5 17 9 15.879 9 14.5 7.878 12 6.5 12m0 3c-.275 0-.5-.225-.5-.5s.225-.5.5-.5.5.225.5.5-.225.5-.5.5M17.5 12c-1.378 0-2.5 1.121-2.5 2.5s1.122 2.5 2.5 2.5 2.5-1.121 2.5-2.5-1.122-2.5-2.5-2.5m0 3c-.275 0-.5-.225-.5-.5s.225-.5.5-.5.5.225.5.5-.225.5-.5.5"}),r.default.createElement("path",{d:"M22.482 9.494l-1.039-.346L21.4 9h.6c.552 0 1-.439 1-.992 0-.006-.003-.008-.003-.008H23c0-1-.889-2-1.984-2h-.642l-.731-1.717C19.262 3.012 18.091 2 16.764 2H7.236C5.909 2 4.738 3.012 4.357 4.283L3.626 6h-.642C1.889 6 1 7 1 8h.003S1 8.002 1 8.008C1 8.561 1.448 9 2 9h.6l-.043.148-1.039.346a2.001 2.001 0 0 0-1.359 2.097l.751 7.508a1 1 0 0 0 .994.901H3v1c0 1.103.896 2 2 2h2c1.104 0 2-.897 2-2v-1h6v1c0 1.103.896 2 2 2h2c1.104 0 2-.897 2-2v-1h1.096a.999.999 0 0 0 .994-.901l.751-7.508a2.001 2.001 0 0 0-1.359-2.097M6.273 4.857C6.402 4.43 6.788 4 7.236 4h9.527c.448 0 .834.43.963.857L19.313 9H4.688l1.585-4.143zM7 21H5v-1h2v1zm12 0h-2v-1h2v1zm2.189-3H2.811l-.662-6.607L3 11h18l.852.393L21.189 18z"})),recent:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M13 4h-2l-.001 7H9v2h2v2h2v-2h4v-2h-4z"}),r.default.createElement("path",{d:"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10"})),symbols:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"24",height:"24"},r.default.createElement("path",{d:"M0 0h11v2H0zM4 11h3V6h4V4H0v2h4zM15.5 17c1.381 0 2.5-1.116 2.5-2.493s-1.119-2.493-2.5-2.493S13 13.13 13 14.507 14.119 17 15.5 17m0-2.986c.276 0 .5.222.5.493 0 .272-.224.493-.5.493s-.5-.221-.5-.493.224-.493.5-.493M21.5 19.014c-1.381 0-2.5 1.116-2.5 2.493S20.119 24 21.5 24s2.5-1.116 2.5-2.493-1.119-2.493-2.5-2.493m0 2.986a.497.497 0 0 1-.5-.493c0-.271.224-.493.5-.493s.5.222.5.493a.497.497 0 0 1-.5.493M22 13l-9 9 1.513 1.5 8.99-9.009zM17 11c2.209 0 4-1.119 4-2.5V2s.985-.161 1.498.949C23.01 4.055 23 6 23 6s1-1.119 1-3.135C24-.02 21 0 21 0h-2v6.347A5.853 5.853 0 0 0 17 6c-2.209 0-4 1.119-4 2.5s1.791 2.5 4 2.5M10.297 20.482l-1.475-1.585a47.54 47.54 0 0 1-1.442 1.129c-.307-.288-.989-1.016-2.045-2.183.902-.836 1.479-1.466 1.729-1.892s.376-.871.376-1.336c0-.592-.273-1.178-.818-1.759-.546-.581-1.329-.871-2.349-.871-1.008 0-1.79.293-2.344.879-.556.587-.832 1.181-.832 1.784 0 .813.419 1.748 1.256 2.805-.847.614-1.444 1.208-1.794 1.784a3.465 3.465 0 0 0-.523 1.833c0 .857.308 1.56.924 2.107.616.549 1.423.823 2.42.823 1.173 0 2.444-.379 3.813-1.137L8.235 24h2.819l-2.09-2.383 1.333-1.135zm-6.736-6.389a1.02 1.02 0 0 1 .73-.286c.31 0 .559.085.747.254a.849.849 0 0 1 .283.659c0 .518-.419 1.112-1.257 1.784-.536-.651-.805-1.231-.805-1.742a.901.901 0 0 1 .302-.669M3.74 22c-.427 0-.778-.116-1.057-.349-.279-.232-.418-.487-.418-.766 0-.594.509-1.288 1.527-2.083.968 1.134 1.717 1.946 2.248 2.438-.921.507-1.686.76-2.3.76"}))},a={search:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"13",height:"13",viewBox:"0 0 20 20",opacity:"0.5"},r.default.createElement("path",{d:"M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"})),delete:()=>r.default.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"13",height:"13",viewBox:"0 0 20 20",opacity:"0.5"},r.default.createElement("path",{d:"M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"}))};t.categories=s,t.search=a},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i="emoji-mart";const o=JSON;var r="undefined"!=typeof window&&"localStorage"in window;let s,a;function l(e,t){if(a)a(e,t);else{if(!r)return;try{window.localStorage[`${i}.${e}`]=o.stringify(t)}catch(e){}}}t.default={update:function(e){for(let t in e)l(t,e[t])},set:l,get:function(e){if(s)return s(e);if(r){try{var t=window.localStorage[`${i}.${e}`]}catch(e){return}return t?JSON.parse(t):void 0}},setNamespace:function(e){i=e},setHandlers:function(e){e||(e={}),s=e.getter,a=e.setter}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i,o=n(8),r=(i=o)&&i.__esModule?i:{default:i};const s=["+1","grinning","kissing_heart","heart_eyes","laughing","stuck_out_tongue_winking_eye","sweat_smile","joy","scream","disappointed","unamused","weary","sob","sunglasses","heart","poop"];let a,l,u={};function c(){l=!0,a=r.default.get("frequently")}t.default={add:function(e){l||c();var{id:t}=e;a||(a=u),a[t]||(a[t]=0),a[t]+=1,r.default.set("last",t),r.default.set("frequently",a)},get:function(e){if(l||c(),!a){u={};const t=[];for(let n=0;n<e;n++)u[s[n]]=e-n,t.push(s[n]);return t}const t=4*e,n=[];for(let e in a)a.hasOwnProperty(e)&&n.push(e);const i=n.sort((e,t)=>a[e]-a[t]).reverse().slice(0,t),o=r.default.get("last");return o&&-1==i.indexOf(o)&&(i.pop(),i.push(o)),i}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.PickerPropTypes=t.EmojiPropTypes=void 0;var i,o=n(1),r=(i=o)&&i.__esModule?i:{default:i};const s={data:r.default.object.isRequired,onOver:r.default.func,onLeave:r.default.func,onClick:r.default.func,fallback:r.default.func,backgroundImageFn:r.default.func,native:r.default.bool,forceSize:r.default.bool,tooltip:r.default.bool,skin:r.default.oneOf([1,2,3,4,5,6]),sheetSize:r.default.oneOf([16,20,32,64]),sheetColumns:r.default.number,sheetRows:r.default.number,set:r.default.oneOf(["apple","google","twitter","emojione","messenger","facebook"]),size:r.default.number.isRequired,emoji:r.default.oneOfType([r.default.string,r.default.object]).isRequired},a={onClick:r.default.func,onSelect:r.default.func,onSkinChange:r.default.func,perLine:r.default.number,emojiSize:r.default.number,i18n:r.default.object,style:r.default.object,title:r.default.string,emoji:r.default.string,color:r.default.string,set:s.set,skin:s.skin,native:r.default.bool,backgroundImageFn:s.backgroundImageFn,sheetSize:s.sheetSize,emojisToShowFilter:r.default.func,showPreview:r.default.bool,showSkinTones:r.default.bool,emojiTooltip:s.tooltip,include:r.default.arrayOf(r.default.string),exclude:r.default.arrayOf(r.default.string),recent:r.default.arrayOf(r.default.string),autoFocus:r.default.bool,custom:r.default.arrayOf(r.default.shape({name:r.default.string.isRequired,short_names:r.default.arrayOf(r.default.string).isRequired,emoticons:r.default.arrayOf(r.default.string),keywords:r.default.arrayOf(r.default.string),imageUrl:r.default.string.isRequired})),skinEmoji:r.default.string,notFound:r.default.func,notFoundEmoji:r.default.string,icons:r.default.object};t.EmojiPropTypes=s,t.PickerPropTypes=a},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i={skin:1,set:"apple",sheetSize:64,sheetColumns:52,sheetRows:52,native:!1,forceSize:!1,tooltip:!1,backgroundImageFn:(e,t)=>`https://unpkg.com/emoji-datasource-${e}@4.0.4/img/${e}/sheets-256/${t}.png`,onOver:()=>{},onLeave:()=>{},onClick:()=>{}},o={onClick:()=>{},onSelect:()=>{},onSkinChange:()=>{},emojiSize:24,perLine:9,i18n:{},style:{},title:"Emoji Mart™",emoji:"department_store",color:"#ae65c5",set:i.set,skin:null,defaultSkin:i.skin,native:i.native,sheetSize:i.sheetSize,backgroundImageFn:i.backgroundImageFn,emojisToShowFilter:null,showPreview:!0,showSkinTones:!0,emojiTooltip:i.tooltip,autoFocus:!1,custom:[],skinEmoji:"",notFound:()=>{},notFoundEmoji:"sleuth_or_spy",icons:{}};t.PickerDefaultProps=o,t.EmojiDefaultProps=i},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=r(n(0)),o=r(n(1));r(n(4));function r(e){return e&&e.__esModule?e:{default:e}}class s extends i.default.PureComponent{constructor(e){super(e),this.state={opened:!1}}handleClick(e){var t=parseInt(e.currentTarget.getAttribute("data-skin")),{onChange:n}=this.props;this.state.opened?(this.setState({opened:!1}),t!=this.props.skin&&n(t)):this.setState({opened:!0})}render(){return null}}t.default=s,s.propTypes={onChange:o.default.func,skin:o.default.number.isRequired},s.defaultProps={onChange:()=>{}}},function(e,t,n){const i=n(14).default,o=n(0),{define:r}=n(29);(async function(){const e=await(await fetch("https://cdn.jsdelivr.net/npm/emoji-mart-vue@2.6.6/data/facebook.json")).json();r({"emoji-picker":t=>o.createElement(i,{set:"twitter",data:e,native:!0,onSelect:e=>emojiSeleted(e),title:"Emoji",showPreview:!0,...t})});const t=document.createElement("emoji-picker");document.body.appendChild(t)})().catch(e=>console.error(e))},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=v(n(2));n(15);var o=v(n(0)),r=v(n(1)),s=function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}(n(7)),a=v(n(8)),l=v(n(9)),u=n(3),c=n(5),d=n(10),h=v(n(21)),f=v(n(22)),m=v(n(24)),p=v(n(27)),g=n(11);function v(e){return e&&e.__esModule?e:{default:e}}const _={search:"Search",clear:"Clear",notfound:"No Emoji Found",skintext:"Choose your default skin tone",categories:{search:"Search Results",recent:"Frequently Used",people:"Smileys & People",nature:"Animals & Nature",foods:"Food & Drink",activity:"Activity",places:"Travel & Places",objects:"Objects",symbols:"Symbols",flags:"Flags",custom:"Custom"},categorieslabel:"Emoji categories",skintones:{1:"Default Skin Tone",2:"Light Skin Tone",3:"Medium-Light Skin Tone",4:"Medium Skin Tone",5:"Medium-Dark Skin Tone",6:"Dark Skin Tone"}};class y extends o.default.PureComponent{constructor(e){super(e),this.RECENT_CATEGORY={id:"recent",name:"Recent",emojis:null},this.CUSTOM_CATEGORY={id:"custom",name:"Custom",emojis:[]},this.SEARCH_CATEGORY={id:"search",name:"Search",emojis:null,anchor:!1},e.data.compressed&&(0,c.uncompress)(e.data),this.data=e.data,this.i18n=(0,u.deepMerge)(_,e.i18n),this.icons=(0,u.deepMerge)(s,e.icons),this.state={skin:e.skin||a.default.get("skin")||e.defaultSkin,firstRender:!0},this.categories=[];let t=[].concat(this.data.categories);e.custom.length>0&&(this.CUSTOM_CATEGORY.emojis=e.custom.map(e=>(0,i.default)({},e,{id:e.short_names[0],custom:!0})),t.push(this.CUSTOM_CATEGORY)),this.hideRecent=!0,null!=e.include&&t.sort((t,n)=>e.include.indexOf(t.id)>e.include.indexOf(n.id)?1:-1);for(let n=0;n<t.length;n++){const i=t[n];let o=!e.include||!e.include.length||e.include.indexOf(i.id)>-1,r=!(!e.exclude||!e.exclude.length)&&e.exclude.indexOf(i.id)>-1;if(o&&!r)if(e.emojisToShowFilter){let t=[];const{emojis:n}=i;for(let i=0;i<n.length;i++){const o=n[i];e.emojisToShowFilter(this.data.emojis[o]||o)&&t.push(o)}if(t.length){let e={emojis:t,name:i.name,id:i.id};this.categories.push(e)}}else this.categories.push(i)}let n=!e.include||!e.include.length||e.include.indexOf(this.RECENT_CATEGORY.id)>-1,o=!(!e.exclude||!e.exclude.length)&&e.exclude.indexOf(this.RECENT_CATEGORY.id)>-1;n&&!o&&(this.hideRecent=!1,this.categories.unshift(this.RECENT_CATEGORY)),this.categories[0]&&(this.categories[0].first=!0),this.categories.unshift(this.SEARCH_CATEGORY),this.setAnchorsRef=this.setAnchorsRef.bind(this),this.handleAnchorClick=this.handleAnchorClick.bind(this),this.setSearchRef=this.setSearchRef.bind(this),this.handleSearch=this.handleSearch.bind(this),this.setScrollRef=this.setScrollRef.bind(this),this.handleScroll=this.handleScroll.bind(this),this.handleScrollPaint=this.handleScrollPaint.bind(this),this.handleEmojiOver=this.handleEmojiOver.bind(this),this.handleEmojiLeave=this.handleEmojiLeave.bind(this),this.handleEmojiClick=this.handleEmojiClick.bind(this),this.handleEmojiSelect=this.handleEmojiSelect.bind(this),this.setPreviewRef=this.setPreviewRef.bind(this),this.handleSkinChange=this.handleSkinChange.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}componentWillReceiveProps(e){e.skin?this.setState({skin:e.skin}):e.defaultSkin&&!a.default.get("skin")&&this.setState({skin:e.defaultSkin})}componentDidMount(){this.state.firstRender&&(this.testStickyPosition(),this.firstRenderTimeout=setTimeout(()=>{this.setState({firstRender:!1})},60))}componentDidUpdate(){this.updateCategoriesSize(),this.handleScroll()}componentWillUnmount(){this.SEARCH_CATEGORY.emojis=null,clearTimeout(this.leaveTimeout),clearTimeout(this.firstRenderTimeout)}testStickyPosition(){const e=document.createElement("div");["","-webkit-","-ms-","-moz-","-o-"].forEach(t=>e.style.position=`${t}sticky`),this.hasStickyPosition=!!e.style.position.length}handleEmojiOver(e){var{preview:t}=this;if(!t)return;const n=this.CUSTOM_CATEGORY.emojis.filter(t=>t.id===e.id)[0];for(let t in n)n.hasOwnProperty(t)&&(e[t]=n[t]);t.setState({emoji:e}),clearTimeout(this.leaveTimeout)}handleEmojiLeave(e){var{preview:t}=this;t&&(this.leaveTimeout=setTimeout(()=>{t.setState({emoji:null})},16))}handleEmojiClick(e,t){this.props.onClick(e,t),this.handleEmojiSelect(e)}handleEmojiSelect(e){this.props.onSelect(e),this.hideRecent||this.props.recent||l.default.add(e);var t=this.categoryRefs["category-1"];if(t){let e=t.maxMargin;t.forceUpdate(),window.requestAnimationFrame(()=>{this.scroll&&(t.memoizeSize(),e!=t.maxMargin&&(this.updateCategoriesSize(),this.handleScrollPaint(),this.SEARCH_CATEGORY.emojis&&t.updateDisplay("none")))})}}handleScroll(){this.waitingForPaint||(this.waitingForPaint=!0,window.requestAnimationFrame(this.handleScrollPaint))}handleScrollPaint(){if(this.waitingForPaint=!1,!this.scroll)return;let e=null;if(this.SEARCH_CATEGORY.emojis)e=this.SEARCH_CATEGORY;else{var t=this.scroll.scrollTop,n=t>(this.scrollTop||0),i=0;for(let o=0,r=this.categories.length;o<r;o++){let r=n?this.categories.length-1-o:o,s=this.categories[r],a=this.categoryRefs[`category-${r}`];if(a){let n=a.handleScroll(t);(!i||a.top<i)&&a.top>0&&(i=a.top),n&&!e&&(e=s)}}t<i?e=this.categories.filter(e=>!(!1===e.anchor))[0]:t+this.clientHeight>=this.scrollHeight&&(e=this.categories[this.categories.length-1])}if(e){let{anchors:t}=this,{name:n}=e;t.state.selected!=n&&t.setState({selected:n})}this.scrollTop=t}handleSearch(e){this.SEARCH_CATEGORY.emojis=e;for(let t=0,n=this.categories.length;t<n;t++){let n=this.categoryRefs[`category-${t}`];if(n&&"Search"!=n.props.name){let t=e?"none":"inherit";n.updateDisplay(t)}}this.forceUpdate(),this.scroll.scrollTop=0,this.handleScroll()}handleAnchorClick(e,t){var n,i=this.categoryRefs[`category-${t}`],{scroll:o,anchors:r}=this;n=(()=>{if(i){let{top:t}=i;e.first?t=0:t+=1,o.scrollTop=t}}),this.SEARCH_CATEGORY.emojis?(this.handleSearch(null),this.search.clear(),window.requestAnimationFrame(n)):n()}handleSkinChange(e){var t={skin:e},{onSkinChange:n}=this.props;this.setState(t),a.default.update(t),n(e)}handleKeyDown(e){let t=!1;switch(e.keyCode){case 13:let n;this.SEARCH_CATEGORY.emojis&&this.SEARCH_CATEGORY.emojis.length&&(n=(0,u.getSanitizedData)(this.SEARCH_CATEGORY.emojis[0],this.state.skin,this.props.set,this.props.data))&&this.handleEmojiSelect(n),t=!0}t&&e.preventDefault()}updateCategoriesSize(){for(let e=0,t=this.categories.length;e<t;e++){let t=this.categoryRefs[`category-${e}`];t&&t.memoizeSize()}if(this.scroll){let e=this.scroll;this.scrollHeight=e.scrollHeight,this.clientHeight=e.clientHeight}}getCategories(){return this.state.firstRender?this.categories.slice(0,3):this.categories}setAnchorsRef(e){this.anchors=e}setSearchRef(e){this.search=e}setPreviewRef(e){this.preview=e}setScrollRef(e){this.scroll=e}setCategoryRef(e,t){this.categoryRefs||(this.categoryRefs={}),this.categoryRefs[e]=t}render(){var{perLine:e,emojiSize:t,set:n,sheetSize:r,sheetColumns:s,sheetRows:a,style:l,title:c,emoji:d,color:g,native:v,backgroundImageFn:_,emojisToShowFilter:y,showPreview:w,showSkinTones:b,emojiTooltip:j,include:k,exclude:E,recent:C,autoFocus:S,skinEmoji:P,notFound:R,notFoundEmoji:x}=this.props,{skin:O}=this.state,T=e*(t+12)+12+2+(0,u.measureScrollbar)();return o.default.createElement("section",{style:(0,i.default)({width:T},l),className:"emoji-mart kkk","aria-label":c,onKeyDown:this.handleKeyDown},o.default.createElement("div",{className:"emoji-mart-bar"},o.default.createElement(h.default,{ref:this.setAnchorsRef,data:this.data,i18n:this.i18n,color:g,categories:this.categories,onAnchorClick:this.handleAnchorClick,icons:this.icons})),o.default.createElement(p.default,{ref:this.setSearchRef,onSearch:this.handleSearch,data:this.data,i18n:this.i18n,emojisToShowFilter:y,include:k,exclude:E,custom:this.CUSTOM_CATEGORY.emojis,autoFocus:S}),o.default.createElement("div",{ref:this.setScrollRef,className:"emoji-mart-scroll",onScroll:this.handleScroll},this.getCategories().map((i,l)=>o.default.createElement(f.default,{ref:this.setCategoryRef.bind(this,`category-${l}`),key:i.name,id:i.id,name:i.name,emojis:i.emojis,perLine:e,native:v,hasStickyPosition:this.hasStickyPosition,data:this.data,i18n:this.i18n,recent:i.id==this.RECENT_CATEGORY.id?C:void 0,custom:i.id==this.RECENT_CATEGORY.id?this.CUSTOM_CATEGORY.emojis:void 0,emojiProps:{native:v,skin:O,size:t,set:n,sheetSize:r,sheetColumns:s,sheetRows:a,forceSize:v,tooltip:j,backgroundImageFn:_,onOver:this.handleEmojiOver,onLeave:this.handleEmojiLeave,onClick:this.handleEmojiClick},notFound:R,notFoundEmoji:x}))),(w||b)&&o.default.createElement("div",{className:"emoji-mart-bar"},o.default.createElement(m.default,{ref:this.setPreviewRef,data:this.data,title:c,emoji:d,showSkinTones:b,showPreview:w,emojiProps:{native:v,size:38,skin:O,set:n,sheetSize:r,sheetColumns:s,sheetRows:a,backgroundImageFn:_},skinsProps:{skin:O,onChange:this.handleSkinChange,skinEmoji:P},i18n:this.i18n})))}}t.default=y,y.propTypes=(0,i.default)({},d.PickerPropTypes,{data:r.default.object.isRequired}),y.defaultProps=(0,i.default)({},g.PickerDefaultProps)},function(e,t,n){"use strict";"undefined"!=typeof window&&function(){for(var e=0,t=["ms","moz","webkit","o"],n=0;n<t.length&&!window.requestAnimationFrame;++n)window.requestAnimationFrame=window[t[n]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[t[n]+"CancelAnimationFrame"]||window[t[n]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(t,n){var i=(new Date).getTime(),o=Math.max(0,16-(i-e)),r=window.setTimeout(function(){t(i+o)},o);return e=i+o,r}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e)})}()},function(e,t,n){var i,o,r=n(6),s=[],a=r.options.render;r.options.render=function(e){a&&a(e),i=0,(o=e.__c).__H&&(o.__H.n.forEach(g),o.__H.n=[])};var l=r.options.diffed;r.options.diffed=function(e){l&&l(e);var t=e.__c;if(t){var n=t.__H;n&&(n.t.forEach(g),n.t=[])}};var u=r.options.unmount;function c(e){var t=o.__H||(o.__H={r:[],n:[],t:[]});return e>=t.r.length&&t.r.push({}),t.r[e]}function d(e,t,n){var r=c(i++);return null==r.__c&&(r.__c=o,r.u=[null==n?_(null,t):n(t),function(t){r.u[0]=e(r.u[0],t),r.__c.setState({})}]),r.u}function h(e,t){var n=c(i++);return v(n.o,t)?(n.o=t,n.e=e,n.u=e()):n.u}r.options.unmount=function(e){u&&u(e);var t=e.__c;if(t){var n=t.__H;n&&n.r.forEach(function(e){return e.i&&e.i()})}};var f=function(){};function m(){s.forEach(function(e){e.f=!1,e.__P&&(e.__H.n.forEach(g),e.__H.n=[])}),s=[]}function p(){setTimeout(m,0)}function g(e){e.i&&e.i();var t=e.u();"function"==typeof t&&(e.i=t)}function v(e,t){return null==e||t.some(function(t,n){return t!==e[n]})}function _(e,t){return"function"==typeof t?t(e):t}"undefined"!=typeof window&&(f=function(e){!e.f&&(e.f=!0)&&1===s.push(e)&&(r.options.requestAnimationFrame?r.options.requestAnimationFrame(m):requestAnimationFrame(p))}),t.useState=function(e){return d(_,e)},t.useReducer=d,t.useEffect=function(e,t){var n=c(i++);v(n.o,t)&&(n.u=e,n.o=t,o.__H.n.push(n),f(o))},t.useLayoutEffect=function(e,t){var n=c(i++);v(n.o,t)&&(n.u=e,n.o=t,o.__H.t.push(n))},t.useRef=function(e){var t=c(i++);return null==t.u&&(t.u={current:e}),t.u},t.useMemo=h,t.useCallback=function(e,t){return h(function(){return e},t)},t.useContext=function(e){var t=o.context[e.__c];if(null==t)return e.__p;var n=c(i++);return null==n.u&&(n.u=!0,t.sub(o)),t.props.value}},function(e,t,n){"use strict";var i=n(18);function o(){}function r(){}r.resetWarningCache=o,e.exports=function(){function e(e,t,n,o,r,s){if(s!==i){var a=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw a.name="Invariant Violation",a}}function t(){return e}e.isRequired=e;var n={array:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:r,resetWarningCache:o};return n.PropTypes=n,n}},function(e,t,n){"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){if("function"!=typeof e&&("object"!=typeof e||null===e))throw new TypeError("Object.keys called on non-object");var t,n,a=[];for(t in e)i.call(e,t)&&a.push(t);if(o)for(n=0;n<s;n++)i.call(e,r[n])&&a.push(r[n]);return a};var i=Object.prototype.hasOwnProperty,o=!{toString:null}.propertyIsEnumerable("toString"),r=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],s=r.length},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=String;t.default=i.fromCodePoint||function(){var e,t,n=[],i=-1,o=arguments.length;if(!o)return"";for(var r="";++i<o;){var s=Number(arguments[i]);if(!isFinite(s)||s<0||s>1114111||Math.floor(s)!=s)throw RangeError("Invalid code point: "+s);s<=65535?n.push(s):(e=55296+((s-=65536)>>10),t=s%1024+56320,n.push(e,t)),(i+1===o||n.length>16384)&&(r+=String.fromCharCode.apply(null,n),n.length=0)}return r}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=r(n(0)),o=r(n(1));function r(e){return e&&e.__esModule?e:{default:e}}class s extends i.default.PureComponent{constructor(e){super(e);let t=e.categories.filter(e=>e.first)[0];this.state={selected:t.name},this.handleClick=this.handleClick.bind(this)}handleClick(e){var t=e.currentTarget.getAttribute("data-index"),{categories:n,onAnchorClick:i}=this.props;i(n[t],t)}render(){var{categories:e,color:t,i18n:n,icons:o}=this.props,{selected:r}=this.state;return i.default.createElement("nav",{className:"emoji-mart-anchors","aria-label":n.categorieslabel},e.map((e,s)=>{var{id:a,name:l,anchor:u}=e,c=l==r;return!1===u?null:i.default.createElement("button",{key:a,"aria-label":n.categories[a],title:n.categories[a],"data-index":s,onClick:this.handleClick,className:`emoji-mart-anchor ${c?"emoji-mart-anchor-selected":""}`,style:{color:c?t:null}},i.default.createElement("div",{className:"emoji-mart-anchor-icon"},o.categories[a]()),i.default.createElement("span",{className:"emoji-mart-anchor-bar",style:{backgroundColor:t}}))}))}}t.default=s,s.propTypes={categories:o.default.array,onAnchorClick:o.default.func,icons:o.default.object},s.defaultProps={categories:[],onAnchorClick:()=>{},icons:{}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=c(n(2)),o=c(n(0)),r=c(n(1)),s=c(n(9)),a=n(3),l=c(n(4)),u=c(n(23));function c(e){return e&&e.__esModule?e:{default:e}}class d extends o.default.Component{constructor(e){super(e),this.data=e.data,this.setContainerRef=this.setContainerRef.bind(this),this.setLabelRef=this.setLabelRef.bind(this)}componentDidMount(){this.margin=0,this.minMargin=0,this.memoizeSize()}shouldComponentUpdate(e,t){var{name:n,perLine:i,native:o,hasStickyPosition:r,emojis:s,emojiProps:a}=this.props,{skin:l,size:u,set:c}=a,{perLine:d,native:h,hasStickyPosition:f,emojis:m,emojiProps:p}=e,{skin:g,size:v,set:_}=p,y=!1;return"Recent"==n&&i!=d&&(y=!0),"Search"==n&&(y=!(s==m)),l==g&&u==v&&o==h&&c==_&&r==f||(y=!0),y}memoizeSize(){if(!this.container)return this.top=0,void(this.maxMargin=0);var e=this.container.parentElement,{top:t,height:n}=this.container.getBoundingClientRect(),{top:i}=e.getBoundingClientRect(),{height:o}=this.label.getBoundingClientRect();this.top=t-i+e.scrollTop,this.maxMargin=0==n?0:n-o}handleScroll(e){var t=e-this.top;if((t=(t=t<this.minMargin?this.minMargin:t)>this.maxMargin?this.maxMargin:t)!=this.margin)return this.props.hasStickyPosition||(this.label.style.top=`${t}px`),this.margin=t,!0}getEmojis(){var{name:e,emojis:t,recent:n,perLine:i}=this.props;if("Recent"==e){let{custom:e}=this.props,o=n||s.default.get(i);if(o.length&&(t=o.map(t=>{const n=e.filter(e=>e.id===t)[0];return n||t}).filter(e=>!!(0,a.getData)(e,null,null,this.data))),0===t.length&&o.length>0)return null}return t&&(t=t.slice(0)),t}updateDisplay(e){this.getEmojis()&&(this.container.style.display=e)}setContainerRef(e){this.container=e}setLabelRef(e){this.label=e}render(){var{id:e,name:t,hasStickyPosition:n,emojiProps:r,i18n:s,notFound:a,notFoundEmoji:c}=this.props,d=this.getEmojis(),h={},f={},m={};return d||(m={display:"none"}),n||(h={height:28},f={position:"absolute"}),o.default.createElement("section",{ref:this.setContainerRef,className:"emoji-mart-category","aria-label":s.categories[e],style:m},o.default.createElement("div",{style:h,"data-name":t,className:"emoji-mart-category-label"},o.default.createElement("span",{style:f,ref:this.setLabelRef,"aria-hidden":!0},s.categories[e])),o.default.createElement("ul",{className:"emoji-mart-category-list"},d&&d.map(e=>o.default.createElement("li",{key:e.id||e},(0,l.default)((0,i.default)({emoji:e,data:this.data},r))))),d&&!d.length&&o.default.createElement(u.default,{i18n:s,notFound:a,notFoundEmoji:c,data:this.data,emojiProps:r}))}}t.default=d,d.propTypes={emojis:r.default.array,hasStickyPosition:r.default.bool,name:r.default.string.isRequired,native:r.default.bool.isRequired,perLine:r.default.number.isRequired,emojiProps:r.default.object.isRequired,recent:r.default.arrayOf(r.default.string),notFound:r.default.func,notFoundEmoji:r.default.string.isRequired},d.defaultProps={emojis:[],hasStickyPosition:!0}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a(n(2)),o=a(n(0)),r=a(n(1)),s=a(n(4));function a(e){return e&&e.__esModule?e:{default:e}}class l extends o.default.PureComponent{render(){const{data:e,emojiProps:t,i18n:n,notFound:r,notFoundEmoji:a}=this.props;return r&&r()||o.default.createElement("div",{className:"emoji-mart-no-results"},(0,s.default)((0,i.default)({data:e},t,{size:38,emoji:a,onOver:null,onLeave:null,onClick:null})),o.default.createElement("div",{className:"emoji-mart-no-results-label"},n.notfound))}}t.default=l,l.propTypes={notFound:r.default.func.isRequired,emojiProps:r.default.object.isRequired}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=c(n(2)),o=c(n(0)),r=c(n(1)),s=n(3),a=c(n(4)),l=c(n(25)),u=c(n(26));function c(e){return e&&e.__esModule?e:{default:e}}class d extends o.default.PureComponent{constructor(e){super(e),this.data=e.data,this.state={emoji:null}}render(){var{emoji:e}=this.state,{emojiProps:t,skinsProps:n,showSkinTones:r,title:c,emoji:d,i18n:h,showPreview:f}=this.props;if(e&&f){var m=(0,s.getData)(e,null,null,this.data),{emoticons:p=[]}=m,g=[],v=[];return p.forEach(e=>{g.indexOf(e.toLowerCase())>=0||(g.push(e.toLowerCase()),v.push(e))}),o.default.createElement("div",{className:"emoji-mart-preview"},o.default.createElement("div",{className:"emoji-mart-preview-emoji","aria-hidden":"true"},(0,a.default)((0,i.default)({key:e.id,emoji:e,data:this.data},t))),o.default.createElement("div",{className:"emoji-mart-preview-data","aria-hidden":"true"},o.default.createElement("div",{className:"emoji-mart-preview-name"},e.name),o.default.createElement("div",{className:"emoji-mart-preview-shortnames"},m.short_names.map(e=>o.default.createElement("span",{key:e,className:"emoji-mart-preview-shortname"},":",e,":"))),o.default.createElement("div",{className:"emoji-mart-preview-emoticons"},v.map(e=>o.default.createElement("span",{key:e,className:"emoji-mart-preview-emoticon"},e)))))}return o.default.createElement("div",{className:"emoji-mart-preview"},o.default.createElement("div",{className:"emoji-mart-preview-emoji","aria-hidden":"true"},d&&d.length&&(0,a.default)((0,i.default)({emoji:d,data:this.data},t))),o.default.createElement("div",{className:"emoji-mart-preview-data","aria-hidden":"true"},o.default.createElement("span",{className:"emoji-mart-title-label"},c)),r&&o.default.createElement("div",{className:`emoji-mart-preview-skins${n.skinEmoji?" custom":""}`},n.skinEmoji?o.default.createElement(l.default,{skin:n.skin,emojiProps:t,data:this.data,skinEmoji:n.skinEmoji,i18n:h,onChange:n.onChange}):o.default.createElement(u.default,{skin:n.skin,i18n:h,onChange:n.onChange})))}}t.default=d,d.propTypes={showSkinTones:r.default.bool,title:r.default.string.isRequired,emoji:r.default.string.isRequired,emojiProps:r.default.object.isRequired,skinsProps:r.default.object.isRequired},d.defaultProps={showSkinTones:!0,onChange:()=>{}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a(n(0)),o=a(n(1)),r=a(n(4)),s=a(n(12));function a(e){return e&&e.__esModule?e:{default:e}}class l extends s.default{constructor(e){super(e),this.handleClick=this.handleClick.bind(this)}render(){const{skin:e,emojiProps:t,data:n,skinEmoji:o,i18n:s}=this.props,{opened:a}=this.state,l=[];for(let s=1;s<=6;s++){const a=s===e;l.push(i.default.createElement("span",{key:`skin-tone-${s}`,className:`emoji-mart-skin-swatch custom${a?" selected":""}`},i.default.createElement("span",{onClick:this.handleClick,"data-skin":s,className:`emoji-mart-skin-tone-${s}`},(0,r.default)({emoji:o,data:n,skin:s,backgroundImageFn:t.backgroundImageFn,native:t.native,set:t.set,sheetSize:t.sheetSize,size:23}))))}return i.default.createElement("div",{className:`emoji-mart-skin-swatches custom${a?" opened":""}`},i.default.createElement("div",{className:`emoji-mart-skin-text${a?" opened":""}`},s.skintext),l)}}t.default=l,l.propTypes={onChange:o.default.func,skin:o.default.number.isRequired,emojiProps:o.default.object.isRequired,skinTone:o.default.number,skinEmoji:o.default.string.isRequired,i18n:o.default.object},l.defaultProps={onChange:()=>{},skinTone:null}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a(n(2)),o=a(n(0)),r=a(n(1)),s=a(n(12));function a(e){return e&&e.__esModule?e:{default:e}}class l extends s.default{constructor(e){super(e),this.handleClick=this.handleClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this)}handleKeyDown(e){13!==e.keyCode&&32!==e.keyCode||this.handleClick(e)}render(){const{skin:e,i18n:t}=this.props,{opened:n}=this.state,r=[];for(let s=1;s<=6;s++){const a=s===e,l=n||a;r.push(o.default.createElement("span",(0,i.default)({key:`skin-tone-${s}`,className:`emoji-mart-skin-swatch${a?" selected":""}`,"aria-label":t.skintones[s],"aria-hidden":!l},n?{role:"menuitem"}:{}),o.default.createElement("span",(0,i.default)({onClick:this.handleClick,onKeyDown:this.handleKeyDown,role:"button"},a?{"aria-haspopup":!0,"aria-expanded":!!n}:{},n?{"aria-pressed":!!a}:{},{tabIndex:l?"0":"","aria-label":t.skintones[s],title:t.skintones[s],"data-skin":s,className:`emoji-mart-skin emoji-mart-skin-tone-${s}`}))))}return o.default.createElement("section",{className:`emoji-mart-skin-swatches${n?" opened":""}`,"aria-label":t.skintext},o.default.createElement("div",n?{role:"menubar"}:{},r))}}t.default=l,l.propTypes={onChange:r.default.func,skin:r.default.number.isRequired,i18n:r.default.object},l.defaultProps={onChange:()=>{}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=l(n(0)),o=l(n(1)),r=n(7),s=l(n(28)),a=n(3);function l(e){return e&&e.__esModule?e:{default:e}}let u=0;class c extends i.default.PureComponent{constructor(e){super(e),this.state={icon:r.search.search,isSearching:!1,id:++u},this.data=e.data,this.emojiIndex=new s.default(this.data),this.setRef=this.setRef.bind(this),this.clear=this.clear.bind(this),this.handleKeyUp=this.handleKeyUp.bind(this),this.handleChange=(0,a.throttleIdleTask)(this.handleChange.bind(this))}componentDidMount(){this.input&&this.input.value&&this.search(this.input.value)}search(e){""==e?this.setState({icon:r.search.search,isSearching:!1}):this.setState({icon:r.search.delete,isSearching:!0}),this.props.onSearch(this.emojiIndex.search(e,{emojisToShowFilter:this.props.emojisToShowFilter,maxResults:this.props.maxResults,include:this.props.include,exclude:this.props.exclude,custom:this.props.custom}))}clear(){""!=this.input.value&&(this.input.value="",this.input.focus(),this.search(""))}handleChange(){this.search(this.input.value)}handleKeyUp(e){13===e.keyCode&&this.clear()}setRef(e){this.input=e}render(){const{i18n:e,autoFocus:t}=this.props,{icon:n,isSearching:o,id:r}=this.state,s=`emoji-mart-search-${r}`;return i.default.createElement("section",{className:"emoji-mart-search","aria-label":e.search},i.default.createElement("input",{id:s,ref:this.setRef,type:"search",onChange:this.handleChange,placeholder:e.search,autoFocus:t}),i.default.createElement("label",{className:"emoji-mart-sr-only",htmlFor:s},e.search),i.default.createElement("button",{className:"emoji-mart-search-icon",onClick:this.clear,onKeyUp:this.handleKeyUp,"aria-label":e.clear,disabled:!o},n()))}}t.default=c,c.propTypes={onSearch:o.default.func,maxResults:o.default.number,emojisToShowFilter:o.default.func,autoFocus:o.default.bool},c.defaultProps={onSearch:()=>{},maxResults:75,emojisToShowFilter:null,autoFocus:!1}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=n(3),o=n(5);t.default=class{constructor(e){e.compressed&&(0,o.uncompress)(e),this.data=e||{},this.originalPool={},this.index={},this.emojis={},this.emoticons={},this.customEmojisList=[],this.buildIndex()}buildIndex(){for(let e in this.data.emojis){let t=this.data.emojis[e],{short_names:n,emoticons:o}=t,r=n[0];o&&o.forEach(e=>{this.emoticons[e]||(this.emoticons[e]=r)}),this.emojis[r]=(0,i.getSanitizedData)(r,null,null,this.data),this.originalPool[r]=t}}clearCustomEmojis(e){this.customEmojisList.forEach(t=>{let n=t.id||t.short_names[0];delete e[n],delete this.emojis[n]})}addCustomToPool(e,t){this.customEmojisList.length&&this.clearCustomEmojis(t),e.forEach(e=>{let n=e.id||e.short_names[0];n&&!t[n]&&(t[n]=(0,i.getData)(e,null,null,this.data),this.emojis[n]=(0,i.getSanitizedData)(e,null,null,this.data))}),this.customEmojisList=e,this.index={}}search(e,{emojisToShowFilter:t,maxResults:n,include:o,exclude:r,custom:s=[]}={}){this.customEmojisList!=s&&this.addCustomToPool(s,this.originalPool),n||(n=75),o||(o=[]),r||(r=[]);var a=null,l=this.originalPool;if(e.length){if("-"==e||"-1"==e)return[this.emojis[-1]];var u,c=e.toLowerCase().split(/[\s|,|\-|_]+/);if(c.length>2&&(c=[c[0],c[1]]),(o.length||r.length)&&(l={},this.data.categories.forEach(e=>{let t=!o||!o.length||o.indexOf(e.id)>-1,n=!(!r||!r.length)&&r.indexOf(e.id)>-1;t&&!n&&e.emojis.forEach(e=>l[e]=this.data.emojis[e])}),s.length)){let e=!o||!o.length||o.indexOf("custom")>-1,t=!(!r||!r.length)&&r.indexOf("custom")>-1;e&&!t&&this.addCustomToPool(s,l)}a=(u=c.map(e=>{var t=l,n=this.index,i=0;for(let o=0;o<e.length;o++){const r=e[o];if(i++,n[r]||(n[r]={}),!(n=n[r]).results){let o={};n.results=[],n.pool={};for(let r in t){let s=t[r],{search:a}=s,l=e.substr(0,i),u=a.indexOf(l);if(-1!=u){let e=u+1;l==r&&(e=0),n.results.push(this.emojis[r]),n.pool[r]=s,o[r]=e}}n.results.sort((e,t)=>o[e.id]-o[t.id])}t=n.pool}return n.results}).filter(e=>e)).length>1?i.intersect.apply(null,u):u.length?u[0]:[]}return a&&(t&&(a=a.filter(e=>t(l[e.id]))),a&&a.length>n&&(a=a.slice(0,n))),a}}},function(e,t,n){e.exports=n(30)},function(e,t,n){!function(e,t,n){"use strict";n=n&&n.hasOwnProperty("default")?n.default:n;var i=Object.freeze({name:"CustomElements",defineElement:function(e,t,{onUpdate:n,onUnmount:i,onMount:o}){!function(){if(window.HTMLElement&&window.HTMLElement._babelES5Adapter||void 0===window.Reflect||void 0===window.customElements||window.customElements.hasOwnProperty("polyfillWrapFlushCallback"))return;const e=HTMLElement;window.HTMLElement=function(){return Reflect.construct(e,[],this.constructor)},HTMLElement.prototype=e.prototype,HTMLElement.prototype.constructor=HTMLElement,Object.setPrototypeOf(HTMLElement,e),HTMLElement._babelES5Adapter=!0}();const r=e.attributes||[];e.quiet&&window.customElements.get(t)||window.customElements.define(t,class extends window.HTMLElement{static get observedAttributes(){return["props-json",...r]}connectedCallback(){this._mountPoint=function(e,{shadow:t}){if(t&&e.attachShadow){const t=document.createElement("span");return e.attachShadow({mode:"open"}).appendChild(t),t}return e}(this,e),o(this,this._mountPoint)}disconnectedCallback(){this._mountPoint&&i(this,this._mountPoint)}attributeChangedCallback(){this._mountPoint&&n(this,this._mountPoint)}})},isSupported:function(){return window.customElements&&window.customElements.define},supportsShadow:function(){return!!(document&&document.body&&document.body.attachShadow)}});const o={};function r(e,t,n){e.nodeName.toLowerCase()===t?(n.onMount(e,e),function(e,{onUpdate:t}){new window.MutationObserver(e=>{s(e,e=>{const n=e.target;t(n,n)})}).observe(e,{attributes:!0})}(e,n),function(e,{onUnmount:t}){const n=e.parentNode,i=new window.MutationObserver(o=>{s(o,o=>{s(o.removedNodes,o=>{e===o&&(i.disconnect(n),t(e,e))})})});i.observe(n,{childList:!0,subtree:!0})}(e,n)):e.children&&e.children.length&&s(e.children,e=>{r(e,t,n)})}function s(e,t){for(let n=0,i=e.length;n<i;n++)t(e[n])}var a=Object.freeze({name:"MutationObserver",observers:o,isSupported:function(){return!!window.MutationObserver},defineElement:function(e,t,n){if(!function(e){return!(-1===e.indexOf("-")||!e.match(/^[a-z][a-z0-9-]*$/))}(t=t.toLowerCase())){if(e.quiet)return;throw new Error(`Remount: "${t}" is not a valid custom element name`)}if(o[t]){if(e.quiet)return;throw new Error(`Remount: "${t}" is already registered`)}new window.MutationObserver(e=>{s(e,e=>{s(e.addedNodes,e=>{r(e,t,n)})})}).observe(document.body,{childList:!0,subtree:!0}),o[t]=!0,window.addEventListener("DOMContentLoaded",()=>{const e=document.getElementsByTagName(t);[...e].forEach(e=>r(e,t,n))})},supportsShadow:function(){return!1}});function l({component:e},i,o){const r=t.createElement(e,o);n.render(r,i)}var u=Object.freeze({mount:function(e,t,n){return l(e,t,n)},update:l,unmount:function(e,t){n.unmountComponentAtNode(t)}});function c(){if(void 0!==c._result)return c._result;const e=[i,a].reduce((e,t)=>e||t.isSupported()&&t,null);return e||console.warn("Remount: This browser doesn't support the MutationObserver API or the Custom Elements API. Including polyfills might fix this. Remount elements will not work. https://github.com/rstacruz/remount"),c._result=e,e}function d(e,t){const n=e.getAttribute("props-json");if(n)return JSON.parse(n);const i=t||[];return i.reduce((t,n)=>(t[n]=e.getAttribute(n),t),{})}e.getStrategy=c,e.define=function(e,t){const n=c();n&&Object.keys(e).forEach(i=>{const o=Object.assign({},t,function(e){return"object"==typeof e&&e.component?e:{component:e}}(e[i])),r=o.adapter||u;n.defineElement(o,i,{onMount(e,t){const n=d(e,o.attributes);r.mount(o,t,n)},onUpdate(e,t){const n=d(e,o.attributes);r.update(o,t,n)},onUnmount(e,t){r.unmount(o,t)}})})},Object.defineProperty(e,"__esModule",{value:!0})}(t,n(0),n(0))}]);

/*!
 * bootstra-suggest -  v2.0.1 (https://github.com/lodev09/bootstrap-suggest#readme)
 * Copyright 2013-2019 Jovanni Lo (lodev09@gmail.com)
 * Licensed under MIT (https://github.com/lodev09/bootstrap-suggest/blob/master/LICENSE)
 */

(function(a){"use strict";var b=function(b,c,d){this;this.$element=a(b),this.$items=void 0,this.options=a.extend(!0,{},a.fn.suggest.defaults,d,this.$element.data(),this.$element.data("options")),this.key=c,this.isShown=!1,this.query="",this._queryPos=[],this._keyPos=-1,this.$dropdown=a("<div />",{class:"dropdown suggest "+this.options.dropdownClass,html:a("<div />",{class:"dropdown-menu",role:"menu"}),"data-key":this.key}),this.load()};b.prototype={__setListener:function(){return this.$element.on("suggest.show",a.proxy(this.options.onshow,this)).on("suggest.select",a.proxy(this.options.onselect,this)).on("suggest.lookup",a.proxy(this.options.onlookup,this)).on("keyup",a.proxy(this.__keyup,this)),this},__getCaretPos:function(b){var c=["direction","boxSizing","width","height","overflowX","overflowY","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","paddingTop","paddingRight","paddingBottom","paddingLeft","fontStyle","fontVariant","fontWeight","fontStretch","fontSize","fontSizeAdjust","lineHeight","fontFamily","textAlign","textTransform","textIndent","textDecoration","letterSpacing","wordSpacing"],d=null!=window.mozInnerScreenX;return function(b,e){var f=document.createElement("div");f.id="input-textarea-caret-position-mirror-div",document.body.appendChild(f);var g=f.style,h=window.getComputedStyle?getComputedStyle(b):b.currentStyle;g.whiteSpace="pre-wrap","INPUT"!==b.nodeName&&(g.wordWrap="break-word"),g.position="absolute",g.visibility="hidden",a.each(c,function(a,b){g[b]=h[b]}),d?(g.width=parseInt(h.width)-2+"px",b.scrollHeight>parseInt(h.height)&&(g.overflowY="scroll")):g.overflow="hidden",f.textContent=b.value.substring(0,e),"INPUT"===b.nodeName&&(f.textContent=f.textContent.replace(/\s/g,"\xA0"));var i=document.createElement("span");i.textContent=b.value.substring(e)||".",f.appendChild(i);var j={top:i.offsetTop+parseInt(h.borderTopWidth),left:i.offsetLeft+parseInt(h.borderLeftWidth)};return document.body.removeChild(f),j}(this.$element.get(0),b)},__keyup:function(b){switch(b.keyCode){case 27:return void this.hide();case 13:return!0;}if(-1===a.inArray(b.keyCode,[38,40,37,39,17,18,9,16,20,91,93,36,35,45,33,34,144,112,113,114,115,116,117,118,119,120,121,122,123,145,19]))for(var c,d=this.$element,e=d.val(),f=this.__getSelection(d.get(0)).start,g=f;0<=g;g--){if(c=a.trim(e.substring(g-1,g)),!c){this.hide();break}if(c===this.key){this.query=e.substring(g,f),this._queryPos=[g,f],this._keyPos=g,this.lookup(this.query);break}}},__getVisibleItems:function(){return this.$items?this.$items.not(".d-none"):a()},__build:function(){var b=this.$dropdown,c=this,d=function(){c.hide()};b.on("click","a.dropdown-item",function(b){b.preventDefault(),c.__select(a(this).index()),c.$element.focus()}).on("mouseover","a.dropdown-item",function(){c.$element.off("blur",d)}).on("mouseout","a.dropdown-item",function(){c.$element.on("blur",d)}),this.$element.before(b).on("blur",d).on("keydown",function(b){var d;if(c.isShown)switch(b.keyCode){case 13:return d=c.__getVisibleItems(),d.each(function(){a(this).is(".active")&&c.__select(a(this).index())}),!1;break;case 40:return(d=c.__getVisibleItems(),!d.last().is(".active"))&&(d.each(function(b){var c=a(this),e=d.eq(b+1);if(c.is(".active"))return e.is(".d-none")||(c.removeClass("active"),e.addClass("active")),!1}),!1);case 38:return(d=c.__getVisibleItems(),!d.first().is(".active"))&&(d.each(function(b){var c=a(this),e=d.eq(b-1);if(c.is(".active"))return e.is(".d-none")||(c.removeClass("active"),e.addClass("active")),!1}),!1);}})},__mapItem:function(b){var c=this,d={text:"",value:""};return!(this.options.map&&(b=this.options.map(b),!b))&&(b instanceof Object?(d.text=b.text||"",d.value=b.value||""):(d.text=b,d.value=b),a("<a />",{class:"dropdown-item","data-value":d.value,href:"#",html:d.text}))},__select:function(b){var c=this.$element,d=c.get(0),e=c.val(),f=this.get(b),g=this._keyPos+f.value.length;if(c.val(e.slice(0,this._keyPos)+f.value+e.slice(this.__getSelection(d).start)),d.setSelectionRange)d.setSelectionRange(g,g);else if(d.createTextRange){var h=d.createTextRange();h.collapse(!0),h.moveEnd("character",g),h.moveStart("character",g),h.select()}c.trigger(a.extend({type:"suggest.select"},this),f),this.hide(),setTimeout(function(){c.focus()},200)},__getSelection:function(a){return a.focus(),{start:a.selectionStart,end:a.selectionEnd}},__buildItems:function(a){var b=this.$dropdown.find(".dropdown-menu");if(b.empty(),a&&a instanceof Array)for(var c in a){var d=this.__mapItem(a[c]);d&&b.append(d)}return b.find("a.dropdown-item")},__lookup:function(b,c){c.eq(0).addClass("active");this.$element.trigger(a.extend({type:"suggest.lookup"},this),[b,c]),c&&c.length?this.show():this.hide()},__filterData:function(b){var c=this.options;return this.$items.addClass("d-none"),this.$items.filter(function(d){if(""===b)return d<c.filter.limit;var e=a(this).text();return c.filter.casesensitive||(e=e.toLowerCase(),b=b.toLowerCase()),-1!=e.indexOf(b)}).slice(0,c.filter.limit).removeClass("d-none active"),this.__getVisibleItems()},get:function(a){if(this.$items){var b=this.$items.eq(a);return{text:b.text(),value:b.attr("data-value"),index:a,$element:b}}},lookup:function(a){var b,c=this.options,d=this,e=function(b){-1!==d._keyPos&&(!d.$items&&(d.$items=d.__buildItems(b)),d.__lookup(a,d.__filterData(a,b)))};"function"==typeof this.options.data?(this.$items=void 0,b=this.options.data(a,e)):b=this.options.data,b&&"function"==typeof b.promise?b.done(e):b&&e.call(this,b)},load:function(){this.__setListener(),this.__build()},hide:function(){this.$dropdown.find(".dropdown-menu").removeClass("show"),this.isShown=!1,this.$items&&this.$items.removeClass("active"),this._keyPos=-1},show:function(){var b,c=this.$element,d=this.$dropdown.find(".dropdown-menu"),e=c.get(0),f=this.options,g={top:"auto",bottom:"auto",left:"auto",right:"auto"};if(!this.isShown){if(d.addClass("show"),!1!==f.position){if(b=this.__getCaretPos(this._keyPos),"string"==typeof f.position)switch(f.position){case"bottom":g.top=c.outerHeight()-parseFloat(d.css("margin-top")),g.left=0,g.right=0;break;case"top":g.top=-(d.outerHeight(!0)+parseFloat(d.css("margin-top"))),g.left=0,g.right=0;break;case"caret":g.top=b.top-e.scrollTop,g.left=b.left-e.scrollLeft;}else g=a.extend(g,"function"==typeof f.position?f.position(e,b):f.position);d.css(g)}this.isShown=!0,c.trigger(a.extend({type:"suggest.show"},this))}}};var c=a.fn.suggest;a.fn.suggest=function(c){var d=arguments[1],e=arguments[2],f=function(c,d){var e={};return a.each(d,function(a,d){var f=a.toString().charAt(0);e[f]=new b(c,f,"object"==typeof d&&d)}),e};return this.each(function(){var b=this,g=a(this),h=g.data("suggest"),i={};if(!("string"==typeof c))h?h&&(a.each(c,function(b,c){!1==b in h?i[b]=c:h[b].options=a.extend({},h[b].options,c)}),g.data("suggest",a.extend(h,f(b,i)))):g.data("suggest",f(this,c));else if(1!=c.length)console.error("you're not initializing suggest properly. arg1 should have length == 1");else if(d)if("string"==typeof d){if(c in h&&"undefined"!=typeof h[c][d])return h[c][d].call(h[c],e);console.error(c+" is not a suggest")}else i[c]=a.isArray(d)||"function"==typeof d?{data:d}:d,h&&c in h?h[c].options=a.extend({},h[c].options,i[c]):h=a.extend(h,f(this,i)),g.data("suggest",h)})},a.fn.suggest.defaults={data:[],map:void 0,filter:{casesensitive:!1,limit:5},dropdownClass:"",position:"caret",onshow:function(){},onselect:function(){},onlookup:function(){}},a.fn.suggest.Constructor=b,a.fn.suggest.noConflict=function(){return a.fn.suggest=c,this}})(jQuery);


var usState = {"AL":"Alabama","AK":"Alaska","AS":"American Samoa","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District Of Columbia","FM":"Federated States Of Micronesia","FL":"Florida","GA":"Georgia","GU":"Guam","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MH":"Marshall Islands","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","MP":"Northern Mariana Islands","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PW":"Palau","PA":"Pennsylvania","PR":"Puerto Rico","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VI":"Virgin Islands","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"};
var allCountries = [{i:4, n:"Afghanistan",c:"AFN"}, {i:248, n:"Åland",c:"EUR"}, {i:8, n:"Albania",c:"ALL"}, {i:12, n:"Algeria",c:"DZD"}, {i:16, n:"American Samoa",c:"USD"}, {i:20, n:"Andorra",c:"EUR"}, {i:24, n:"Angola",c:"AOA"}, {i:660, n:"Anguilla",c:"XCD"}, {i:28, n:"Antigua and Barbuda",c:"XCD"}, {i:32, n:"Argentina",c:"ARS"}, {i:51, n:"Armenia",c:"AMD"}, {i:533, n:"Aruba",c:"AWG"}, {i:36, n:"Australia",c:"AUD"}, {i:40, n:"Austria",c:"EUR"}, {i:31, n:"Azerbaijan",c:"AZN"}, {i:44, n:"Bahamas",c:"BSD"}, {i:48, n:"Bahrain",c:"BHD"}, {i:50, n:"Bangladesh",c:"BDT"}, {i:52, n:"Barbados",c:"BBD"}, {i:112, n:"Belarus",c:"BYN"}, {i:56, n:"Belgium",c:"EUR"}, {i:84, n:"Belize",c:"BZD"}, {i:204, n:"Benin",c:"XOF"}, {i:60, n:"Bermuda",c:"BMD"}, {i:64, n:"Bhutan",c:"BTN"}, {i:68, n:"Bolivia",c:"BOB"}, {i:535, n:"Bonaire",c:"USD"}, {i:70, n:"Bosnia and Herzegovina",c:"BAM"}, {i:72, n:"Botswana",c:"BWP"}, {i:74, n:"Bouvet Island",c:"NOK"}, {i:76, n:"Brazil",c:"BRL"}, {i:86, n:"British Indian Ocean Territory",c:"USD"}, {i:96, n:"Brunei",c:"BND"}, {i:100, n:"Bulgaria",c:"BGN"}, {i:854, n:"Burkina Faso",c:"XOF"}, {i:108, n:"Burundi",c:"BIF"}, {i:132, n:"Cape Verde",c:"CVE"}, {i:116, n:"Cambodia",c:"KHR"}, {i:120, n:"Cameroon",c:"XAF"}, {i:124, n:"Canada",c:"CAD"}, {i:136, n:"Cayman Islands",c:"KYD"}, {i:140, n:"Central African Republic",c:"XAF"}, {i:148, n:"Chad",c:"XAF"}, {i:152, n:"Chile",c:"CLP"}, {i:156, n:"China",c:"CNY"}, {i:162, n:"Christmas Island",c:"AUD"}, {i:166, n:"Cocos [Keeling] Islands",c:"AUD"}, {i:170, n:"Colombia",c:"COP"}, {i:174, n:"Comoros",c:"KMF"}, {i:178, n:"Republic of the Congo",c:"XAF"}, {i:180, n:"Democratic Republic of the Congo",c:"CDF"}, {i:184, n:"Cook Islands",c:"NZD"}, {i:188, n:"Costa Rica",c:"CRC"}, {i:384, n:"Ivory Coast",c:"XOF"}, {i:191, n:"Croatia",c:"HRK"}, {i:192, n:"Cuba",c:"CUP"}, {i:531, n:"Curacao",c:"ANG"}, {i:196, n:"Cyprus",c:"EUR"}, {i:203, n:"Czech Republic",c:"CZK"}, {i:208, n:"Denmark",c:"DKK"}, {i:262, n:"Djibouti",c:"DJF"}, {i:212, n:"Dominica",c:"XCD"}, {i:214, n:"Dominican Republic",c:"DOP"}, {i:218, n:"Ecuador",c:"USD"}, {i:818, n:"Egypt",c:"EGP"}, {i:222, n:"El Salvador",c:"USD"}, {i:226, n:"Equatorial Guinea",c:"XAF"}, {i:232, n:"Eritrea",c:"ERN"}, {i:233, n:"Estonia",c:"EUR"}, {i:748, n:"Eswatini",c:"SZL"}, {i:231, n:"Ethiopia",c:"ETB"}, {i:238, n:"Falkland Islands",c:"FKP"}, {i:234, n:"Faroe Islands",c:"DKK"}, {i:242, n:"Fiji",c:"FJD"}, {i:246, n:"Finland",c:"EUR"}, {i:250, n:"France",c:"EUR"}, {i:254, n:"French Guiana",c:"EUR"}, {i:258, n:"French Polynesia",c:"XPF"}, {i:260, n:"French Southern Territories",c:"EUR"}, {i:266, n:"Gabon",c:"XAF"}, {i:270, n:"Gambia",c:"GMD"}, {i:268, n:"Georgia",c:"GEL"}, {i:276, n:"Germany",c:"EUR"}, {i:288, n:"Ghana",c:"GHS"}, {i:292, n:"Gibraltar",c:"GIP"}, {i:300, n:"Greece",c:"EUR"}, {i:304, n:"Greenland",c:"DKK"}, {i:308, n:"Grenada",c:"XCD"}, {i:312, n:"Guadeloupe",c:"EUR"}, {i:316, n:"Guam",c:"USD"}, {i:320, n:"Guatemala",c:"GTQ"}, {i:831, n:"Guernsey",c:"GBP"}, {i:324, n:"Guinea",c:"GNF"}, {i:624, n:"Guinea-Bissau",c:"XOF"}, {i:328, n:"Guyana",c:"GYD"}, {i:332, n:"Haiti",c:"HTG"}, {i:334, n:"Heard Island and McDonald Islands",c:"AUD"}, {i:336, n:"Vatican City",c:"EUR"}, {i:340, n:"Honduras",c:"HNL"}, {i:344, n:"Hong Kong",c:"HKD"}, {i:348, n:"Hungary",c:"HUF"}, {i:352, n:"Iceland",c:"ISK"}, {i:356, n:"India",c:"INR"}, {i:360, n:"Indonesia",c:"IDR"}, {i:364, n:"Iran",c:"IRR"}, {i:368, n:"Iraq",c:"IQD"}, {i:372, n:"Ireland",c:"EUR"}, {i:833, n:"Isle of Man",c:"GBP"}, {i:376, n:"Israel",c:"ILS"}, {i:380, n:"Italy",c:"EUR"}, {i:388, n:"Jamaica",c:"JMD"}, {i:392, n:"Japan",c:"JPY"}, {i:832, n:"Jersey",c:"GBP"}, {i:400, n:"Jordan",c:"JOD"}, {i:398, n:"Kazakhstan",c:"KZT"}, {i:404, n:"Kenya",c:"KES"}, {i:296, n:"Kiribati",c:"AUD"}, {i:408, n:"North Korea",c:"KPW"}, {i:410, n:"South Korea",c:"KRW"}, {i:414, n:"Kuwait",c:"KWD"}, {i:417, n:"Kyrgyzstan",c:"KGS"}, {i:418, n:"Laos",c:"LAK"}, {i:428, n:"Latvia",c:"EUR"}, {i:422, n:"Lebanon",c:"LBP"}, {i:426, n:"Lesotho",c:"LSL"}, {i:430, n:"Liberia",c:"LRD"}, {i:434, n:"Libya",c:"LYD"}, {i:438, n:"Liechtenstein",c:"CHF"}, {i:440, n:"Lithuania",c:"EUR"}, {i:442, n:"Luxembourg",c:"EUR"}, {i:446, n:"Macao",c:"MOP"}, {i:450, n:"Madagascar",c:"MGA"}, {i:454, n:"Malawi",c:"MWK"}, {i:458, n:"Malaysia",c:"MYR"}, {i:462, n:"Maldives",c:"MVR"}, {i:466, n:"Mali",c:"XOF"}, {i:470, n:"Malta",c:"EUR"}, {i:584, n:"Marshall Islands",c:"USD"}, {i:474, n:"Martinique",c:"EUR"}, {i:478, n:"Mauritania",c:"MRU"}, {i:480, n:"Mauritius",c:"MUR"}, {i:175, n:"Mayotte",c:"EUR"}, {i:484, n:"Mexico",c:"MXN"}, {i:583, n:"Micronesia",c:"USD"}, {i:498, n:"Moldova",c:"MDL"}, {i:492, n:"Monaco",c:"EUR"}, {i:496, n:"Mongolia",c:"MNT"}, {i:499, n:"Montenegro",c:"EUR"}, {i:500, n:"Montserrat",c:"XCD"}, {i:504, n:"Morocco",c:"MAD"}, {i:508, n:"Mozambique",c:"MZN"}, {i:104, n:"Myanmar [Burma]",c:"MMK"}, {i:516, n:"Namibia",c:"NAD"}, {i:520, n:"Nauru",c:"AUD"}, {i:524, n:"Nepal",c:"NPR"}, {i:528, n:"Netherlands",c:"EUR"}, {i:540, n:"New Caledonia",c:"XPF"}, {i:554, n:"New Zealand",c:"NZD"}, {i:558, n:"Nicaragua",c:"NIO"}, {i:562, n:"Niger",c:"XOF"}, {i:566, n:"Nigeria",c:"NGN"}, {i:570, n:"Niue",c:"NZD"}, {i:574, n:"Norfolk Island",c:"AUD"}, {i:807, n:"North Macedonia",c:"MKD"}, {i:580, n:"Northern Mariana Islands",c:"USD"}, {i:578, n:"Norway",c:"NOK"}, {i:512, n:"Oman",c:"OMR"}, {i:586, n:"Pakistan",c:"PKR"}, {i:585, n:"Palau",c:"USD"}, {i:275, n:"Palestine",c:"ILS"}, {i:591, n:"Panama",c:"PAB"}, {i:598, n:"Papua New Guinea",c:"PGK"}, {i:600, n:"Paraguay",c:"PYG"}, {i:604, n:"Peru",c:"PEN"}, {i:608, n:"Philippines",c:"PHP"}, {i:612, n:"Pitcairn Islands",c:"NZD"}, {i:616, n:"Poland",c:"PLN"}, {i:620, n:"Portugal",c:"EUR"}, {i:630, n:"Puerto Rico",c:"USD"}, {i:634, n:"Qatar",c:"QAR"}, {i:638, n:"Réunion",c:"EUR"}, {i:642, n:"Romania",c:"RON"}, {i:643, n:"Russia",c:"RUB"}, {i:646, n:"Rwanda",c:"RWF"}, {i:652, n:"Saint Barthélemy",c:"EUR"}, {i:654, n:"Saint Helena",c:"SHP"}, {i:659, n:"Saint Kitts and Nevis",c:"XCD"}, {i:662, n:"Saint Lucia",c:"XCD"}, {i:663, n:"Saint Martin",c:"EUR"}, {i:666, n:"Saint Pierre and Miquelon",c:"EUR"}, {i:670, n:"Saint Vincent and the Grenadines",c:"XCD"}, {i:882, n:"Samoa",c:"WST"}, {i:674, n:"San Marino",c:"EUR"}, {i:678, n:"São Tomé and Príncipe",c:"STN"}, {i:682, n:"Saudi Arabia",c:"SAR"}, {i:686, n:"Senegal",c:"XOF"}, {i:688, n:"Serbia",c:"RSD"}, {i:690, n:"Seychelles",c:"SCR"}, {i:694, n:"Sierra Leone",c:"SLL"}, {i:702, n:"Singapore",c:"SGD"}, {i:534, n:"Sint Maarten",c:"ANG"}, {i:703, n:"Slovakia",c:"EUR"}, {i:705, n:"Slovenia",c:"EUR"}, {i:90, n:"Solomon Islands",c:"SBD"}, {i:706, n:"Somalia",c:"SOS"}, {i:710, n:"South Africa",c:"ZAR"}, {i:239, n:"South Georgia and the South Sandwich Islands",c:"GBP"}, {i:728, n:"South Sudan",c:"SSP"}, {i:724, n:"Spain",c:"EUR"}, {i:144, n:"Sri Lanka",c:"LKR"}, {i:729, n:"Sudan",c:"SDG"}, {i:740, n:"Suriname",c:"SRD"}, {i:744, n:"Svalbard and Jan Mayen",c:"NOK"}, {i:752, n:"Sweden",c:"SEK"}, {i:756, n:"Switzerland",c:"CHF"}, {i:760, n:"Syria",c:"SYP"}, {i:158, n:"Taiwan",c:"TWD"}, {i:762, n:"Tajikistan",c:"TJS"}, {i:834, n:"Tanzania",c:"TZS"}, {i:764, n:"Thailand",c:"THB"}, {i:626, n:"East Timor",c:"USD"}, {i:768, n:"Togo",c:"XOF"}, {i:772, n:"Tokelau",c:"NZD"}, {i:776, n:"Tonga",c:"TOP"}, {i:780, n:"Trinidad and Tobago",c:"TTD"}, {i:788, n:"Tunisia",c:"TND"}, {i:792, n:"Turkey",c:"TRY"}, {i:795, n:"Turkmenistan",c:"TMT"}, {i:796, n:"Turks and Caicos Islands",c:"USD"}, {i:798, n:"Tuvalu",c:"AUD"}, {i:800, n:"Uganda",c:"UGX"}, {i:804, n:"Ukraine",c:"UAH"}, {i:784, n:"United Arab Emirates",c:"AED"}, {i:826, n:"United Kingdom",c:"GBP"}, {i:840, n:"United States",c:"USD"}, {i:581, n:"U.S. Minor Outlying Islands",c:"USD"}, {i:858, n:"Uruguay",c:"UYU"}, {i:860, n:"Uzbekistan",c:"UZS"}, {i:548, n:"Vanuatu",c:"VUV"}, {i:862, n:"Venezuela",c:"VES"}, {i:704, n:"Vietnam",c:"VND"}, {i:92, n:"British Virgin Islands",c:"USD"}, {i:850, n:"U.S. Virgin Islands",c:"USD"}, {i:876, n:"Wallis and Futuna",c:"XPF"}, {i:732, n:"Western Sahara",c:"MAD"}, {i:887, n:"Yemen",c:"YER"}, {i:894, n:"Zambia",c:"ZMW"}, {i:716, n:"Zimbabwe",c:"ZWL"}];


document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
window.addEventListener('resize', () => {    
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
}),



$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null)
        return null;
    else 
        return results[1] || null;
}

var cur_table_idx = 0;
var lastVueUpdated = 0;
var isSuper = $.urlParam('super');
var all_cf_suggestion = null;
var max_level = 3, my_pages = null, activeFolder = $.urlParam('folder');
activeFolder = {id: activeFolder !== null ? activeFolder : 0};  
createFolder = true, visibleFolders = null;
myi18n = null;


var dateRanges = [
    { id: 'today', name: 'today' },
    { id: 'yesterday', name: 'yesterday' },
    { id: 'thisWeek', name: 'thisWeek' },
    { id: 'lastWeek', name: 'lastWeek' },
    { id: 'thisMonth', name: 'thisMonth' },
    { id: 'lastMonth', name: 'lastMonth' },
    { id: 'last7days', name: 'last7days' },
    { id: 'last14days', name: 'last14days' },
    { id: 'last30days', name: 'last30days' },
    { id: 'thisYear', name: 'thisYear' },
    { id: 'lastYear', name: 'lastYear' },
    { id: 'allTime', name: 'allTime' },
    { id: 'custom', name: 'customRange' }
];
  


var total_checked = null, searchContent = null, mainApp = null;
var mainData = {    
    pageName: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1).replace('.php', ''),
    sendProduct: {easyMode: true, channel: 0, value: [], body: '', header: {type:'text', text: ''}, footer: '', sessions: [{title:'', value:[]}], max: 10, options: [], props:{multiple: true, checkStrictly: true}},
    flows: [],
    boards: null,
    products: null,
    backURL: null,
    navInfo: null,
    pageTitle: "...",
    wt: {name: ''},
    me: null,
    bot: null,
    cur_page: null,
    my_pages: null,
    breadcrumb: null,
    searchPage: "",
    searchGlobal: "",
    searchBar: false,
    help: [],
    custom_tabs: [],
    newbotbtt: true,
    folders: null,  
    selectFolder:{selectedFolder: null, currentFolders: [], parents: [], action: 'Move', loading: false, notAllowed: []},
    form: {title: '', rows: [], data: {}, loading: false, allowEdit: true, keepOnDone: false},
    loading:{   
        stauts: true,
        msg: "Loading..."
    },
    quicksave: {
        visible: false,
        positive: "Save",
        positiveDisabled: false,
        negative: {
            url: "",
            caption: "Cancel"
        },
    },
    op: null,
    activeFolder: activeFolder,
    locale: getCookies("lang", "en"),
    lngs: {en:{}},    
    data:{learnMore: null},
    channelSelector: {data: [], callback: null},
    channelPreview:{qr_code: null,  url:null, message:null, channelName: null},
    newLogo: {file: null, previewURL: null, modalM: null, uploading: false, callback: null, close: function(){
        mainData.newLogo.uploading = false;
        mainData.newLogo.modalM.modal('hide');
    }},
    navMenu:[],
    selectedTab: 'general',
    admins: null,
    iframe: null,
    tabaleActions: false,
    accountSettings: null,
    hasNav: true,
    customFields: [],
    table1: {draw: 1, search: false, deepResults: [], searchResquest: null},
    table2: {draw: 1, search: false, deepResults: [], searchResquest: null},
    advancedMode: false,
    pageshowReload: false
}


try{
    if(typeof moreLangs === 'undefined')
        moreLangs = {}

    
    mainLangs = MergeObjects(mainLangs, moreLangs);
    if(document.location.href.includes('/s/')){
        mainLangs.en.flows = 'Funnels';
        mainLangs.en.flow = 'Funnel';   
        mainLangs.en.selectFlow = "Select Funnel";
        mainLangs.en.send_flow = "Send Funnel";
        mainLangs.en.send_flow = "Send Funnel";
        mainLangs.en.set_custom_field = "Set Customer Field";
        mainLangs.en.clear_custom_field = "Clear Customer Field";
        mainLangs.en.sequences = 'Drip Campaigns';
        mainLangs.en.c_field = 'Customer Field';
        mainLangs.en.c_fields = 'Customer Fields';
        mainLangs.en.tools = 'Marketing';

        if(mainLangs.en.f){
            mainLangs.en.f.startFlow = "Start Funnel";
            mainLangs.en.f.flowVersions = "Funnel Versions"; 
            mainLangs.en.f.msg7 = 'Subscribe to Drip Campaign';
            mainLangs.en.f.msg8 = 'Unsubscribe From Drip Campaign';
        } 
        
        if(mainLangs.en.i)
            mainLangs.en.i.subSequences = 'Subscribed Drip Campaigns';

        if(mainLangs.en.u){
            mainLangs.en.u.msg0 = 'Customer Fields With Value';
            mainLangs.en.u.msg1 = 'Customer Fields With no Value';
            mainLangs.en.u.msg3 = 'Viewed Funnels/Steps'
        }

    }

    myi18n = new VueI18n({
        locale: mainData.locale,
        fallbackLocale: "en",
        messages: mainLangs,
        silentFallbackWarn: true
    });

    mainData.loading.msg = myi18n.t('loading');
    mainData.quicksave.positive = myi18n.t('save');
    mainData.quicksave.negative.caption = myi18n.t('cancel');

    if(typeof dtb_lng !== 'undefined' )
        dtb_lng.search = "_INPUT_";

    


    renderI18n('[data-v-t]');
}catch(ex){}

var vueMethods = {
    goBack(timeout){
        if(timeout){
            setTimeout(function(){window.location.href = mainData.quicksave.negative.url}, timeout)
        }else
            window.location.href = mainData.quicksave.negative.url;
    },
    showDivChange(e){
        div_save_changes(true);
    },
    changeLanguage(){
        setCookies("lang", mainData.locale);
        location.reload();
    }
}

window.addEventListener('load', function() {
    $vueapp = $('.vueapp');
    
    try{
        //myi18n.t('syncMessage')
        //myi18n.locale="pt"
       
        for(i = 0; i < $vueapp.length; i++){
            mainApp = new Vue({
                el: $vueapp[i] ,
                data: mainData,
                i18n: myi18n,
                components: myComponets,
                methods: vueMethods,
                mounted: function () {
                    if(!lastVueUpdated)
                        listenEventsAfterVue();

                    lastVueUpdated = getTimestamp(true);
                    this.$nextTick(function () {
                        setTimeout(() => {
                            if(getTimestamp(true) - lastVueUpdated >= 1000){
                                lastVueUpdated =getTimestamp(true); 
                                listenEventsAfterVue();
                            }
                        }, 1000);
                        
                    })
                },
                updated: function () {
                    lastVueUpdated = getTimestamp(true);
                        this.$nextTick(function () {  
                            setTimeout(() => {
                                if(getTimestamp(true) - lastVueUpdated > 1){
                                    lastVueUpdated =getTimestamp(true); 
                                    listenEventsAfterVue();
                                }
                            }, 1000);
                    })                 
                }
            })  
        }

    }catch(ex){
        for(i = 0; i < $vueapp.length; i++){
            mainApp = new Vue({
                el: $vueapp[i] ,
                data: mainData,
                methods:{
                    showDivChange(e){
                        div_save_changes(true);
                    }    
                }
            })  
        }
    }
    

    
    setTimeout(() => {
        $('[data-toggle="tooltip"], [data-toggle-second="tooltip"]').tooltip();  
    }, 3000); 

    init_search_bar();
    
    $("emoji-picker").css({display: 'none'});
})

function listenEventsAfterVue(){
    handleCbxAll();
    if(all_cf_suggestion){
        cf_enable_suggestions('.vueapp .cf_suggestions', all_cf_suggestion);
        emojiEvents('.vueapp');
    }
}




function testForm(){
    let form = {title: myi18n.t('edit'), rows: [
            {id:"country", label: "country", value:""},
            {
                id:"player",
                checkNested: true,
                type:"select", label: "Test Select", value: null, multiple: false, keyId:'id', keyLabel:'name', 
                options: [
                    {id: 12, name: "Messi"}, 
                    {
                        id: 13, name: "CR7", nested:[{id: 'age', label: "Age", value:"", parent: 'player'}]
                    }
                ]
            },
            {id:"team", label: "Team", value:""},
            {
                id:"player1",
                checkNested: true,
                type:"select", label: "Test Select 1", value: null, multiple: false, keyId:'id', keyLabel:'name', 
                options: [
                    {id: 12, name: "Messi"}, 
                    {
                        id: 14, name: "CR7", nested:[{id: 'age1', label: "Age", value:"", parent: 'player1'}]
                    },
                    {id: 14, name: "Neymar"}, 
                ]
            }
        ]
    }


    showForms(form, function(data){
        console.log(JSON.stringify(data));
    })
}


function preInputForm(item){
    if(!item.placeholder)
        item.placeholder = '';
        
    if(item.required === undefined)
        item.required = true;            

    if(!item.type)
        item.type = 'text';

    if(item.type == 'select'){
        if(item.multiple === undefined)
            item.multiple = false;

        if(!item.keyId)
            item.keyId = 'id';

        if(!item.keyLabel)
            item.keyLabel = 'name';        
    }

    if(!item.maxrows)
        item.maxrows = 5;

    return item;
}

function formChanged(item){
    if(item && item.onChange !== undefined){
        item.onChange(item);
    }


    if(!item || item.checkNested){   


   

        let rows = cloneObj(mainData.form.initialRows);

        let finalRows = [];
        let curRows = mainData.form.rows;



        for(let m = 0; m < rows.length; ++m){
            for(let p = 0; p < curRows.length; ++p){  
                if(rows[m].id == curRows[p].id){
                    rows[m].value = curRows[p].value;
                    finalRows.push(rows[m]);

                    
                    if(rows[m].checkNested){ 
                        for(let a = 0; a < rows[m].options.length; ++a){  
                            for(let b = p; b < curRows.length; ++b){
                                if(curRows[b].id == rows[m].id && rows[m].options[a].id == curRows[b].value){
                                    if(rows[m].options[a].nested){
                                        for(let i = 0; i < rows[m].options[a].nested.length; ++i){
                                            let nestedRows = [];
                                            for(let j = p; j < curRows.length; ++j){
                                                if(rows[m].options[a].nested[i].id == curRows[j].id && (!item || item.id != rows[m].id)){
                                                    rows[m].options[a].nested[i].value = curRows[j].value;  
                                                    
                                                    if(rows[m].options[a].nested[i].checkNested && rows[m].options[a].nested[i].value !== null){
                                                        
                                                        for(let t = 0; t < rows[m].options[a].nested[i].options.length; ++t){
                                                            if(rows[m].options[a].nested[i].options[t].id == rows[m].options[a].nested[i].value){

                                                                for(let y = 0; y < curRows.length; ++y){
                                                                    if(rows[m].options[a].nested[i].options[t].id == curRows[j].id && (!item || item.id != rows[m].id && item.id != rows[m].options[a].id)){
                                                                        rows[m].options[a].nested[i].options[t].value = curRows[y].value;
                                                                    }
                                                                }

                                                                nestedRows = rows[m].options[a].nested[i].options[t].nested;
                                                            }                                                            
                                                        }  
                                                    }
                                                    
                                                }
                                            }

                                            finalRows.push(preInputForm(rows[m].options[a].nested[i]));   
                                            for(let ii = 0; ii < nestedRows.length; ++ii)      
                                                finalRows.push(preInputForm(nestedRows[ii]));   

                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }

        mainData.form.rows = finalRows;

        if(item)
            formChanged(null);
    }
}

function showForms(data, callback, checkFormChange){  
    mainData.form.rows = [];
    mainData.form.allowEdit = true;    

    for(let i = 0; i < data.rows.length; i++)
        data.rows[i] = preInputForm(data.rows[i]);


    mainData.form.initialRows = cloneObj(data.rows);
    
    for(let i = 0; i < data.rows.length; i++){
        data.rows[i] = preInputForm(data.rows[i]);
        if(data.rows[i].loading && data.rows[i].options === null){
            mainData.form.allowEdit = false;
            execute_request(data.rows[i].requestParam, null, null, false, function (r) { 
                if (r.status == "OK"){ 
                    mainData.form.allowEdit = true;
                    data.rows[i].loading = false;
                    if(r.data !== undefined)
                        data.rows[i].options = r.data;
                    else
                        data.rows[i].options = r.results;

                    if(data.rows[i].firstRows)
                        data.rows[i].options = data.rows[i].firstRows.concat(data.rows[i].options);


                    mainData.form.initialRows = cloneObj(data.rows); 
                    mainData.form.rows = data.rows;
                    if(checkFormChange)
                        formChanged(null);
                }
            });
        }


        if(data.rows[i].checkNested){
            for(let j = 0; j < data.rows[i].options.length; j++){
                if(data.rows[i].options[j].nested){
                    for(let m = 0; m < data.rows[i].options[j].nested.length; m++){   
                        
                        if(data.rows[i].options[j].nested[m].loading && data.rows[i].options[j].nested[m].options === null){
                            mainData.form.allowEdit = false;
                            execute_request(data.rows[i].options[j].nested[m].requestParam, null, null, false, function (r) { 
                                if (r.status == "OK"){ 
                                    mainData.form.allowEdit = true;
                                    data.rows[i].options[j].nested[m].loading = false; 
                                    
                                    if(r.data !== undefined)
                                        data.rows[i].options[j].nested[m].options = r.data;
                                    else
                                        data.rows[i].options[j].nested[m].options = r.results;

                                    if(data.rows[i].options[j].nested[m].firstRows)
                                        data.rows[i].options[j].nested[m].options = data.rows[i].options[j].nested[m].firstRows.concat(data.rows[i].options[j].nested[m].options);

                                    mainData.form.rows = data.rows;
                                    mainData.form.initialRows = cloneObj(data.rows); 
                                    if(checkFormChange)
                                        formChanged(null);
                                }
                            });
                        }

                        if(data.rows[i].options[j].nested[m].checkNested){
                            
                            for(let ii = 0; ii < data.rows[i].options[j].nested[m].options.length; ++ii){
                                if(data.rows[i].options[j].nested[m].options[ii].id === data.rows[i].options[j].nested[m].value){
                                    for(let jj = 0; jj < data.rows[i].options[j].nested[m].options[ii].nested.length; ++jj){
                                        data.rows.push(data.rows[i].options[j].nested[m].options[ii].nested[jj]);                                       
                                    }
                                }
                            }
                        }
                    }
                }
                
            }
        }
    }

    

  
    mainData.form.title = data.title;
    mainData.form.rows = data.rows;
    mainData.form.callback = callback;
    mainData.form.keepOnDone = data.keepOnDone;
    mainData.form.loading = data.loading !== undefined ? data.loading : false;
    mainData.form.formWide = data.formWide ? true : false;

    
    if(checkFormChange){        
        formChanged(null);
        formChanged(null);
    }

   
    let modal = $("#mainForm");
    if(!mainData.form.keepOnDone)
        modal.modal('show');

    modal.find(".positive").off("click").click(function(){
        let rows = mainData.form.rows;
        for(let i = 0; i < rows.length; i++){
            if(rows[i].required && (rows[i].value === '' || rows[i].value === null)){
                msg_error(myi18n.t('msg10'));
                return;
            }
        }

        
        if(!mainData.form.keepOnDone){
            modal.modal('hide');
            //mainData.form.rows = [];
            //mainData.form.initialRows = [];
        }


        if(mainData.form.rows[0].id){
            let val = {};
            for(let i = 0; i < rows.length; ++i){
                if(rows[i].type == 'saveTocustomField' || rows[i].type == 'customFieldTo'){
                    val[rows[i].id] = [];
                    let mapping = rows[i].mapping;

                    for(let j = 0; j < mapping.length; j++){
                        if(mapping[j].input !== '' && mapping[j].saveTo)
                            val[rows[i].id].push({input: mapping[j].input, saveTo: mapping[j].saveTo})
                    }
                }else
                    val[rows[i].id] = rows[i].value;                
            }

            callback(val);
        }else
            callback(cloneObj(rows));

        

    })
    
}






if (window.location.hash == "#_=_")
  window.location.hash = "";

var my_perm = null;
var cur_page = null;
var accessToken = null;
var my_fb_id = null;
var appDomain = null, appFbId = null, fbRedirect = '', wtID;


var whitelabel = null;
if(docCookies.getItem("wt") && !location.href.includes("/admins/")){
    try{
        whitelabel = JSON.parse(docCookies.getItem("wt"));
    }catch(ex){
        whitelabel = JSON.parse(urldecode(docCookies.getItem("wt")));
    }
    
    if(!whitelabel.dynamic){
        checkWhitelabel();
    }else{
        mainData.wt = whitelabel;
        mainData.navMenu = whitelabel.dynamic.menu;
        appDomain = whitelabel.appdomain;
        if(whitelabel.fb){
            appFbId = whitelabel.fb.app;
            fbRedirect = whitelabel.fb.redirect;
        }else{
            appFbId = null;
            fbRedirect = null;
        }
        
        wtID = whitelabel.id;
        sfHideContents();
    }

      
}else{
    checkWhitelabel();
}


// ============================================================================== Loading.js ============================================================= //


function pb_show(visible, msg) {
    if (typeof msg !== "undefined")
        msg = "<pre class\"txt_loading\">" + msg + "</pre>";
    else
         msg = myi18n ? myi18n.t('loading') : myi18n.t('loading');

    mainData.loading.stauts = visible;
    mainData.loading.msg = msg;
    $("#p_pb_info").html(msg);    
}


var pgb_load_data_stop = 0;
function pgb_load_data_show(visible) {
    if (visible) {       
        $("#pgb_load_data").show();
        pb_stop = 0;
        var pb = $('#pgb_load_data').circleProgress({
            value: 1,
            size: 25,
            lineCap: "round",
            reverse: false,
            thickness: 2,
            emptyFill: "rgba(0, 0, 0, .2)",
            fill: {
                color: "rgba(0, 0, 0, .5)"
            }
        });

        pb.on('circle-animation-end', function (event) {
            if (pgb_load_data_stop >= 0) {
                pb.circleProgress('value', pgb_load_data_stop % 2);
                pgb_load_data_stop++;
            }
        });
    } else {
        pgb_load_data_stop = -1;
        $("#pgb_load_data").hide();
    }
}










function show_fb_error(fb_error){
    if(fb_error !== undefined && fb_error.error != undefined){
        var error = fb_error.error;
        if(error.error_user_title !== undefined)
            show_model(true, error.error_user_title+"<br><br>"+error.error_user_msg, 'OK', '');
        else
            show_model(true, error.message,'OK', '');
    }else
        msg_error(myi18n.t('msg0'));
}



// ============================================================================== model.js ============================================================= //
$("#model").html('<div id="modal_main" class="modal fade"> <div class="modal-dialog"> <div class="modal-content"><div class="modal-header"> <div class="invisible"></div><h5 class="modal-title"></h5> <div class="modal-dismiss" data-dismiss="modal" aria-label="Close"> <i class="fal fa-times"></i> </div></div> <div class="modal-body"> <p id="p_msg" style="max-width: 100% !important; overflow-x: hidden !important"></p></div><div class="modal-footer"> <div class="d-flex px-3 py-2 justify-content-between w-100"> <button id="btt_cancel" data-dismiss="modal" type="button" class="btn btn-outline-secondary nagative">Cancel</button> <button id="btt_yes" data-dismiss="modal" type="button" class="btn btn-primary positive">Continue</button> </div></div></div></div></div>');
function show_model(b_visible, smg, str_ok, str_btt_cancel, function_ok, title) {
    let modalM = $("#modal_main");
    if (b_visible) {        

        let header = modalM.find('.modal-header');
        let footer = modalM.find('.modal-footer');
        let btt_yes = modalM.find("#btt_yes");

        if( title != null && title != undefined){
            header.removeClass('hide');
            header.find(".modal-title").html(title);
        }else
            header.addClass('hide');


        modalM.find("#p_msg").html(smg);
        if(str_ok != "" && str_ok != undefined){
            footer.removeClass('hide');
            btt_yes.html(str_ok);
        }else
            footer.addClass('hide');

        let btt_cancel = modalM.find("#btt_cancel")
        btt_yes.unbind('click');
        btt_cancel.unbind('click');

        
        if (str_btt_cancel != "" && str_btt_cancel != undefined) {
            btt_cancel.html(str_btt_cancel);
            btt_cancel.removeClass('invisible');        
        } else
            btt_cancel.addClass('invisible');


        
        
        if(function_ok != undefined){
            footer.removeClass("hide");
            btt_yes.click(function_ok);
        }

        
        modalM.modal('show');
    } else
        modalM.modal('close');
}















var simplified = $("body").data("simplified") == "1" || location.href.includes('/s/');

function msg_success(text, delay){        
        if(text === undefined){
            text = myi18n ? myi18n.t('success') : 'Success';
            var width = '200px';
        }else
            var width = '360px';


        
        if(delay === undefined)
            delay = 2000;

        PNotify.success({
            stack: {'dir1': 'right', 'dir2': 'up', 'firstpos1': 25, 'firstpos2': 25},
            text: text,
            icon: false,
            delay: delay,
            width: width,
            modules: {
                Animate: {
                animate: true,
                inClass: 'rotateInUpRight',
                outClass: 'bounceOut'
                }
            }
        });
}


function msg_error(text, delay){        
    if(text === undefined){
        text = myi18n.t('msg0');
        var width = '200px';
    }else
        var width = '360px';

    
    if(delay === undefined)
        delay = 4000;

    PNotify.error({
        stack: {'dir1': 'right', 'dir2': 'up', 'firstpos1': 25, 'firstpos2': 25},
        text: text,
        icon: false,
        delay: delay,
        width: width,
        modules: {
            Animate: {
            animate: true,
            inClass: 'rotateInUpRight',
            outClass: 'bounceOut'
            }
        }
    });
}



//docCookies.setItem("lang", 'en', Infinity, "/bots/");



    $(document).ready(function () {
        sfHideContents();
        let forder_C_C = $(".forder_C_C");
        if(forder_C_C){
            forder_C_C.addClass("margen_auto").addClass("mt-5").addClass("mb-5").addClass("px-0");
            forder_C_C.append('<div> <nav aria-label="breadcrumb"> <ol class="breadcrumb bfolder mb-0"> </ol> </nav> </div><div class="forder_C row "> </div>');
        }


        try{
            $('[data-toggle="tooltip"], [data-toggle-second="tooltip"]').tooltip();             
        }catch(ex){}


        handleCbxAll();
        

        try{
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
                $('.selectpicker').selectpicker('mobile');
        }catch(ex){}

        var all_div_dismiss_info = $(".div_dismiss_info");
        for(var i = 0; i < all_div_dismiss_info.length; i++){
            try{
                var div = all_div_dismiss_info.eq(i)
                if(!docCookies.hasItem(div.data("information"))){
                    get_elem_parent(div, 'margen_auto').removeClass('d-none');

                    div.click(function(e){
                        e.stopPropagation();
                        docCookies.setItem(div.data("information"), 1, Infinity, "/");
                        get_elem_parent(div, 'margen_auto').addClass('d-none');
                    })

                }
            }catch(ex){}
        }
    });



    function handleCbxAll(){
        try{
            if(total_checked.length > 0){
                $(".tb_cbx_all").off("change").on("change", function(){
                    var idx = $(this).data("idx");
                    if(this.checked)
                        total_checked[idx].total = total_checked[idx].total_data;
                    else
                        total_checked[idx].total = 0;
                    
                    $('#'+total_checked[idx].table_id+' tr td:first-child input:checkbox').not(this).prop('checked', this.checked);

                    update_table_cbx(idx);
                    
                });
            }
        }catch(ex){}
    }

    function init_search_bar(){
        try{
            
            var url = getPHPUserScript()+'?op=search-bar&op1=search&op2={query}';
            if(cur_page)
                url+="&acc="+cur_page.page_id;

            if(searchContent)
                url+="&content="+searchContent;


            $('.ui.search').search({
                
                apiSettings: {
                    url: url
                },
                fields: {
                    results : 'results',
                    title   : 'title',
                    url     : 'url'
                },
                minCharacters : 2,
                searchDelay: 150,
                maxResults: 300
            });
        }catch(ex){}        
    }

    function tb_cbx_recheck(idx){

        total_checked[idx].total = $("#"+total_checked[idx].table_id+" .tb_cbx:checkbox:checked").length;
        total_checked[idx].total_data = $("#"+total_checked[idx].table_id+" .tb_cbx:checkbox").length;
        tb_cbx_change("#"+total_checked[idx].table_id+" ");

        if(total_checked[idx].total != 0 && total_checked[idx].total == total_checked[idx].total_data)
            $(".tb_cbx_all[data-idx='"+idx+"'").prop('checked', true);
        else
            $(".tb_cbx_all[data-idx='"+idx+"'").prop('checked', false);

        update_table_cbx(idx); 
    }

    

    function tb_cbx_change(table_id){
        $(table_id+".tb_cbx").off("change").on("change", function(){
            var idx = $(this).data("idx");
            if(this.checked)
                total_checked[idx].total++;
            else
                total_checked[idx].total--;
            
            if(total_checked[idx].total == total_checked[idx].total_data)
                $(".tb_cbx_all[data-idx='"+idx+"'").prop('checked', true);
            else
                $(".tb_cbx_all[data-idx='"+idx+"'").prop('checked', false);


            update_table_cbx(idx); 
        });
    }

    function urldecode(url) {
        return decodeURIComponent(url.replace(/\+/g, ' '));
    }

    

    function removeParams(sParam)
    {
        var url = window.location.href.split('?')[0]+'?';
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
              for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] != sParam) {
                url = url + sParameterName[0] + '=' + sParameterName[1] + '&'
            }
        }
        return url.substring(0,url.length-1);
    }


    function replaceUrlParam(url, paramName, paramValue)
    {
        if (paramValue == null) {
            paramValue = '';
        }
        var pattern = new RegExp('\\b('+paramName+'=).*?(&|#|$)');
        if (url.search(pattern)>=0) {
            return url.replace(pattern,'$1' + paramValue + '$2');
        }
        url = url.replace(/[?#]$/,'');
        return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
    }
    

    function numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function convertLocalStrToUTC(strdate) {
        let d = new Date(strdate);
        if(d === 'Invalid Date')
            d = new Date(strdate.replace(/ /g,"T"));

        return convertDateToUTC(d);
    }


    function getDateFormat(year){
        if(year)
            return 'MMMM dd, yyyy h:mma';
        else
            return 'MMMM dd, h:mma';
    }

    function convertStrTostrLocal(strdate, format){
        if(format == undefined)
            format = myi18n.t('dateTimeFormate');  

        let d = new Date(strdate);
        if(d === 'Invalid Date')
            d = new Date(strdate.replace(/ /g,"T"));

        return moment(new Date(d)).format(format);
    }

    function convertLocalStrToUTCStr(strdate){
        var dt = new Date(strdate);
        return moment(convertDateToUTC(dt)).format("YYYY-MM-DD HH:mm:ss");
    }

    function convertDateToUTC(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    function local_str_to_UTCstr(str_local){
        let d = new Date(str_local);
        if(d === 'Invalid Date')
            d = new Date(str_local.replace(/ /g,"T"));

        return moment(convertDateToUTC(d)).format("YYYY-MM-DD HH:mm:ss");
    }

    function getRangeName(start, end, label){
        if(myi18n){
            if(label == myi18n.t('customRange'))
                return start.format(myi18n.t('dateFormate'))+ " - "+end.format(myi18n.t('dateFormate'));
            else
                return label;
        }else{
            if(label == 'Custom Range')
                return start.format(myi18n.t('dateFormate'))+ " - "+end.format(myi18n.t('dateFormate'));
            else
                return label;
        }
    }

    function get_daterange_lng(allow_time){  
        if(myi18n)
            return {
                format: allow_time ? myi18n.t('dateTimeFormate') : myi18n.t('dateFormate'),
                cancelLabel: myi18n.t('cancel'),
                applyLabel: myi18n.t('continue'),
                customRangeLabel: myi18n.t('customRange'),
                fromLabel: myi18n.t('from'),
                toLabel: myi18n.t('to'),
                separator: "-",
                
            };
        else 
            return {
                "format": allow_time ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD",
                "separator": "-",
            };
    }
    
    function get_dsbd_ranges(){
        if(myi18n){
            var ranges = {}
            ranges[myi18n.t('today')] = [moment(), moment()];
            ranges[myi18n.t('yesterday')] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            ranges[myi18n.t('last7days')] = [moment().subtract(6, 'days'), moment()];
            ranges[myi18n.t('last30days')] = [moment().subtract(29, 'days'), moment()];
            ranges[myi18n.t('thisMonth')] = [moment().startOf('month'), moment().endOf('month')];
            ranges[myi18n.t('lastMonth')] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            ranges[myi18n.t('lifetime')] = [moment('2010-01-01', 'YYYY-MM-DD'), moment()]

            return ranges;
        }else
            return {            
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 days': [moment().subtract(6, 'days'), moment()],
                'Last 30 days': [moment().subtract(29, 'days'), moment()],
                'This month': [moment().startOf('month'), moment().endOf('month')],
                'Last month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'Lifetime': [moment('2010-01-01', 'YYYY-MM-DD'), moment()]
            }
    }



    function date_to_str(date, format){
        if(format === undefined)
            format = "YYYY-MM-DD HH:mm:ss";

        return moment(date).format(format);
    }

    function getTimestamp(milliseconds){
        if(milliseconds)
            return new Date().getTime();
        else
            return Math.round(new Date().getTime()/1000);
    }

    function timestamp_to_date(timestamp){
        return moment.utc(new Date(timestamp*1000));
    }

    function today_as_timestamp(){
        let now = new Date().getTime()/1000;
        return now - now % 86400;
    }

    function timestamp_to_local_date(timestamp){
        return moment.utc(new Date(timestamp*1000)).local();
    }

    function timestamp_to_local_str(timestamp, format){
        try{
            if(format === undefined)
                format = 'L LT';
                
            return moment.utc(new Date(timestamp*1000)).local().format(format);
        }catch(ex){}
            return 'Invalid Date'
    }

    function local_str_to_timestamp(local_str){
        return parseInt(moment(local_str).format("X"));

    }

    function strDate_to_short(date){   
        return timestampToShort(local_str_to_timestamp(date));
    }

    function timestampToShort(timestamp){
        return moment.utc(new Date(timestamp*1000)).fromNow();
    }

    function utc_str_to_timestamp(utc_str){
        return parseInt(moment.utc(utc_str).format("X"));
    }


    function UTC_to_local_strdate(str_utcTime, format, tz_offset) {
        if(format == undefined)
            format = 'L LT';

        if(tz_offset === undefined)
            tz_offset = moment().utcOffset();   

        return moment.utc(str_utcTime).utcOffset(tz_offset).format(format);
    }    


    function UTC_to_local_date(str_utcTime) { 
        return moment.utc(str_utcTime).utcOffset(moment().utcOffset()).toDate();
    }

    
    function reload_dashboard(){
        pb_show(true);
        load_all();
    }

    function get_profile_pic(img_perfil, url, e) {
        img_perfil.src = url;
        img_perfil.style.opacity = "1";
        img_perfil.style.pointerEvents = "none";

        if(e !== undefined)
            e.stopPropagation();
    }

   

    var lngs= [
        {"name" : "Afrikaans", "lng": 0, "l": "af_ZA"}, {"name" : "Arabic", "lng": 1, "l": "ar_AR"}, {"name" : "Bengali", "lng": 2, "l": "bn_IN"}, 
        {"name" : "Bosnian", "lng": 3, "l": "bs_BA"}, {"name" : "Bulgarian", "lng": 46, "l": "bg_BG"}, {"name" : "Chinese (Simplified)", "lng": 4, "l": "zh_CN"},{"name" : "Chinese (Traditional)", "lng": 42, "l": "zh_TW"},{"name" : "Dutch", "lng": 5, "l": "nl_NL"}, 
        {"name" : "Danish", "lng": 6, "l": "da_DK"}, {"name" : "English GB", "lng": 7, "l": "en_GB"}, {"name" : "English US", "lng": 8, "l": "en_US"}, 
        {"name" : "English", "lng": 9, "l": "en"}, {"name" : "Estonian", "lng": 10, "l": "et_EE"}, {"name" : "Filipino", "lng": 11, "l": "tl_PH"}, 
        {"name" : "Finnish", "lng": 12, "l": "fi_FI"}, {"name" : "French", "lng": 13, "l": "fr_FR"},{"name" : "Georgian", "lng": 14, "l": "ka_GE"}, 
        {"name" : "German", "lng": 15, "l": "de_DE"}, {"name" : "Greek", "lng": 16, "l": "el_GR"}, {"name" : "Hebrew", "lng": 48, "l": "he_IL"}, {"name" : "Hind", "lng": 17, "l": "hi_IN"},
        {"name" : "Hungarian", "lng": 18, "l": "hu_HU"},{"name" : "Indonesian", "lng": 19, "l": "id_ID"},{"name" : "Italian", "lng": 20, "l": "it_IT"},
        {"name" : "Japanese", "lng": 21, "l": "ja_JP"},{"name" : "Khmer", "lng": 45, "l": "km_KH"},{"name" : "Korean", "lng": 22, "l": "ko_KR"}, {"name" : "Latvian", "lng": 23, "l": "lv_LV"},
        {"name" : "Lithuanian", "lng": 24, "l": "lt_LT"}, {"name" : "Malay", "lng": 25, "l": "ms_MY"}, {"name" : "Norwegian", "lng": 26, "l": "nb_NO"},
        {"name" : "Pashto", "lng": 43, "l": "ps_AF"},{"name" : "Persian", "lng": 44, "l": "fa_IR"},{"name" : "Polish", "lng": 27, "l": "pl_PL"}, {"name" : "Portuguese BR", "lng": 28, "l": "pt_BR"}, {"name" : "Portuguese PT", "lng": 29, "l": "pt_PT"},
        {"name" : "Romanian", "lng": 30, "l": "ro_RO"},{"name" : "Russian", "lng": 31, "l": "ru_RU"}, {"name" : "Serbian", "lng": 32, "l": "sr_RS"},
        {"name" : "Slovak", "lng": 33, "l": "sk_SK"},{"name" : "Slovenian", "lng": 34, "l": "sl_SI"}, {"name" : "Spanish", "lng": 35, "l": "es_ES"}, 
        {"name" : "Swedish", "lng": 36, "l": "sv_SE"}, {"name" : "Thai", "lng": 37, "l": "th_TH"},{"name" : "Turkish", "lng": 38, "l": "tr_TR"}, 
        {"name" : "Ukrainian", "lng": 39, "l": "uk_UA"}, {"name" : "Urdu", "lng": 40, "l": "ur_PK"}, {"name" : "Vietnamese", "lng": 41, "l": "vi_VN"},
    ]



    function lng_tostring(lng) { 
        for(var i = 0; i < lngs.length; i++){
            if(lngs[i].lng == lng)
                return  lngs[i].name;
        }

        return myi18n.t('unknown');
    }


    function locale_tostring(locale) { 
        if(locale === 'default')
            return locale;
        for(var i = 0; i < lngs.length; i++){
            if(lngs[i].l == locale)
                return  lngs[i].name;
        }

        return myi18n.t('unknown');
    }

    function get_lngFromlng(lng){
        for(var i = 0; i < lngs.length; i++){
            if(lngs[i].lng == lng)
                return  lngs[i];
        }

        return {"name" : myi18n.t('unknown'), "lng": -1, "l": "_"};
    }



    function check_error(json, default_error) {
        if(json instanceof Array && json.length){           
            for(let i = 1; i < json.length; i++)
                check_error(json[i]);

            json = json[0];
        }


        if (json.status == "OK" && json.code != 99)
            return true;

       

        if (json.code == 1) {
            let url = '';
            if(whitelabel)
                url = whitelabel.appdomain+whitelabel.folder+"/login";
            else
                url = '/en/login';

            if(!json.forced)
                url+= "?r="+encodeURIComponent(window.location.href);

            window.location.href = url;
        } else if (json.code == 4 || json.code == 2) {
            got_page_error(json.code == 4 ? 0 : 1);
        }else if (json.code == 10) {
            let data = json.data;
            show_connectBotToAdmin(data.ref, data.channel, data.text, 'connect');
            return true;
        }else if (json.code == 14) {
            let data = json.data;
            show_connectBotToAdmin(data.ref, data.channel, data.text, 'interact');
            return true;
        }else if (json.code == 403) {
            let msg;
            
            if(json.message )
                msg = message
            else if(json.subcode == 1)
                msg = myi18n.t('msg47');
            else if(json.subcode == 2)
                msg = myi18n.t('msg48');
            else
                return false;

            setTimeout(function (){
                show_model(true, msg, myi18n.t('ok'), "", "");
            }, 700);    
            
        }else if (json.code == 15) {
            show_model(true, myi18n.t('msg31'), myi18n.t('errorLog'), myi18n.t('cancel'), "");
            $("#btt_yes").click(function () {
               open_link('error-log?acc='+cur_page.page_id, 1);
            });
            return true;
        }else if (json.code == 71) {
            setTimeout(function (){
                show_model(true, myi18n.t('msg32'), myi18n.t('ok'), "", "");
            }, 700);            
            return true;
        }else if (json.code == 73) {
            setTimeout(function (){
                show_model(true, myi18n.t('u.msg23'), myi18n.t('ok'), "", "");
            }, 700);            
            return true;
        }else if (json.code == 98 && json.msg) {
            setTimeout(function(){
                show_model(true, json.msg, myi18n.t('ok'), "", "");
            }, 700)
            return true;
        }else if (json.code == 1000) {
            let str = myi18n.t('msg14_0');
            if(json.data)
                str+="<br><br><b>"+json.data.name+"</b>";

            show_model(true, str, myi18n.t('ok'), "", "");
            return true;
        }else if (json.code == 99) {
            if(json.url){
                if(json.new_window)
                    open_link(json.url, 1);
                else
                    window.location.href = json.url; 
            }else
                window.location.reload();
                       
            return true;
        }else if (default_error) {
            show_model(true, get_str(22, json.code), myi18n.t('ok'), "", "");
            return true;
        }

        return false;
    }

    $(".icon_info").click(function () {
        var info = $(this).data("info");
        show_model(true, info, myi18n.t('ok'), "", "");
    });

    function got_page_error(code) {   
        if(whitelabel){
            if(code !== undefined)
                window.location.href = whitelabel.appdomain+whitelabel.folder+"/error?code="+code;
            else
                window.location.href =  whitelabel.appdomain+whitelabel.folder+"error";
        }else{
            if(code !== undefined)
                window.location.href = "error?code="+code;
            else
                window.location.href = "error";
        }       
        
    }


    function isURL(str){
        try {
            if(str.startsWith('viber://'))
                return true;

            if(str.startsWith('data:')){
                show_model(true, 'It seems that you copied the image on Google. You need to click on the image, wait for the image to load, and copy the image address.', 'OK', '');
                return false;
            }

            new URL(str);
            return true;
        } catch (_) {
            return false;  
        }
    }



    function removeParam(key, sourceURL) {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            if(params_arr.length > 1)
                rtn = rtn + "?" + params_arr.join("&");

        }
        return rtn;
    }



    function gender_tostring(gender) {
        if(myi18n){
            if (gender == 0)
            return myi18n.t('female');
        else if (gender == 1)
            return myi18n.t('male');
        else
            return myi18n.t('unknown');
        }else{
            if (gender == 0)
                return myi18n.t('female');
            else if (gender == 1)
                return myi18n.t('male');
            else
                return get_str(7);
        }
        
    }

    function info_value(text){
        return "<span class=\"txt_primary_color\">"+text+"</span>";
    }


    $(".popup_box_c").click(function (){
        $(this).hide();
    });


    function rank_to_str(rank) {
        if (rank == 10)
            return myi18n.t('default');
        else
            return rank;
    }



    function replace_boturl(){
    var all_a =  $("a[data-boturl='1']");
    for(var i = 0; i < all_a.length; i++){
            var href = all_a.eq(i).attr('href');
            all_a.eq(i).attr('href', href.replace("00000000", my_perm.page_id));
        }
    }



    function manage_bot(page_id){
        pb_show(true);
        let param = { "op": "manage_bot", "page_id": page_id};
        execute_request(param, null, null, false, function (data) {   
            if(data.status == "OK"){
                window.location.href = replaceUrlParam(window.location.href, 'acc', page_id);
            }else if(!check_error(data))
                pb_show(false); 
        })
    }

    function goToInbox(ms_id){
        window.location.href="inbox?id="+ms_id+"&acc="+cur_page.page_id;
    }

    

    function delete_one(btt, table_id, id, op) {
        show_model(true, myi18n.tc('msg2', 1)+' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
        $("#btt_yes").click(function () {
            pb_show(true, myi18n.t('processing'));
            let param = {op: op, op1: "delete", id: id };
            execute_request(param, null, null, false, function (data) {    
                pb_show(false);
                setTimeout(function () {
                    if (data.status == "OK") {  
                        $("#t_contextMenu").appendTo("body");
                        $(table_id).DataTable().row($("#tr"+id)).remove().draw();
                    }
                }, 500);    
            })
            
        });
    }

  

    function update_table_cbx(idx) {
        let bttID = total_checked[idx].bttdel ? total_checked[idx].bttdel : '#btt_tb_global_del';
        if (total_checked[idx].total > 0){
            $(bttID).removeClass("hide");
            mainData.tabaleActions = true;
        }else{
            mainData.tabaleActions = false;
            $(bttID).addClass("hide");
        }

        try{tb_cbx_change1(idx)}catch(ex){}
    }

    function delete_single(btt, id, op) {
        show_model(true, myi18n.tc('msg2')+ ' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
        $("#btt_yes").click(function () {
            $('#btt_yes').unbind('click');
            pb_show(true, myi18n.t('processing'));
            var param = {op: op, op1: "delete", "id": id };

            execute_request(param, null, null, false, function (data) {    
                pb_show(false);
                setTimeout(function () {
                    if (data.status == "OK") {
                        btt.closest('tr').remove();
                    }
                    
                }, 500);     
            })

            
        });
    }

    function moveItemsToFolder(table_id, type, table_idx){
        if(table_idx === undefined)
            cur_table_idx = 0;
        else
            cur_table_idx = table_idx;

        let ids = [];
        $all_tb_cbx = $("#"+table_id+" .tb_cbx:checkbox:checked");    
        for(let i = 0; i < $all_tb_cbx.length; i++)
            ids.push($all_tb_cbx.eq(i).data("id"));

        
        startSelectFolder(ids, type);        
    }

    function delete_multiple(op, table_id, op1) {    
        var ids = [];
        $all_tb_cbx = $("#"+table_id+" .tb_cbx:checkbox:checked");    
        for(var i = 0; i < $all_tb_cbx.length; i++)
            ids.push($all_tb_cbx.eq(i).data("id"));
        
        if($all_tb_cbx.length == 0){
            show_model(true, myi18n.t('msg1'), myi18n.t('ok'), "", "");
            return;
        }


        show_model(true, myi18n.tc('msg2', ids.length) + " "+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
        $("#btt_yes").click(function () {
            pb_show(true, myi18n.t('processing'));

            var param = null;
            if(op1 == undefined || op1 == '')
                param = { op: op, op1: "delete", ids: ids};
            else
                param = { op: op, op1: op1, op2: "delete", ids: ids};
            
            param.page_id = cur_page.page_id;

            execute_request(param, null, null, false, function (data) {    
                pb_show(false);
                setTimeout(function () {
                    if (data.status == "OK") {
                        $all_tb_cbx = $("#"+table_id+" .tb_cbx:checkbox:checked");    
                        for(var i = 0; i < ids.length; i++){
                            $("#"+table_id).DataTable().row($("#"+table_id+" #tr"+ids[i])).remove();
                        } 

                        $("#"+table_id).DataTable().draw();

                        $(".tb_cbx_all[data-table='"+table_id+"'").prop('checked', false);
                        $("#btt_tb_global_del").addClass("hide");
                    }
                }, 500);    
            })
            
        });
    }


    function scroll_elm(elm){
        var offset = elm.offset().top - 100;
        if(offset < 0)offset = 0;
        $('html, body').animate({
            scrollTop: offset
        }, 500);
    }

    function scroll_smof(offset){
        $('html, body').animate({
            scrollTop: offset
        }, 500);
    }

    function is_google_chart_load(){
        try{
        if ((typeof google === 'undefined') || (typeof google.visualization === 'undefined') || (typeof google.visualization.PieChart  === 'undefined'))
            return false;
        else
            return true;
        }catch(ex){return false}
    }

    function get_link(ref, msg, channel, copy, allowedChannels){
        if(copy === undefined)
            copy = true;

        if(channel === undefined)
            channel = 0;
            
        var url = null;

        if(ref !== null)
            ref+= "";
        
      
        

        if(ref === null || !ref.startsWith('https://')){
            if(channel == 'viber' || channel == 12){
                if(!cur_page.viber){
                    msg_error(myi18n.tc('msg8', 'Viber'));
                    return;
                }

                url = "viber://pa?chatURI="+cur_page.viber.username;
                if(ref != null)
                    url += "&context="+ref;
            }else if(channel == 'telegram' || channel == 8){
                if(!cur_page.telegram){
                    msg_error(myi18n.tc('msg8', 'Telegram'));
                    return;
                }

                url = "https://t.me/"+cur_page.telegram.username;
                if(ref != null)
                    url += "?start="+ref;
            }else if(channel == 'whatsapp' || channel == 5){
                if(!cur_page.whatsapp){
                    msg_error(myi18n.tc('msg8', 'WhatsApp'));
                    return;
                }

                url = "https://wa.me/"+cur_page.whatsapp.number;
                if(ref != null)
                    url += "?text="+encodeURI("/"+ref);

            }else if(channel == 'webchat' || channel == 9){
                url = cur_page.domain+"webchat/?p="+cur_page.page_id;
                if(ref != null)
                    url += "&ref="+ref;
            }else if(channel == 'instagram' || channel == 10){
                if(cur_page.instagram){
                    url = "https://ig.me/m/"+cur_page.instagram.username

                    if(ref !== null)
                        url += "?ref="+ref;
                }else
                    return null;
                

            }else if(channel == 7 || channel == 'googleBM' || channel == 'gbm'){
                if(ref === null)
                    url ="https://businessmessages.google.com/widget/agent/"+cur_page.gbm.agentID;
                else
                    return null;
            }else if(channel == -1){
                url = cur_page.domain+"bots/"+cur_page.page_id+"/l/"
                if(ref !== null)
                    url +=ref;

            }else if(channel == 'omnichannel' || channel == 'sms'){
                let fbURL, wLink, tLink, igLink, omnichannelLink;

                let links = [];

                if(channel == 'sms')
                    allowedChannels = [2];

                if((!allowedChannels || allowedChannels.includes(-1))){
                    omnichannelLink = cur_page.domain+"bots/"+cur_page.page_id+"/l/"
                    if(ref !== null)
                        omnichannelLink +=ref;
    
                    links.push({'url': omnichannelLink, name: 'Omnichannel', color: '#303133', icon: 'fal fa-dice-d20'});
                }
                
                


                if(cur_page.messenger_id != 0 && (!allowedChannels || allowedChannels.includes(0))){
                    fbURL = 'https://m.me/'+cur_page.username;
                        
                    if(ref != null)
                        fbURL += "?ref="+ref;

                    links.push({'url': fbURL, name: 'Messenger', color: '#0078FF', icon: 'fab fa-facebook-messenger'});
                }

                if(cur_page.instagram && (!allowedChannels || allowedChannels.includes(10))){
                    igLink = "https://ig.me/m/"+cur_page.instagram.username
    
                    if(ref !== null)
                        igLink += "?ref="+ref;

                    links.push({'url': igLink, name: 'Instagram', color: '#833AB4', icon: 'fab fa-instagram'});
                }
                

                if(cur_page.whatsapp && (!allowedChannels || allowedChannels.includes(5))){
                    wLink = 'https://wa.me/'+cur_page.whatsapp.number;
                    if(ref != null)
                        wLink += "?text="+encodeURI("/"+ref);

                    links.push({'url': wLink, name: 'WhatsApp', color: '#4AC959', icon: 'fab fa-whatsapp'});
                }
                

                if(cur_page.telegram && (!allowedChannels || allowedChannels.includes(8))){
                    tLink ="https://t.me/"+cur_page.telegram.username;
                    if(ref !== null)
                        tLink += "?start="+ref;

                    links.push({'url': tLink, name: 'Telegram', color: '#0088cc', icon: 'fab fa-telegram'});
                }

                if(cur_page.sms && cur_page.sms.number && (!allowedChannels || allowedChannels.includes(2))){
                    if(ref !== null){
                        links.push({'url': "sms:"+cur_page.sms.number+"&body="+encodeURI("/"+ref), name: 'SMS Link (iPhone)', color: '#555', icon: 'fa-thin fa-sms'});
                        links.push({'url': "sms:"+cur_page.sms.number+"?body="+encodeURI("/"+ref), name: 'SMS Link (Android)', color: '#555', icon: 'fa-thin fa-sms'});
                    }else
                        links.push({'url': "sms:"+cur_page.sms.number, name: 'SMS', color: '#555', icon: 'fa-thin fa-sms'});

                }



                if(cur_page.viber && (!allowedChannels || allowedChannels.includes(12))){
                    
                    let vLink = "viber://pa?chatURI="+cur_page.viber.username;
                    if(ref !== null)
                        vLink += "&context="+ref;

                    links.push({'url': vLink, name: 'Viber', color: '#7360F2', icon: 'fa-brands fa-viber'});                    
                }

                if(!allowedChannels || allowedChannels.includes(9)){
                    let webChatLink = cur_page.domain+"webchat/?p="+cur_page.page_id;
                    if(ref !== null)
                        webChatLink += "&ref="+ref;
    
    
                    links.push({'url': webChatLink, name: 'WebChat', color: '#555', icon: 'fal fa-comment-dots'});
                }



                if(links.length > 0){
                    let strText = '';
                    for(let i = 0; i < links.length; i++)
                        strText += '<div class="d-flex justify-content-between align-items-center py-2 w-100"><div class="d-flex align-items-center"><i style="color:'+links[i].color+'" class="'+links[i].icon+' h2 mb-0 mr-3"></i> '+links[i].name+' </div> <button type="button" class="btn btn-primary" onclick="copyTextToClipboard(\''+links[i].url+'\');">'+myi18n.t('copy')+'</button></div>';
                    
                    show_model(true, strText, null, null, null, myi18n.t('getLink'));

                    return
                }else
                    url = fbURL;
                
            }else /*if(channel == 'standard' || channel == -0 || channel == -2)*/{
                var url = "https://m.me/"+cur_page.username;
            
                if(ref != null)
                    url += "?ref="+ref;
            }
            
            
            if(msg == undefined)
                msg = myi18n.t('msg21');
        }else{
            url = ref;
            if(msg == undefined)
                msg = '';
        }
        
        if(copy)
            copyTextToClipboard(url);
        else
            return url

    }

    function get_payload(payload){ 
        show_model(true, payload, myi18n.t('copy'), myi18n.t('cancel'), "");
        $("#btt_yes").click(function () {
            copyTextToClipboard(payload);
        });
    }


    function copyTextToClipboard(text, show_success) {
        if(show_success === undefined)
            show_success = true;

        var textArea = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            return document.execCommand('copy');
        } catch (err) {
            return false;
        } finally {
            if(show_success && msg_success)
                msg_success(myi18n.t('success'), 2000);

            document.body.removeChild(textArea);
        }
    }

    function F_ajust_div_height(div_class, padding) {
        var max_height = 0;
        $(div_class).each(function (i) {
            if (max_height < $(this).height())
                max_height = $(this).height();
        });
    
        $(div_class).css("height", max_height + padding);
    }

    function get_ctgr_name(id, level) {
        var results = null;
        if (level == 0)
            results = category0;
        else if (level == 1)
            results = category1;
        else if (level == 2)
            results = category2;
        else
            results = category3;

        for (var i = 0; i < results.length; i++) {
            if (id == results[i].id)
                return results[i].n;
        }

        return myi18n.t('none');
    }

    function dashb_area_op(title, color, legend){

        var c = "#007BFF";
        if(mainData.wt.color && mainData.wt.color.primary)
            c = mainData.wt.color.primary;

        if(color == undefined)
            color = [c, '#FD7217', '#E11DBB', '#026268' ];

        if(legend == undefined)
            legend = {position : 'none'}


        return {
            title: title,
            legend: legend,
            chartArea: {left: 25, width: '100%', height: '80%'},
            animation: {
                startup: true,
                duration: 1000,
                easing: 'inAndOut'
            },
            hAxis: {                    
                format: 'MMM d',
                legendTextStyle: { color: '#111' },
                gridlines: {color: 'none' },
                textStyle:{color: "#99979c", fontSize: 12},
                titleTextStyle:{
                    color: "#99979c"
                }
            },
            vAxis: {
                baselineColor: 'b3b3b3',
                format: 'short',
                gridlines: { count: -1, color: 'none' },
                textStyle:{color: "#99979c", fontSize: 12},
                titleTextStyle:{color: "#99979c"}
            },
            titleTextStyle: {
                color: '#000',
                bold: false,
                fontSize: 14
            },
            legend:{
                textStyle:{
                    color: "#99979c",
                    fontSize: 12
                }
            },
            curveType: 'function',
            fontName: 'Roboto',
            lineWidth: 0.5,
            backgroundColor: { fill: 'white' },
            colors: color
        };

    }

    function dashb_pie_op(title, colors){
        if(colors == undefined)
        {
            var c = "#007BFF";
            if(mainData.wt.color && mainData.wt.color.primary)
                c = mainData.wt.color.primary;

            colors = [c,'#FD7217', '#12266C', '#D10079', '#d40000', '#333', '#808000', '#ffff00', '#008000', '#008080'];
        }
        
        return options = {
                'title': title,
                animation: {
                    startup: true,
                    duration: 1000,
                    easing: 'inAndOut'
                },
                titleTextStyle: {
                    color: '#000',
                    bold: false,
                    fontSize: 14
                },
                legend:{
                    textStyle:{
                        color: "#99979c"
                    }
                },
                fontName: 'Roboto',
                colors: colors,

            };
    }

    function getTimezone(name){
        if(name)
            return Intl.DateTimeFormat().resolvedOptions().timeZone
        else
            return new Date().getTimezoneOffset()/-60;
    }



    /* Utility function to convert a canvas to a BLOB */
    var dataURLToBlob = function (dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], { type: contentType });
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }


    function canvasToImage(backgroundColor, canvas) {
        var context = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;

        var data = context.getImageData(0, 0, w, h);
        var compositeOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = "destination-over";
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, w, h);
        var imageData = canvas.toDataURL("image/jpeg");
        context.clearRect(0, 0, w, h);
        context.putImageData(data, 0, 0);
        context.globalCompositeOperation = compositeOperation;
        return imageData;
    }
    
    function escapeHtml (str, jsHtml) {
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '=': '&#x3D;',
            '\n': '&#10;',
            '\r': '&#13;'
        };


        return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
        });
    }

    function confirm_delete(id, op, table_id, custom0, custom0_value, op1, tableData) {
        try{
            show_model(true, myi18n.tc('msg2', 1)+' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
            $("#btt_yes").click(function () {
                delete_item(id, op, table_id, custom0, custom0_value, op1,tableData)
            });
        }catch(ex){
            show_model(true, myi18n.tc('msg2')+ ' '+myi18n.t('msg3'), myi18n.t('delete'), myi18n.t('cancel'), "");
            $("#btt_yes").click(function () {
                delete_item(id, op, table_id, custom0, custom0_value, op1,tableData)
            });
        }
    }

    function delete_item(id, op, table_id, custom0, custom0_value, op1, tableData){


        pb_show(true, myi18n.t('processing'));
        var param = null;
        if(op1 == undefined)
            param = { op: op, op1:'delete',  id: id};
        else
            param = { op: op, op1: op1, op2:'delete', id: id};

        param.cur_page = cur_page.page_id;

        if(custom0)
            param[custom0] = custom0_value;

        execute_request(param, null, null, false, function (data) {    
            pb_show(false);
            setTimeout(function () {
                pb_show(false);
                if (data.status == "OK") { 
                    if(table_id){                     
                        setTimeout(function () {
                            if(table_id.endsWith(id)){
                                $(table_id).remove();
                            }else{
                                var t_contextMenu = $("#tr"+id).find("#t_contextMenu");
                                if(t_contextMenu.length != 0)
                                    $(t_contextMenu[0]).appendTo("body"); 
                                                
                                $(table_id).DataTable().row($("#tr"+id)).remove().draw();
                            }                           
                        }, 500);
                    }

                    try{
                        if(tableData)
                            tableData  = arrayRemoveItem(tableData, id);

                    }catch(ex){}
                }else{
                    if(data.message)
                        show_model(true, data.message, myi18n.t('ok'), "", "");
                    else
                        msg_error(myi18n.t('msg0'));
                    
                }
            }, 500);            
        })        
    
        
    }


    function item_change_active(id, switchh, op, op1, op2, op3){
        if(!op1)
            op1 = 'update';
    
        var param = {page_id: cur_page.page_id, op, op1, id, fields: [{name: 'status', value: $(switchh).is(':checked') ? 1 : 0}]};
        
        if(op2)
            param.op2 = op2;   
        
        if(op3)
            param.op2 = op3;
        
        
        execute_request(param, null, null, false, function (data) {
            if (data.status == 'OK')            
                msg_success();
            else
                show_model(true, myi18n.t('msg0'), myi18n.t('ok'), "");
        });
    }

    function editItemInTable (evt, url) {
        if(!url)
            return;

        let elm = $(evt.target);
        if(!get_elem_parent(elm, 'td_icon') && !get_elem_parent(elm, 'dropdown-menu') && !get_elem_parent(elm, 'td_checkbox') && !get_elem_parent(elm, 'switch') && !get_elem_parent(elm, 'link_in_table')){
            open_link(url);
        }
    }


    function actionButton_clicked(btt, edit_op, delete_op, view_states_op, get_link_op, clone_op, view_op, send_op, category_op, cancel_op, resend_op, json_op, messenger_code_op, payload_op, rename, transfer, getId){
        if(edit_op == "0")
            $("#t_contextMenu li a[data-idx='0']").parent().hide();
        else if(edit_op == "1")
            $("#t_contextMenu li a[data-idx='0']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='0']").attr("onclick", edit_op);
            $("#t_contextMenu li a[data-idx='0']").removeClass("my_disabled");
        }
    
        if(delete_op == "0")
            $("#t_contextMenu li a[data-idx='1']").parent().hide();
        else if(delete_op == "1")
            $("#t_contextMenu li a[data-idx='1']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='1']").attr("onclick", delete_op);
            $("#t_contextMenu li a[data-idx='1']").removeClass("my_disabled");
        }    
    
        if(clone_op == "0" || clone_op == undefined)
            $("#t_contextMenu li a[data-idx='2']").parent().hide();
        else if(clone_op == "1")
            $("#t_contextMenu li a[data-idx='2']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='2']").attr("onclick", clone_op);
            $("#t_contextMenu li a[data-idx='2']").removeClass("my_disabled");
        }    
    
        if(view_op == "0" || view_op == undefined)
            $("#t_contextMenu li a[data-idx='3']").parent().hide();
        else if(view_op == "1")
            $("#t_contextMenu li a[data-idx='3']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='3']").attr("onclick", view_op);
            $("#t_contextMenu li a[data-idx='3']").removeClass("my_disabled");
        }
    
        if(get_link_op == "0" || get_link_op == undefined)
            $("#t_contextMenu li a[data-idx='4']").parent().hide();
        else if(get_link_op == "1")
            $("#t_contextMenu li a[data-idx='4']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='4']").attr("onclick", get_link_op);
            $("#t_contextMenu li a[data-idx='4']").removeClass("my_disabled");
        }
    
        if(view_states_op == "0" || view_states_op == undefined)
            $("#t_contextMenu li a[data-idx='5']").parent().hide();
        else if(view_states_op == "1")
            $("#t_contextMenu li a[data-idx='5']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='5']").attr("onclick", view_states_op);
            $("#t_contextMenu li a[data-idx='5']").removeClass("my_disabled");
        }

        if(send_op == "0" || send_op == undefined){
            $("#t_contextMenu li a[data-idx='6']").parent().hide();
        }else if(send_op == "1")
            $("#t_contextMenu li a[data-idx='6']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='6']").attr("onclick", send_op);
            $("#t_contextMenu li a[data-idx='6']").removeClass("my_disabled");
        }

        if(category_op == "0" || category_op == undefined)
            $("#t_contextMenu li a[data-idx='7']").parent().hide();
        else if(category_op == "1")
            $("#t_contextMenu li a[data-idx='7']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='7']").attr("onclick", category_op);
            $("#t_contextMenu li a[data-idx='7']").removeClass("my_disabled");
        }

        if(cancel_op == "0" || cancel_op == undefined)
            $("#t_contextMenu li a[data-idx='8']").parent().hide();
        else if(cancel_op == "1")
            $("#t_contextMenu li a[data-idx='8']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='8']").attr("onclick", cancel_op);
            $("#t_contextMenu li a[data-idx='8']").removeClass("my_disabled");
        }

        if(resend_op == "0" || resend_op == undefined)
            $("#t_contextMenu li a[data-idx='9']").parent().hide();
        else if(resend_op == "1")
            $("#t_contextMenu li a[data-idx='9']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='9']").attr("onclick", resend_op);
            $("#t_contextMenu li a[data-idx='9']").removeClass("my_disabled");
        }

        if(json_op == "0" || json_op == undefined)
            $("#t_contextMenu li a[data-idx='10']").parent().hide();
        else if(json_op == "1")
            $("#t_contextMenu li a[data-idx='10']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='10']").attr("onclick", json_op);
            $("#t_contextMenu li a[data-idx='10']").removeClass("my_disabled");
        }

        if(messenger_code_op == "0" || messenger_code_op == undefined)
            $("#t_contextMenu li a[data-idx='11']").parent().hide();
        else if(messenger_code_op == "1")
            $("#t_contextMenu li a[data-idx='11']").addClass("my_disabled");
        else{
            messenger_code_op = "open_link('tools-qr-code?ref="+encodeURI(messenger_code_op)+"&acc="+cur_page.page_id+"', 0)";
            $("#t_contextMenu li a[data-idx='11']").attr("onclick", messenger_code_op);
            $("#t_contextMenu li a[data-idx='11']").removeClass("my_disabled");
        }


        if(payload_op == "0" || payload_op == undefined)
            $("#t_contextMenu li a[data-idx='12']").parent().hide();
        else if(payload_op == "1")
            $("#t_contextMenu li a[data-idx='12']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='12']").attr("onclick", payload_op);
            $("#t_contextMenu li a[data-idx='12']").removeClass("my_disabled");
        }

        if(rename == "0" || rename == undefined)
            $("#t_contextMenu li a[data-idx='13']").parent().hide();
        else if(rename == "1")
            $("#t_contextMenu li a[data-idx='13']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='13']").attr("onclick", rename);
            $("#t_contextMenu li a[data-idx='13']").removeClass("my_disabled");
        }

        if(transfer == "0" || transfer == undefined)
            $("#t_contextMenu li a[data-idx='14']").parent().hide();
        else if(transfer == "1")
            $("#t_contextMenu li a[data-idx='14']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='14']").attr("onclick", transfer);
            $("#t_contextMenu li a[data-idx='14']").removeClass("my_disabled");
        }

        if(getId == "0" || getId == undefined)
            $("#t_contextMenu li a[data-idx='15']").parent().hide();
        else if(getId == "1")
            $("#t_contextMenu li a[data-idx='15']").addClass("my_disabled");
        else{
            $("#t_contextMenu li a[data-idx='15']").attr("onclick", getId);
            $("#t_contextMenu li a[data-idx='15']").removeClass("my_disabled");
        }

        $dropdown = $("#t_contextMenu");
        $(btt).after($dropdown);
        $(btt).dropdown();

        $(btt).parent().one('hide.bs.dropdown', function () {
            if(!$("body > #t_contextMenu").length)
                $("#t_contextMenu").appendTo("body");
        });
    }

function daterangepicker_show_hide(selector, on){
    if(on){
        $(selector).on('show.daterangepicker', function (ev, picker) {
            $(this).find("i:last-child").addClass("fa-times");
            $(this).find("i:last-child").removeClass("fa-angle-down"); 
        });

        $('.div_daterange').on('hide.daterangepicker', function (ev, picker) {
            $(this).find("i:last-child").removeClass("fa-times");
            $(this).find("i:last-child").addClass("fa-angle-down");                
        });
    }else{
        $('.div_daterange').off('show.daterangepicker');
        $('.div_daterange').off('hide.daterangepicker');
    }
}

function getPHPUserScript(url){
    if(!url)
        url = '/php/user.php';

    if((window.location.hostname === 'localhost' || window.location.hostname.includes('.ngrok.io')) && (url === '/' || url.startsWith('/php/') || url.startsWith('/js/')))
        url = '/bots'+url;

    return url;
    
}

function prepareParam(param){
    try{
        if(param.constructor === Array){
            for(let i = 0; i < param.length; i++){
                param[i].pageName = mainData.pageName;
            }
        }else
            param.pageName = mainData.pageName;

        if(cur_page && cur_page.page_id){
            if(param.constructor === Array){
                for(let i = 0; i < param.length; i++){
                    if(param[i].page_id === undefined)
                        param[i].page_id = cur_page.page_id;
                }
            }else if(param.page_id === undefined)
                param.page_id = cur_page.page_id;
        }
        
    }catch(ex){}

    return param;
}

function execute_request(param, msg_success, msg_error, show_pb, my_callback, ms_delay, timeout, url){
    if(!url)
        url = '/php/user.php';

    if((window.location.hostname === 'localhost' || window.location.hostname.includes('.ngrok.io')) && url.startsWith('/php/'))
        url = '/bots'+url;


    if(show_pb === 1 || show_pb === 2)
        pb_show(myi18n.t('processing'));
    else if(show_pb)
        pb_show(true);
      
   
    param = prepareParam(param);

    if(!timeout)
        timeout = 60000;

    $.ajax({
        timeout: timeout,
        type: 'POST',
        url: url,
        data: { param: JSON.stringify(param) },
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
            if(show_pb === true || show_pb === 2)
                pb_show(false);

            var json = typeof data === 'string' || data instanceof String ? JSON.parse(data) : data;

            check_error(json);
            if(my_callback !== undefined && my_callback !== null){
                my_callback(json);
                return;
            }

            if(!ms_delay)
                ms_delay = 0;
            
            setTimeout(function(){
                if(json.status == 'OK')
                   msg_success(myi18n.t('msg4'));
                else
                    msg_error(myi18n.t('msg0'));
            }, ms_delay);
        },
        failure: function (errMsg) { alert(errMsg); }
    });
}


function connectFBTOMS(data){
    $("#mFBTOMS").remove();

   show_connectBotToAdmin(data.data.ref, data.data.channel, data.data.text, 'connect');
   return;
}


function open_link(link, op){
    if(op != undefined){
        var win = window.open(link, '_blank');
        win.focus();
    }else
        window.location.href = link;
}


function is_touch_device() {
    return 'ontouchstart' in window        /*works on most browsers*/
        || navigator.maxTouchPoints;       /*works on IE10/11 and Surface*/
};


    
function format_float(number, digit) {
    if (digit == 0)
        return Math.round(number)
    else
        return parseInt(number * digit * 10) / (digit * 10);
}


function getVariation(totalActual, totalPrevious){
    if(totalActual == totalPrevious)
      return '0';

    if(totalPrevious == 0)
      return 'infinite'
    
    return format_float((totalActual - totalPrevious) * 100 / (totalPrevious != 0 ? totalPrevious : 0.001), 2);
}


function setOverviewLoading(total){
  if(!total)
    total = 4;

  let overview = [];
  for(let i = 0; i < total; ++i){
    overview.push({loading: true})
  }

  mainData.data.overview = overview;
}



$('.toogle_div_change1').on('change', function (e) {
    div_save_changes(true);
});

$('.toogle_div_change').on('input', function (e) {
    div_save_changes(true);
});

function div_save_changes(b_show, back_url, btt_ok_text){
    mainData.quicksave.visible = b_show;
    if(back_url != null)
        mainData.quicksave.negative.url = back_url;

    if(btt_ok_text != undefined)
        mainData.quicksave.positive = btt_ok_text;

}


function discart_changes(){
    if($("#btt_discart_changes").data("url") == "")
        window.location.reload();
    else
        window.location.href = $("#btt_discart_changes").data("url");
}


function set_equal_height(css_selector){
    var all_elm = $(css_selector);
        var max_height = 0;
        for(var i = 0; i < all_elm.length; i++){
            if(max_height < all_elm.eq(i).height())
                max_height = all_elm.eq(i).height();
        }

        all_elm.height(max_height);
}



function get_conversation_link(conversation_id, conversation_link){
    if(conversation_id > 1)
        return "https://fb.com/"+cur_page.page_id+"/inbox/"+conversation_id;
    else if(conversation_link != '')
        return "https://fb.com"+conversation_link;
    else
        return "https://fb.com/"+cur_page.page_id+"/inbox/";    
}

listen_btt_delete_item();
function listen_btt_delete_item(){
    $(".div_single_item .btt_delete_item").off('click');
    $(".div_single_item .btt_delete_item").click(function(){
        $btt = $(this);
        for(var i = 0; i < 10; i++){
            if($btt.parent().hasClass('div_single_item')){
                $btt.parent().remove();
                return;
            }else
                $btt = $btt.parent();
        }
    });

    $(".div_item .btt_delete_item").off('click');
    $(".div_item .btt_delete_item").click(function(){
        $btt = $(this);
        for(var i = 0; i < 10; i++){
            if($btt.parent().hasClass('div_item')){
                $btt.parent().remove();
                return;
            }else
                $btt = $btt.parent();
        }
    });



    $(".div_single_item_s .btt_delete_item_s").off('click');
    $(".div_single_item_s .btt_delete_item_s").click(function(){
        $btt = $(this);
        for(var i = 0; i < 10; i++){
            if($btt.parent().hasClass('div_single_item_s')){
                $btt.parent().remove();
                return;
            }else
                $btt = $btt.parent();
        }
    });
}


function preview_resource(type, id, channel){
    if(channel === undefined || channel == -1){
        channelSelector(function(channelData){
            preview_resource(type, id, channelData.preview);
        }, null, [15,9])

        return
    }else if(isNumeric(channel)){
        let item = getItemName(getChannelsData(true), channel, ['c', 'name'], 'item');
        channel = item.preview;
    }

    var param = {page_id: cur_page.page_id, op: "flows",  op1:"preview-advanced-resources", type: type, id:id, channel};
    execute_request(param, null, null, false, function (data) {    
        pb_show(false);
        if (data.status == "OK")
            msg_success(myi18n.t('messageSent'));
        else if(!check_error(data)){
            show_model(true, myi18n.t('msg0'), myi18n.t('ok'), "", "");
        }  
    });     
}

function add_search_result(result){
    result.url = result.url.replace("v_page_id", "page_id="+cur_page.page_id);

    if(result.type == 0)    
        return '<a class="result" href="'+result.url+'"><div class="d-flex align-items-center"><i class="'+result.icon+'"></i><span class="ml-3 title">'+result.title+'</span></div></a>';
    else if(result.type == 1)   
        return '<a class="result" href="'+result.url+'" target="_blank"> <div class="d-flex align-items-center justify-content-between"> <div> <i class="'+result.icon+'"></i> <span class="ml-3 title">'+result.title+'</span> </div><i class="fal fa-external-link"></i> </div></a>';
    else if(result.type == 2)
        return '<a class="result" href="'+result.url+'"> <div class="flex-column"> <div class="d-flex align-items-center"> <i class="'+result.icon+'"></i> <span class="ml-3 title">'+result.title+'</span> </div><div class="d-flex align-items-center"> <i class="'+result.icon+' invisible"></i> <span class="ml-3 description">'+result.descr+'</span> </div></div></a>';
    else if(result.type == 3)
        return '<a class="result" href="'+result.url+'" target="_blank"> <div class="d-flex align-items-center"> <div class="flex-column flex-grow-1"> <div class="d-flex align-items-center"> <i class="'+result.icon+'"></i> <span class="ml-3 title">'+result.title+'</span> </div><div class="d-flex flex-grow-1 align-items-center"> <i class="'+result.icon+' invisible"></i> <span class="ml-3 description">'+result.descr+'</span> </div></div><i class="fal fa-external-link"></i> </div></a>';
    else{
        result.title = JSON.parse(result.title);
        var title = '<i class="'+result.icon+'"></i><span class="ml-3 title">'+result.title[0]+'</span>';
        for(var i = 1; i < result.title.length; i++)
            title+='<i class="ml-3 fal fa-chevron-right"></i><span class="ml-3 title">'+result.title[i]+'</span>';

        if(result.type == 10)
            return '<a class="result" href="'+result.url+'"><div class="d-flex align-items-center">'+title+'</div></a>';
        else if(result.type == 11)
            return '<a class="result" href="'+result.url+'" target="_blank"> <div class="d-flex align-items-center justify-content-between"> <div>'+title+'</div><i class="fal fa-external-link"></i> </div></a>';
        else if(result.type == 12)
            return '<a class="result" href="'+result.url+'"> <div class="flex-column"> <div class="d-flex align-items-center">'+title+'</div><div class="d-flex align-items-center"> <i class="'+result.icon+' invisible"></i> <span class="ml-3 description">'+result.descr+'</span> </div></div></a> ';
        else if(result.type == 13)
            return '<a class="result" href="'+result.url+'" target="_blank"> <div class="d-flex align-items-center"> <div class="flex-column flex-grow-1"> <div class="d-flex align-items-center"> '+title+' </div><div class="d-flex flex-grow-1 align-items-center"> <i class="'+result.icon+' invisible"></i> <span class="ml-3 description">'+result.descr+'</span> </div></div><i class="fal fa-external-link"></i> </div></a>';
    }
}





function update_a_page_id(page_id, parent){
    
    if(page_id == null)
        return;
    if(parent === undefined)
        $all_a_page_id = $('.a_page_id');
    else
        $all_a_page_id = $(parent+' .a_page_id');


    let length = $all_a_page_id.length;
    let url = '';
    for(var i = 0; i < length; i++){
        try{
            $a_page_id = $all_a_page_id.eq(i);
            url = $a_page_id.attr("href");   
            if(url.includes('page_id='))
                continue;      

            if(url.includes("?"))
                $a_page_id.attr("href", url+"&acc="+page_id);
            else
                $a_page_id.attr("href", url+"?acc="+page_id);
        }catch(ex){}
    }
}


function get_elem_parent(elm, parent_class){
    var parent = elm;
    
    for(var j = 0; j < 20; j++){
        if(parent == null)
            return null;

        if(parent.hasClass(parent_class))
            return parent;

        parent = parent.parent();
    }

    return null;
}


function swapNodes(a, b) {
    var aparent = a.parentNode;
    var asibling = a.nextSibling === b ? a : a.nextSibling;
    b.parentNode.insertBefore(a, b);
    aparent.insertBefore(b, asibling);
}



function getFileType(fileType){
	if(fileType.includes('image'))
		return 'image';
	else if(fileType.includes('audio'))
		return 'audio';
	else if(fileType.includes('video'))
		return 'video';
	else
		return 'file';
}


function upload_file(type, file, original_file, param, div_progress, my_callback, urlScript){
    /*setTimeout(function(){
        my_callback({status: 'OK', url: 'https://cdnj1.com/assets/2042282106075798/flows/Test-document.pdf'})
    }, 2000)

    return;*/
    if(!urlScript)
        urlScript = '../php/user.php';

    if(type === 'imageCanvas'){
        file = canvasToImage("#fff", file);
        file = dataURLToBlob(file);
    }

    param.page_id = cur_page.page_id;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
           if(div_progress){
                div_progress.css('width', "100%");                
                setTimeout(function(){div_progress.css('width', "0%"); }, 500);
           }

            my_callback(JSON.parse(request.response)); 
        }
    };

    if(original_file.size < file.size)
        file = original_file;


    var data = new FormData();
    var last_bytes = 0, total_send = 0, total_lenght = file.size;
    data.append("param", JSON.stringify(param));
    data.append("file", file);   
    
    if(div_progress){
        request.upload.addEventListener('progress', function (evt) {
            total_send += (evt.loaded - last_bytes);
            last_bytes = evt.loaded;
            var percent = (total_send / total_lenght) * 100;
            if (percent > 100)
                percent = 100;
    
            percent = percent.toFixed(1);
            div_progress.css('width', percent + "%");            
        });
    }
    

    request.upload.addEventListener('error', function (evt) {
        my_callback(null);
    });

    request.upload.addEventListener('abort', function (evt) {
        my_callback(null);
    });



    request.open('POST', urlScript);
    request.timeout = 900000; // time in milliseconds
    request.send(data);
}


function get_system_fields(full){
    if(full === undefined)
        full = 0;

    let cfs = [{id:-1, type: -1, name: 'First Name', value: '{first_name}}'}, {id:-2, type: -1, name: 'Last Name', value: '{last_name}}'},{id:-10, type: -1, name: 'Full Name', value: '{full_name}}'}, 
    {id:-12, type: -1, name: 'Email', value: '{email}}'},{id:-8, type: -1, name: 'Phone', value: '{phone}}'},{id:-11, type: -1, name: 'Profile Image', value: '{profile_pic}}'}
            ,{id:-6, type: -1, name: 'Locale', value: '{locale}}', type: -1}, {id:-19, type: -1, name: 'Gender', value: '{gender}}'},{id:-7, type: -1, name: 'Timezone', value: '{timezone}}'}
                ,{id:-4, type: -1, name: 'User Id', value: '{user_id}}'},{id:-27, type: -1, name: 'User Applied Tags', value: '{user_tags}}'}, {id: -48, type: -1, name: 'Account Name', value: '{account_name}}'}, 
                {id:-47, type: -1, name: 'Account Id', value: '{account_id}}'}, {id:-26, type: -1, name: 'Page User Name', value: '{page_user_name}}'}, {id: -50, type: -1, name: 'Last Input', value: '{last_input}}'}, {id:-23, type: -1, name: 'Last Button Title', value: '{last_btt_title}}'}, {id:-15, type: -1, name: 'Last Order', value: '{last_order}}'},
                {id:-18, type: -1, name: 'Last Seen', value: '{last_seen}}'}, {id:-21, type: -1, name: 'Last Interaction', value: '{last_interaction}}'}, {id:-22, type: -1, name: 'Facebook Inbox Link', value: '{fb_chat_link}}'}, {id:-29, type: -1, name: 'Inbox Link', value: '{inbox_link}}'}, {id:-99, type: -1, name: 'Shop Link', value: '{shop_link}}'},
                {id:-16, type: -1, name: 'Cart Total', value: '{cart_total}}'},{id:-17, type: -1, name: 'Cart Subtotal', value: '{cart_subtotal}}'}, {id:-13, type: -1, name: 'Last FB comment', value: '{last_fb_comment}}'}, {id: -63, type: -1, name: 'Current Time', value: '{current_time}}'}, {id:-24, type: -1, name: 'Last FB comment total tagged users', value: '{total_tagged}}'}];

    if(whitelabel && whitelabel.jobs)
        cfs.push({id:-42, type: -1, name: 'Last Applied Job', value: '{last_applied_job}}'})
    
         
                cfs.push({id:-100, type: -1, name: 'order_id', value: '{order_id}}'})
    if(full){  
        cfs.push({id:-9, type: -1, name: 'Last Text Input', value: '{last_text_input}}'}),
        cfs.push({id:-28, type: -1, name: 'Account API Key', value: '{page_api_key}}'}),      
        cfs.push({id:-101, type: -1, name: 'order_name', value: '{order_name}}'})
        cfs.push({id:-102, type: -1, name: 'order_phone', value: '{order_phone}}'})
        cfs.push({id:-103, type: -1, name: 'order_email', value: '{order_email}}'})
        cfs.push({id:-104, type: -1, name: 'order_shipping_type', value: '{order_shipping_type}}'})
        cfs.push({id:-105, type: -1, name: 'order_shipping_country', value: '{order_shipping_country}}'})
        cfs.push({id:-106, type: -1, name: 'order_shipping_state', value: '{order_shipping_state}}'})
        cfs.push({id:-107, type: -1, name: 'order_shipping_city', value: '{order_shipping_city}}'})
        cfs.push({id:-108, type: -1, name: 'order_shipping_address1', value: '{order_shipping_address1}}'})
        cfs.push({id:-109, type: -1, name: 'order_shipping_address2', value: '{order_shipping_address2}}'})
        cfs.push({id:-110, type: -1, name: 'order_shipping_zip', value: '{order_shipping_zip}}'})
        cfs.push({id:-111, type: -1, name: 'order_status', value: '{order_status}}'})
        cfs.push({id:-114, type: -1, name: 'order_payment_method', value: '{order_payment_method}}'})
        cfs.push({id:-115, type: -1, name: 'order_total', value: '{order_total}}'})
        cfs.push({id:-116, type: -1, name: 'order_subtotal', value: '{order_subtotal}}'})
        cfs.push({id:-117, type: -1, name: 'order_products', value: '{order_products}}'})
        cfs.push({id:-118, type: -1, name: 'order_shipping_cost', value: '{order_shipping_cost}}'})
        cfs.push({id:-119, type: -1, name: 'order_taxes', value: '{order_taxes}}'})
        cfs.push({id:-120, type: -1, name: 'order_coupon_code', value: '{order_coupon_code}}'})
        cfs.push({id:-121, type: -1, name: 'order_coupon_discount', value: '{order_coupon_discount}}'})
        cfs.push({id:-122, type: -1, name: 'order_discount', value: '{order_discount}}'})
        //cfs.push({id:-123, type: -1, name: 'order_date_timestamp', value: '{order_date_timestamp}}'})
        cfs.push({id:-124, type: -1, name: 'order_date_utc', value: '{order_date_utc}}'})
        cfs.push({id:-125, type: -1, name: 'order_date_pageTimezone', value: '{order_date_pageTimezone}}'})
    }

    return cfs;

}

function getCFforPers(data){
    let cfs = get_system_fields();
    for(let i = 0; i < data.length; i++)
        cfs.push({name: data[i].name, value:'{'+data[i].name+'}}'}); 

    return cfs;
}

function cf_enable_suggestions(elem, all_cf_suggestion){
    $(elem).suggest('{', {
        filter: {
            casesensitive: false,
            limit: 500
        },data: all_cf_suggestion,
        map: function(field) {
            return {value: field.value, text: field.name}					
        },
        onselect: function(e, item) {  
            const event = new Event('input', { bubbles: true });
            e.target.dispatchEvent(event);   

            $(e.target).trigger('input', 'save');            
        }			
    });
}

function validate_input(selector){
    var elm = $(selector);
    if($.trim(elm.val()) === ''){
        scroll_elm(elm);
        return false;
    }else
        return true;
}

function fill_select(selector, data, keys, firstRows, sPicker){
    if(sPicker === undefined)
        sPicker = true;

    var s = null;
    if(typeof selector == 'string')
        s = $(selector);
    else
        s = selector;

    var isSelectpicker = s.hasClass('selectpicker') || s.parent().hasClass('bootstrap-select');
    try{s.selectpicker('destroy');}catch(ex){}
    

    s.find('option').remove();   

    if(firstRows){
        for (var i = 0; i < firstRows.length; i++)
            s.append('<option value="' + firstRows[i][keys[0]] + '">' + firstRows[i][keys[1]] + '</option>');
    }
    

    if(keys.length == 2){
        for (var i = 0; i < data.length; i++)
            s.append('<option value="' + data[i][keys[0]] + '">' + data[i][keys[1]] + '</option>');
    }else{
        for (var i = 0; i < data.length; i++)
            s.append('<option value="'+data[i][keys[0]]+'" data-'+keys[2]+'="'+data[i][keys[2]]+'">' + data[i][keys[1]] + '</option>');
    }

    if(sPicker && isSelectpicker){
        s.selectpicker();    
        s.selectpicker("refresh"); 
    }

    return s;
}


function fill_items(type, selector) {
    var results = null;

    if (type == 0)
        results = all_products;
    else if (type == 1)
        results = all_events;
    else if (type == 2)
        results = all_news;
    else if (type == 3)
        results = all_elections;
    else if (type == 4)
        results = all_subscription;
    else if (type == 5)
        results = all_custum_q;
    else if (type == 6)
        results = all_manufacturers;

    

    
    if(results === null)
        return;
   

    var s_items = $(selector);
    s_items.selectpicker('destroy');
    s_items.find('option').remove();

    for (var i = 0; i < results.length; i++){
        if (type != 5)
            s_items.append("<option value=\"" + results[i].id + "\">" + results[i].n + "</option>");
        else
            s_items.append("<option value=\"" + results[i].id + "\">" + results[i].q + "</option>");
    }

    s_items.selectpicker();
    s_items.selectpicker("refresh");
}


function fill_templates(selector, type, all_tpts_tags, stepType) {
    if(selector === undefined)
        selector = "#tags_flows";

    if(all_tpts_tags === undefined)
        all_tpts_tags = all_tpts;
    

    if(type === undefined)
        type = "tags";


    if(type === 'tags'){
        if(ms_flows === null){
            ms_flows = $(selector).magicSuggest({
                maxSelection: 30,
                allowFreeEntries: false,
                allowDuplicates: false,
                useCommaKey: true,
                displayField: 'd',
                data: all_tpts
            });
        }else{
            ms_flows.clear();
        }
    }else{
        var s_select = typeof selector === 'string' ? $(selector) : selector;

        s_select.selectpicker('destroy');
        s_select.find('option').remove();

        var results = all_tpts;
        for (var x in results) {
            if(!stepType || stepType.includes(Number(results[x].ss)))
                s_select.append('<option value="' + results[x].id + '" data-start_step="'+results[x].ss+'">' + results[x].d + '</option>');
        }

        s_select.selectpicker();
        s_select.selectpicker("refresh");

        return s_select;
    }    
}


function isJsonString(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

function cloneObj(obj){
    return JSON.parse(JSON.stringify(obj));
}


function bttDelItemEvent(){
    $('.btt-del-item[data-global_event="true"').off('click');
    $('.btt-del-item[data-global_event="true"').on('click', function(){
        var div_item = get_elem_parent($(this), 'div_item');
        div_item.remove();
    });

}


function str_plan_name(id){
    if(id == 1)
        return 'Pro';
    else if(id == 2)
        return 'Enterprise';
    else if(id == 4)
        return 'Free';
    else if(id == 5)
        return 'Pro No Subscription';
    else if(id == 6)
        return 'Pro No Subscription';
    else if(id == 10)
        return 'Demo';
    else if(id == 11)
        return 'LTD';
    else if(id == 12)
        return 'LTD';//agency
    else if(id == 15 || id == 13)
        return 'Pro Trial';
    else if(id == 16)
        return 'Non Profit';
    else if(id == 17)
        return 'PRO WL credit';
    else
        '';
}

function str_bot_status(id){
    if(id == 0)
        return 'Disabled';
    else if(id == 1)
        return 'Active';
    else if(id == 2)
        return 'Only admins';
    else if(id == 3)
        return 'Need reconnect';
    else if(id == 4)
        return 'Deleting';
    else
        return 'Deactivated'
}

var b_menu_loaded = false;


function toogleMenu(visible){
    if(visible){
        $('#mysidebar').addClass('active');
        $('.overlay').fadeIn();
        $('#mysidebar .collapse.in').addClass('in');
        $('#mysidebar a[aria-expanded=true]').attr('aria-expanded', 'false'); 
               
    }else{
        $('#mysidebar').removeClass('active');
        $('.overlay').fadeOut();
    
        $('#div_menu_bots_c').collapse('hide');
        $('#pageSubmenu0').collapse('hide');
        $('#pageSubmenu1').collapse('hide');
        $('#pageSubmenu2').collapse('hide');
        $('#pageSubmenu3').collapse('hide');
    }
    
}


function show_main_menu_new(type){
    b_menu_loaded = true;    

    /*$("#mysidebar").mCustomScrollbar({
        theme: "minimal"
    });*/

    

    var itv = setInterval(function(){
        /*if(document.getElementById("sidebarCollapse")){
            clearInterval(itv);
            $('#sidebarCollapse').on('click', function () {
                $('#mysidebar').toggleClass('active');
                $('.overlay').fadeIn();
                $('#mysidebar .collapse.in').toggleClass('in');
                $('#mysidebar a[aria-expanded=true]').attr('aria-expanded', 'false');        
            });
        }  */
    }, 500)
    

    var overlay = document.getElementById('overlay');
    if(overlay !== null){
        overlay.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, false);
    }


    $('#div_menu_bots_c').on('click', function(e){
        e.stopPropagation();
    });

    $('#div_menu_bots_c').on('show.bs.collapse', function () {
        $('#pageSubmenu0').collapse('hide');
        $('#pageSubmenu1').collapse('hide');
        $('#pageSubmenu2').collapse('hide');
        $('#pageSubmenu3').collapse('hide');
    });

    $('#pageSubmenu0').on('show.bs.collapse', function () {
        $('#div_menu_bots_c').collapse('hide');
        $('#pageSubmenu1').collapse('hide');
        $('#pageSubmenu2').collapse('hide');
        $('#pageSubmenu3').collapse('hide');
    });

    $('#pageSubmenu1').on('show.bs.collapse', function () {
        $('#pageSubmenu0').collapse('hide');
        $('#div_menu_bots_c').collapse('hide');
        $('#pageSubmenu2').collapse('hide');
        $('#pageSubmenu3').collapse('hide');
    });

    $('#pageSubmenu2').on('show.bs.collapse', function () {
        $('#pageSubmenu0').collapse('hide');
        $('#pageSubmenu1').collapse('hide');
        $('#div_menu_bots_c').collapse('hide');
        $('#pageSubmenu3').collapse('hide');
    });

    

    

    var cur_url = window.location.href; 
    if(cur_url.includes("en/dashboard") || cur_url.includes("en/dashboard")){
        $("#m_state > a, #m_state > a i, #m_state_item0 a, #m_state_item0 a i").addClass('text-primary');
    }else if(cur_url.includes("/dashboard-searches"))
        $("#m_state > a, #m_state > a i, #m_state_item1 a, #m_state_item1 a i").addClass('text-primary');
    else if(cur_url.includes("/dashboard-users"))
        $("#m_state > a, #m_state > a i, #m_state_item2 a, #m_state_item2 a i").addClass('text-primary');
    else if(cur_url.includes("/dashboard-subscriptions"))
        $("#m_state > a, #m_state > a i, #m_state_item3 a, #m_state_item3 a i").addClass('text-primary');
    else if(cur_url.includes("/dashboard-refs"))
        $("#m_state > a, #m_state > a i, #m_state_item3 a, #m_state_item3 a i").addClass('text-primary');
    else if(cur_url.includes("/questions"))
        $("#m_question > a, #m_question > a i, #m_question_item0 a, #m_question_item0 a i").addClass('text-primary');
    else if(cur_url.includes("/stickers"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    else if(cur_url.includes("/refs") && !simplified)
        $("#m_question > a, #m_question > a i, #m_question_item2 a, #m_question_item2 a i").addClass('text-primary');
    else if(cur_url.includes("/flows"))
        $("#m_content a, #m_content a i").addClass('text-primary');
    else if(cur_url.includes("/inbox"))
        $("#m_live_chat a, #m_live_chat a i").addClass('text-primary');
    else if(cur_url.includes("/broadcasts"))
        $("#m_send_msg a, #m_send_msg a i").addClass('text-primary');
    else if(cur_url.includes("/swimlane"))
        $("#m_swimlane a, #m_swimlane a i").addClass('text-primary');
    else if(cur_url.includes("/terra"))
        $("#m_terra a, #m_terra a i").addClass('text-primary');
    else if(cur_url.includes("/attachment"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    /*else if(cur_url.includes("/products"))
        $("#m_products a, #m_products a i").addClass('text-primary');*/
    else if(cur_url.includes("/news"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    else if(cur_url.includes("/events"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    else if(cur_url.includes("/elections"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    else if(cur_url.includes("/office"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    else if(cur_url.includes("/users"))
        $("#m_audience a, #m_audience a i").addClass('text-primary');
    else if(cur_url.includes("/messages"))
        $("#m_send_msg a, #m_send_msg a i").addClass('text-primary');
    else if(cur_url.includes("/live-chat"))
        $("#m_live_chat a, #m_live_chat a i").addClass('text-primary');   
    else if(cur_url.includes("/tools"))
        $("#m_tools a, #m_tools a i").addClass('text-primary');
    else if(cur_url.includes("/settings"))
        $("#m_settings a, #m_settings a i").addClass('text-primary');
    else if(true || cur_url.includes("/bots")){
        $("#m_bots a, #m_bots a i").addClass('text-primary');
    }


    if(cur_url.includes("/products")){
        $("#m_products a:first-child, #m_products a i").addClass('text-primary');
        $("#m_categories").removeClass('hide');
    }else if(cur_url.includes("/dashboard") || cur_url.includes("en/dashboard"))
        $("#m_analytics *").addClass('text-primary');
    else if(cur_url.includes("/coupons"))
        $("#m_coupons *").addClass('text-primary');    
    else if(cur_url.includes("/orders")){
        $("#m_orders a:first-child, #m_orders a i").addClass('text-primary');
        $("#m_kds").removeClass('hide');
    }else if(cur_url.includes("/tools"))
        $("#m_marketing *").addClass('text-primary');    
    else if(cur_url.includes("/users"))
        $("#m_audience *").addClass('text-primary');   
    else if(cur_url.includes("/categories"))
        $("#m_categories").addClass('text-primary').removeClass('hide');
    else if(cur_url.includes("/kds"))
        $("#m_kds").addClass('text-primary').removeClass('hide');
    else if(cur_url.includes("/billing"))
        $("#btt_menu_upgrade").hide();


    sfHideContents();
}


function sfHideContents(){
    try{
        if(whitelabel){
            let href = window.location.href;
            if((whitelabel.a == 0 || whitelabel.plan == 4 && whitelabel.dl <= 0) && !href.includes('/billing') && !href.includes('/login') && !href.includes('/error')){                
                window.location.href = whitelabel.appdomain+"admins/en/billing";
            }

            if(whitelabel.id == 2  || $("body").hasClass('bsf')){                
                $("body").addClass("bsf");
                $(".nowt").removeClass("nowt");

                mainData.help = whitelabel.help;
                mainData.custom_tabs = whitelabel.custom_tabs;
               
                try{loadCChat();}catch(e){}
                
            }else{
                $("body").addClass("bwt");
            }


            if(whitelabel.id == 3 && location.href.includes('/s/'))
                $("body").attr('data-simplified', '1');

            if(whitelabel.id > 50)
                $('.pro.badge').addClass('hide');

            if(whitelabel.jobs)
                $('.jobs').removeClass('jobs');


            $(".wt_name").html(whitelabel.name);
            
            if(whitelabel.color)
            {
                var r = document.querySelector(':root');
                r.style.setProperty('--primary-color', whitelabel.color.primary );
                r.style.setProperty('--accent-color', whitelabel.color.accent);
                r.style.setProperty('--link-color', whitelabel.color.link);
            }                       
        }
    }catch(ex){}
}


function update_menu() {
    if(cur_page.plan == 13){
        $("#p_day_left").removeClass('d-none');
        cur_page.days_left = parseInt(cur_page.days_left);    
        $("#p_day_left").html(get_str(272, cur_page.days_left > 0 ? cur_page.days_left : 0));
        if(cur_page.days_left <= 3){
            $("#p_day_left").removeClass("text-muted");
            $("#p_day_left").addClass("text-danger");
        }else if(cur_page.days_left < 7){
            $("#p_day_left").removeClass("text-muted");
            $("#p_day_left").addClass("text-warning");
        }
    }


    if(cur_page.plan != 4 && cur_page.plan != 13)
        $("#btt_menu_upgrade").addClass("hide");

        

    if (cur_page.office == 0)
        $("#m_office").hide();

    if (my_perm.mg_all == 1){
        
        return;
    }else
        $("#m_settings").hide();

    if (my_perm.u == 0)
        $("#m_admin, #m_audience").hide();

    if (my_perm.q == 0)
        $("#m_question").hide();

    if (my_perm.o == 0 || cur_page.office == 0)
        $("#m_office").hide();

    if (my_perm.s == 0)
        $("#m_state").hide();

    if (my_perm.e == 0)
        $("#m_products").hide();        
    
   

    
    if (my_perm.t == 0)
        $("#m_content,#m_tools, #m_marketplace, #nemuNewBot").hide();
    else
        

    if (my_perm.m == 0)
        $("#m_send_msg, #m_live_chat").hide();
    

    if (my_perm.t != 2)     
        $("#m_promotions, #m_events").hide();
}


function load_nav(type){
    if(type === undefined)
        $("#nav").html('<div class="d-flex flex-row justify-content-between align-items-center w-100"> <div id="sidebarCollapse" class="menu_button valign-wrapper navbar-btn" data-activates="slide-out"><i class="fal fa-bars" style="font-size: 24px"></i></div><div id="div_search" class="text-center col-7 col-sm-8 col-lg-6"> <div class="ui search rounded-pill w-100" style="border-radius: 50rem!important;"> <div class="ui icon input w-100"> <input id="i_nav_search_bar" class="prompt" style="width: calc(100% - 2rem) !important" type="text" data-str0="Hi {name}👋, find things faster here" placeholder=""> <i class="search icon fal fa-search"></i> </div><div class="results w-100"></div></div></div><div class="d-flex"> <img id="img_perfil" class="mr-3"/> <a id="btt_logout" class="valign-wrapper opacity70 font-size-normal">Log out</a> </div></div><div id="div_save_changes" class="w-100 h-100 bg-white flex-row justify-content-end py-2 d-none" style="z-index: 1;"> <button type="button" class="btn btn-light text-dark btn-sm rounded" data-url="" id="btt_discart_changes" onclick="discart_changes()">Cancel</button> <button type="button" class="btn bg-primary text-white ml-3 btn-sm px-5 rounded" id="btt_save_changes" onclick="save_changes()">Save</button></div><script src="../js/libs/search.js"></script><script src="../js/libs/jquery.easing.1.3.min.js"></script><script src="../js/libs/semantic-api.js"></script>');
    else if(type == 'wt_admin')
        $("#nav").html('<div class="d-flex flex-row justify-content-between align-items-center w-100"> <div id="sidebarCollapse" class="menu_button valign-wrapper navbar-btn" data-activates="slide-out"><i class="fal fa-bars" style="font-size: 24px"></i></div><div id="div_search" class="text-center col-7 col-sm-8 col-lg-6"></div><div class="d-flex"> <img id="img_perfil" class="mr-3"/> <a id="btt_logout" class="valign-wrapper opacity70 font-size-normal">Log out</a> </div></div><div id="div_save_changes" class="w-100 h-100 bg-white flex-row justify-content-end py-2 d-none" style="z-index: 1;"> <button type="button" class="btn btn-light text-dark btn-sm rounded" data-url="" id="btt_discart_changes" onclick="discart_changes()">Cancel</button> <button type="button" class="btn bg-primary text-white ml-3 btn-sm px-5 rounded" id="btt_save_changes" onclick="save_changes()">Save</button></div>');
}


function load_contextmenu(){
    $("#div_t_contextMenu").remove();
    $("body").append("<div id=\"div_t_contextMenu\"><div>");
    
    let str6 = '', str7;
    if(mainData.contextItem6)
        str6 = '<li> <a tabindex="-1" data-idx="6" href="javascript:;"> <i class="'+mainData.contextItem6.icon+'"></i> '+mainData.contextItem6.name+'</a> </li>';
    else
        str6 = '<li> <a tabindex="-1" data-idx="6" href="javascript:;"> <i class="fal fa-bullhorn"></i> Send Message</a> </li>';
    

    if(mainData.contextItem7)
        str7 = '<li> <a tabindex="-1" data-idx="7" href="javascript:;"> <i class="'+mainData.contextItem7.icon+'"></i> '+mainData.contextItem7.name+'</a> </li>';
    else        
        str7 = '<li> <a tabindex="-1" data-idx="7" href="javascript:;"> <i class="fal fa-list-ul"></i> '+myi18n.t('subcategories')+'</a> </li>';
    
    
    try{
        $("#div_t_contextMenu").html('<ul id="t_contextMenu" class="dropdown-menu t-dropdown-menu" role="menu"> <li> <a tabindex="-1" data-idx="0" href="javascript:;"> <i class="fal fa-pen"></i> '+myi18n.t('edit')+'</a> </li><li> <a tabindex="-1" data-idx="13" href="javascript:;"> <i class="fal fa-text"></i> '+myi18n.t('rename')+'</a> </li><li> <a tabindex="-1" data-idx="2" href="javascript:;"> <i class="fal fa-clone"></i> '+myi18n.t('duplicate')+'</a> </li><li> <a tabindex="-1" data-idx="14" href="javascript:;"> <i class="fal fa-file-export"></i> '+myi18n.t('copyTo')+'</a> </li><li> <a tabindex="-1" data-idx="3" href="javascript:;"> <i class="fal fa-eye"></i> '+myi18n.t('preview')+'</a> </li><li> <a tabindex="-1" data-idx="4" href="javascript:;"> <i class="fal fa-link"></i>'+myi18n.t('getLink')+'</a> </li><li> <a tabindex="-1" data-idx="5" href="javascript:;"> <i class="fal fa-chart-line"></i> '+myi18n.t('viewAnalytics')+'</a> </li>'+str6+str7+'<li> <a tabindex="-1" data-idx="8" href="javascript:;"> <i class="fal fa-ban"></i> '+myi18n.t('cancel')+'</a> </li><li> <a tabindex="-1" data-idx="9" href="javascript:;"> <i class="fal fa-redo-alt"></i> '+myi18n.t('resend')+'</a> </li><li> <a tabindex="-1" data-idx="10" href="javascript:;"> <i class="fa-light fa-folder-arrow-up"></i> '+myi18n.t('movetoFolder')+'</a> </li><li> <a tabindex="-1" data-idx="12" href="javascript:;"> <i class="fal fa-code"></i> Get Payload (Ads)</a> </li><li class="hide"> <a tabindex="-1" data-idx="11" href="javascript:;"> <i class="fal fa-qrcode"></i> Get QR Code</a> </li><li> <a tabindex="-1" data-idx="15" href="javascript:;"> <i class="fal fa-fingerprint"></i> '+myi18n.t('getID')+'</a> </li><li> <a tabindex="-1" data-idx="1" href="javascript:;" class="text-danger"> <i class="fal fa-trash-alt text-danger"></i> '+myi18n.t('delete')+'</a> </li></ul>');
    }catch(ex){
        $("#div_t_contextMenu").html('<ul id="t_contextMenu" class="dropdown-menu t-dropdown-menu" role="menu"> <li> <a tabindex="-1" data-idx="0" href="javascript:;"> <i class="fal fa-pen"></i> Edit</a> </li><li> <a tabindex="-1" data-idx="13" href="javascript:;"> <i class="fal fa-text"></i> Rename</a> </li><li> <a tabindex="-1" data-idx="2" href="javascript:;"> <i class="fal fa-clone"></i> Duplicate</a> </li><li> <a tabindex="-1" data-idx="14" href="javascript:;"> <i class="fal fa-file-export"></i> Copy to another page</a> </li><li> <a tabindex="-1" data-idx="3" href="javascript:;"> <i class="fal fa-eye"></i> Preview</a> </li><li> <a tabindex="-1" data-idx="4" href="javascript:;"> <i class="fal fa-link"></i>Get Link</a> </li><li> <a tabindex="-1" data-idx="5" href="javascript:;"> <i class="fal fa-chart-line"></i> View Analytics</a> </li>'+str6+str7+'<li> <a tabindex="-1" data-idx="8" href="javascript:;"> <i class="fal fa-ban"></i> Cancel</a> </li><li> <a tabindex="-1" data-idx="9" href="javascript:;"> <i class="fal fa-redo-alt"></i> Resend</a> </li><li> <a tabindex="-1" data-idx="10" href="javascript:;"> <i class="fal fa-code"></i> Get JSON code (Ads)</a> </li><li> <a tabindex="-1" data-idx="12" href="javascript:;"> <i class="fa-light fa-folder-arrow-up"></i> '+myi18n.t('movetoFolder')+'</a> </li><li class="hide"> <a tabindex="-1" data-idx="11" href="javascript:;"> <i class="fal fa-qrcode"></i> Get QR Code</a> </li><li> <a tabindex="-1" data-idx="15" href="javascript:;"> <i class="fal fa-fingerprint"></i> Get ID</a> </li><li> <a tabindex="-1" data-idx="1" href="javascript:;" class="text-danger"> <i class="fal fa-trash-alt text-danger"></i> Delete</a> </li></ul>');
    }
}

load_contextmenu();


function spinner(selector, hide){
    if(typeof selector == 'string')
        selector = $(selector);
    
    if(hide === undefined)
        selector.removeClass('hide');
    else
        selector.addClass('hide');
}


function duplicateItem(id, op, op1, url){
    let param = {op: isNumeric(op) ? getContentName(op, 1) : op, id:id, timezone: getTimezone()};

    if(op1){
        param.op1 = op1;
        param.op2 = 'duplicate';
    }else
        param.op1 = 'duplicate';

    pb_show(true, myi18n.t('processing'));  
    execute_request(param, null, null, false, function (r) {                
        if (r.status == 'OK'){  
            msg_success();

            if(url){
                if(r.id)
                    document.location.href = url+'id='+r.id+'&acc='+cur_page.page_id;
                else
                    document.location.href = url+'id='+r.data.id+'&acc='+cur_page.page_id;
            }else
                location.reload();
                
        }else{
            pb_show(false);
           msg_error(myi18n.t('msg0'));
        }    
        
    });
}


function createNewItem(op, op1, op2, url){    
    var name = $('#modelNewItem input.name').val().trim();
    if(name === ''){
        msg_error(myi18n.t('msg10'));
        return;
    }

    $("#modelNewItem").modal('hide');

    pb_show(true, myi18n.t('processing'));
    var param = {page_id: cur_page.page_id, op, op1, data:{name : name, folder: activeFolder.id}};

    if(op2)
        param.op2 = op2;
    
    
    execute_request(param, null, null, false, function (r) {              
        if (r.status == 'OK'){    
            if(r.id)
                url += 'id='+r.id;
            else
                url += 'id='+r.data.id;

            if(cur_page && cur_page.page_id)
                url += '&acc='+cur_page.page_id;

            
            document.location.href = url;
            

            msg_success();
        }else{
           pb_show(false);
           msg_error(myi18n.t('msg0'));
        }    
        
    });    
}




function renameItem1(item, op, op1){
    let form = {title: myi18n.t('rename'), rows: [{id:'name', label: myi18n.t('name'), value: item.name, closeOnEnter: true}]}

    showForms(form, function(data){
        item.name = data.name;

        let param = {op: op, op1:'update', rename: true, id: item.id, data: {name: data.name}}
        if(op1){
            param.op1 = op1;
            param.op2 = 'update'
        }

        execute_request(param, null, null, false, function (r) {                
            if (r.status != "OK"){
                msg_error();
            }
        });
    })
}


function renameItem(id, op, format, columnIdx, checkLastName){
    let name = $('#modelNewItem input.name').val().trim(), op1;
    if(name === ''){
        msg_error(myi18n.t('msg10'));
        return;
    }
    
    if(!mainData.op1){
        if(op == 0)
            op1 = 'rename-flow';
        else
            op1 = 'update';

        op2 = 'rename';
    }else{
        op1 = mainData.op1;
        op2 = 'update';
    }
    

    $("#modelNewItem").modal('hide');
    
    op = op === null ? mainData.op : getContentName(op, 1);


    pb_show(true, myi18n.t('processing')); 
    let param = {page_id: cur_page.page_id, op, op1, op2};
    if(format === 0)
        param.data = {name : name, id: id}
    else if(format === 2){
        param.fields = [{name : 'name', value: name}]
        param.id = id;
    }else{
        param.name = name;
        param.id = id;
    }

    execute_request(param, null, null, false, function (data) {                
        if (data.status == 'OK'){   
            msg_success();

            let td = $("#tr"+id+" td:nth-of-type("+(columnIdx + 1)+")");
            if(checkLastName)
                name = td.html().replace(oldNameToChange, name);

            td.html(name);
            if(op == 0)
                td.find('[data-toggle="tooltip"]').tooltip();
        }else{
           msg_error(myi18n.t('msg0'));
        }    
        
        pb_show(false);
        
    });
}


var oldNameToChange = '';

function modalNewItem(title, placeholder, functionName, folder, value){
    if(!title)
        title = myi18n.t('add_new');

    if(!placeholder)
        placeholder = myi18n.t('name');
    
    
    if(folder)
        folder = '<span class="mt-2 text-secondary">'+escapeHtml(folder)+'</span>';
    else
        folder = '';

    if(value === undefined){
        oldNameToChange = '';
        value = '';
    }else{
        oldNameToChange = value;
        value = escapeHtml(value);
    }

    $("#modelNewItem").remove();
    $('body').append('<div id="modelNewItem" class="modal fade"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <div class="invisible"></div><h5 class="modal-title">'+title+'</h5> <div class="modal-dismiss" data-dismiss="modal" aria-label="Close"> <i class="fal fa-times"></i> </div></div><div class="modal-body"> <div class="form-group_c"> <div class="form-group"> <input type="text" class="myimput w-100 name" placeholder="'+placeholder+'" value="'+value+'"/> </div>'+folder+'</div></div><div class="modal-footer"> <div class="d-flex px-3 py-2 justify-content-between w-100"> <button data-dismiss="modal" type="button" class="btn btn-outline-secondary nagative">'+myi18n.t('cancel')+'</button> <button data-dismiss="modal" type="button" class="btn btn-primary positive" onclick="'+functionName+'">'+myi18n.t('continue')+'</button> </div></div></div></div></div>')
    
    let model = $("#modelNewItem");
    actionOnEnterKey(model.find("input.name"), model.find(".positive"), null);
    model.modal('show');
}

function actionOnEnterKey(input, button, model){
    if(typeof input == 'string')
        input = $(input);

    if(typeof button == 'string')
        button = $(button);

    if(typeof model == 'string')
        model = $(model);

    input.on('keyup', e => {
        if(e.keyCode == 13)
            $(button).click();
        else if(e.keyCode == 27 && model != null)
            model.modal('hide');
      }); 
}



function animateCSS(element, animationName, callback) {
    if(animationName == undefined)
        animationName = 'tada';

    let node = typeof element == 'string' ? document.querySelector(element) : element.get(0);

    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

function getCustomFields(results, type, botField){
    let data = [];
    for(i = 0; i < results.length; i++){
        if((type === null || type.includes(results[i].type)) && (results[i].botfield == 0 || botField && results[i].botfield == 1))
            data.push(results[i]);
    }

    return data;
}

function fill_custom_fields(selector, type, results, firstRows, botField){
    if(type === undefined)
        type = null;

    if(botField === undefined)
        botField = null;

    if(results === undefined || results === null)
        results = all_custom_fields;


    var s_cf = null;
    if(typeof selector == 'string')
        s_cf = $(selector);
    else
        s_cf = selector;


    
     
    s_cf.selectpicker('destroy');
    s_cf.find('option').remove();

    if(firstRows !== undefined){
        for (var i = 0; i < firstRows.length; i++)
            s_cf.append("<option value=\"" + firstRows[i].id + "\" data-type=\"-1\" >" + firstRows[i].name + "</option>");
    }

    for (var i = 0; i < results.length; i++){
        if((type === null || type.includes(results[i].type)) && (botField === null || botField == results[i].botfield) )
            s_cf.append("<option value=\"" + results[i].id + "\" data-type=\"" + results[i].type + "\" >" + results[i].name + "</option>");
    }

    s_cf.selectpicker();
    s_cf.selectpicker("refresh"); 
    return s_cf;
}





/*========================================================== Folders ========================================================== */

function folderDraw(container, data, parent, content){
    container = $(container);
    container.empty();

    let name, hide = '', draggable = '', icon;
    for(let i = 0; i < data.length; i++){
        if(visibleFolders && ! visibleFolders.includes(Number(data[i].id)))
            continue;

        if(data[i].id < 10000){
            hide =  'hide';
            draggable = '';
        }else{
            hide = '';
            draggable = 'draggable="true"';
        }

        if(data[i].id == 7){
            icon = 'fal fa-folder-times';
            name = myi18n.t('trash');
        }else{
            icon = 'fal fa-folder';
            name = data[i].name;
        }
        

        container.append('<div class="folder0 col-12 col-sm-6 col-md-4"> <div title="'+escapeHtml(name)+'" data-id="'+data[i].id+'" data-parent="'+parent+'" data-content="'+content+'" '+draggable+' class="folder d-flex border rounded"> <i class="'+icon+' fIcon"></i> <span class="flex-fill text-left pl-3 text-truncate">'+escapeHtml(name)+'</span> <div class="actions d-flex '+hide+'"> <i class="fal fa-pen" data-toggle="tooltip" title="'+myi18n.t('rename')+'"></i> <i class="fal fa-trash-alt" data-toggle="tooltip" title="'+myi18n.t('delete')+'"></i> </div><input maxlength="40" class="input_no_style hide" placeholder="'+myi18n.t('folderName')+'" data-value="'+name+'" value="'+name+'" /></div></div>');
    }

    if(bNewFolder && createFolder &&(parent == 0  || parent >=10000))
        container.append('<div class="col-12 col-sm-6 col-md-4"> <div data-parent="'+parent+'" data-content="'+content+'" class="folder new d-flex rounded"> <i class="fal fa-folder-plus fIcon"></i> <span class="flex-fill text-left pl-3">'+myi18n.t('newFolder')+'</span> </div></div>');

    folderEvents();
}

function getContentName(c, format){
    if(format === undefined || format == 0){
        if(c == 0)
            return  myi18n.t('flows');
        else if(c == 1)
            return myi18n.t('tags');
        else if(c == 2)
            return myi18n.t('c_fields');
        else if(c == 3)
            return myi18n.t('triggers');
        else if(c == 4)
            return myi18n.t('a_responses');
        else if(c == 5)
            return myi18n.t('sequences');
        else if(c == 6)
            return 'Zapier/Make/Pabbly Events';//zapier
        else if(c == 7)
            return 'OTN';        
        else if(c == 8)
            return myi18n.t('campaigns');
        else if(c == 9)
            return myi18n.t('fbAutoComment');
        else if(c == 15)
            return myi18n.t('uPersMenu');
        else if(c == 18)
            return myi18n.t('customEvents');
    }else if(format == 1){
        if(c == 0)
            return 'flows';
        else if(c == 1)
            return 'tags';
        else if(c == 2)
            return 'custom-fields'; 
        else if(c == 3)
            return 'rules';
        else if(c == 5)
            return 'sequences'; 
        else if(c == 8)
            return 'campaigns'; 
        else if(c == 9)
            return 'tools-fb-comment';
        else if(c == 16)
            return 'tools-fb-comment'; 
        else if(c == 18)
            return 'custom-events'; 
    }else{
        if(c == 0)
            return 'flows';
        else if(c == 1)
            return 'tags';
        else if(c == 2)
            return 'user-custom-fields';
        else if(c == 3)
            return 'rules';
        else if(c == 4)
            return 'questions';
        else if(c == 5)
            return 'sequences';
        else if(c == 6)
            return 'platform-events';//zapier
        else if(c == 7)
            return 'otn';
        else if(c == 15)
            return 'bot-menus';
        else if(c == 8)
            return 'email-campaigns';
        else if(c == 9)
            return 'fb-comments';
        else if(c == 18)
            return 'custom-events';
    }

}

var my_trDrag = null;  dragFolder = null, bpushState = false, bNewFolder = true;

function folderPaths(container, data, content){
    bNewFolder = true;
    container = $(container);
    container.empty();

    data.push({id:0, name: getContentName(content)}); 
    activeFolder = data[0];
    mainData.activeFolder =  activeFolder;


    if(bpushState){
        history.pushState({"id": data[0].id}, "", getContentName(content,2)+"?acc="+cur_page.page_id+"&folder="+data[0].id);
        bpushState = false;
    }

    
    if(data.length == 1)
        return;     
    
    for(let i = data.length -1; i > 0; i--){
        if(data[i].id > 0 && data[i].id < 10000)
            bNewFolder = false;

        container.append('<li class="breadcrumb-item bcFolder p-1" data-id="'+data[i].id+'" data-content="'+content+'"><span onclick="bpushState = true; load_data('+data[i].id+')">'+data[i].name+'</span></li>');
    }

    if(data[0].id > 0 && data[0].id < 10000)
            bNewFolder = false;

    container.append('<li class="breadcrumb-item active p-1" aria-current="page">'+data[0].name+'</li>');
    
    folderEvents();    
}




function folderEvents(){
    $('.folder .fa-trash-alt').off('click')
    $('.folder .fa-trash-alt').on('click', function(e){
       e.stopPropagation();
       folderDelete(null, get_elem_parent($(this), 'folder'), 0);
    });

    $('.folder:not(.new)').off('click')
    $('.folder:not(.new)').on('click', function(){  
        bpushState = true;      
        load_data($(this).data('id'));
    });

    $('.folder.new').off('click')
    $('.folder.new').on('click', function(){     
        let parent = $(this).data('parent');
        let content = $(this).data('content');
        modalNewItem(myi18n.t('newFolder'), myi18n.t('folderName'), 'createNewFolder('+parent+','+content+')');               
    });

    

    $('.folder input').off('click')
    $('.folder input').on('click', function(e){  
        e.stopPropagation();
    });


    $('.folder input').off('keyup');
    $('.folder input').on('keyup',function(e) {
        if(e.key == 'Enter') {      
            folderEditFinish(true, null, $(this));  
        }else if(e.key == 'Escape')
            folderEditFinish(false, null, $(this));  
    });

    $('.folder input').off('blur')
    $('.folder input').on('blur', function(e){  
        folderEditFinish(false, null, $(this));        
    });

    $('.folder .fa-pen').off('click');
    $('.folder .fa-pen').on('click', function(e){  
        e.stopPropagation();   
        let folder = get_elem_parent($(this), 'folder');     
        let input = folder.find('input');
        input.removeClass('hide').focus();  
        folder.addClass('bdr_primary_color');
    });


    $('.my_tr').off('dragstart');
    $('.my_tr').on('dragstart', function(ev){
        setTimeout(() => {
            $("body").addClass('foldervove');
            $(".forder_C_C").addClass('box_shadow');
        }, 800);
       

        ev = ev.originalEvent;
        ev.stopImmediatePropagation();
        let elm = get_elem_parent($(ev.target), 'my_tr');
        ev.dataTransfer.setData("JSON", JSON.stringify({type : 'item', id: elm.attr('id').substring(2)}));
        elm.css("opacity", "0.2");
        my_trDrag = elm;
    });

    $('.my_tr').off('dragend');
    $('.my_tr').on('dragend', function(ev){
        setTimeout(() => {
            $("body").removeClass('foldervove');
            $(".forder_C_C").removeClass('box_shadow');
        }, 1000);
        

        my_trDrag.css("opacity", "1");
    });


    $('.folder').off('dragstart');
    $('.folder').on('dragstart', function(ev){
        ev = ev.originalEvent;
        ev.stopImmediatePropagation();
        let elm = $(ev.target);
        ev.dataTransfer.setData("JSON", JSON.stringify({type : 'folder', id: elm.data('id')}));
        elm.css("opacity", "0.2");
        dragFolder = elm;
    });

    $('.folder').off('dragend');
    $('.folder').on('dragend', function(ev){
        dragFolder.css("opacity", "1");
    });


    $('.folder:not(.new), .bcFolder').off('dragover');
    $('.folder:not(.new), .bcFolder').on('dragover', function(ev){        
        ev = ev.originalEvent;
        
        if(my_trDrag || dragFolder){
            elm = $(ev.target);
            if(!elm.hasClass('folder') && !elm.hasClass('bcFolder')){
                elm = get_elem_parent($(ev.target), 'folder'); 
                if(!elm){
                    elm = get_elem_parent($(ev.target), 'bcFolder'); 
                    if(!elm)
                        return;
                }
            }

            let targetId = elm.data('id');
            if(targetId != 7 && targetId >= 5 && targetId < 10000)
                return;


            ev.preventDefault();
            elm.find('*').css('pointer-events', 'none');
            
            if(!elm.hasClass('bdr_primary_color') && elm.hasClass('folder'))
                elm.addClass('bdr_primary_color bdr_dashed');
        }
    });

    $('.folder').off('dragleave');
    $('.folder').on('dragleave', function(ev){
        ev = ev.originalEvent;

        if(my_trDrag || dragFolder){
            let elm = $(ev.target);            
            elm.removeClass('bdr_primary_color bdr_dashed');
            elm.find('*').css('pointer-events', 'all');
        }
    });

    $('.folder, .bcFolder').off('drop');
    $('.folder, .bcFolder').on('drop', function(ev){
        ev = ev.originalEvent;
        let elm = $(ev.currentTarget);
        elm.find('*').css('pointer-events', 'all');
        
        let folder = get_elem_parent(elm, 'folder');
        if(!folder)
            folder = get_elem_parent(elm, 'bcFolder');

        if(!folder)
            return;

        folder.removeClass("bdr_primary_color bdr_dashed");

        var data = JSON.parse(ev.dataTransfer.getData("JSON"));
        if (data.type == "folder")            
            folderMove(data.id, folder.data('id'), folder.data('content'));            
        else if(data.type == "item")
            folderMoveItem(data.id, [folder.data('id')], folder.data('content'))
        
    });


}

function folderMove(id, parent, content){     
    if(id == parent || parent != 7 && parent > 0 && parent < 10000)
        return;

    let param = [];
    param.push({page_id: cur_page.page_id, op: 'folder', op1: 'move', data: {id:id, parent:parent}});
    param.push({page_id: cur_page.page_id, op: 'folder', op1: 'get', 'parent': activeFolder.id, content: content});

    pb_show(true);
    execute_request(param, null, null, false, function (data) {    
      if(data[0].status === 'OK'){
            folderDraw('.forder_C', data[1].results, parent, content);                
      }else if(data[0].code === 30){
            msg_error(myi18n.t('msg0'));
      }

      pb_show(false);
    }); 
}

function folderMoveItem(items, parent, content){
    if(parent != 7 && parent >= 5 && parent < 10000)
        return;
        
    let param = [];
    param = {page_id: cur_page.page_id, op: 'folder', op1: 'move-item', data: {id:items, parent:parent, content: Number(content)}};

    execute_request(param, null, null, false, function (data) {    
      if(data.status === 'OK'){
        $("#t_contextMenu").appendTo("body");
        for(i = 0; i < items.length; ++i)
            total_checked[cur_table_idx].table.row($("#tr"+items[i])).remove().draw();

        msg_success();
      }else if(data.code === 30){
            msg_error(myi18n.t('msg0'));
      }

      pb_show(false);
    }); 
}

function createNewFolder(parent, content){
    var name = $('#modelNewItem input.name').val().trim();
    if(name === ''){
        msg_error(myi18n.t('msg10'));
        return;
    }

    $("#modelNewItem").modal('hide');

    
    let data;
    if(content != 4)
        data = {name: name, parent: parent, c0: 1, c1: 1, c2: 1, c3: 1, c4: 0, c5: 1, c6: 1, c7: 1, c8: 1, c9: 1, c10: 1, c11: 1};
    else
        data = {name: name, parent: parent, c0: 0, c1: 0, c2: 0, c3: 0, c4: 1, c5: 0, c6: 0, c7: 0, c8: 0, c9: 0, c10: 0, c11: 0};
    
    let param = [];
    param.push({page_id: cur_page.page_id, op: 'folder', op1: 'add', data: data});
    param.push({page_id: cur_page.page_id, op: 'folder', op1: 'get', 'parent': parent, content: content});

    pb_show(true);
    execute_request(param, null, null, false, function (data) {    
      if(data[0].status === 'OK'){
            folderDraw('.forder_C', data[1].results, parent, content);                
      }else if(data[0].code === 30){
            msg_error('Folder already exist');
      }

      pb_show(false);
    });

}

function folderDelete(folderID, folder, attempts){
    if(folder === null)
        folder = $('.forder_C .folder[data-id='+folderID+']');

    if(folderID === null)
        folderID = folder.data('id');

    let folderName = folder.find('span').html();

    if(attempts === 0){
        let param =  {page_id: cur_page.page_id, op: 'folder', op1: 'get', op2: 'basic', id: folderID}

        execute_request(param, null, null, false, function (data) {    
            if(data.status === 'OK'){
                    data = data.data;
                    let str = myi18n.tc('msg6', folderName);
                    if(data.total > 0){
                        str+="<br><br>"+myi18n.t('msg7');

                        for(let i = 0; i < data.resources.length; i++){
                            if(data.resources[i] > 0)
                                str+= '<br>'+getContentName(i)+": "+data.resources[i];
                        }
                    }

                    show_model(true, str, myi18n.t('delete'), myi18n.t('cancel'), '');
                    $("#btt_yes").click(function (){
                        folder.parent().remove();

                        let param =  {page_id: cur_page.page_id, op: 'folder', op1: 'delete', id: folderID}
                        execute_request(param, null, null, false, function (data){

                        });

                        
                    });
                    
                    
                                
            }else if(data[0].code === 30){
                  msg_error('Folder already exist');
            }
      
            pb_show(false);
        });
    }else{
        folder.find('[data-toggle="tooltip"]').tooltip('hide');
        folder.parent().remove();
    }
}

function folderEditFinish(success, folder, input){
    if(input == null)
        input = folder.find('input');
    
    if(folder == null)
        folder = get_elem_parent(input, 'folder');

    input.addClass('hide');

    folder.removeClass('bdr_primary_color');

    let name = input.val().trim();
    if(success && name.length > 0 && name != input.data('value')){
        folder.find('span').html(name);
        param = {page_id: cur_page.page_id, op: 'folder',  op1:'rename', data: {id: folder.data('id'), parent: folder.data('parent'), name:name}}
        execute_request(param, null, null, false, function (data) {    
            if(data.status == 'OK'){
                input.data('value', name);
            }else{
                folder.find('span').html(input.data('value'));
                if(data.code == 30)
                    msg_error('Folder already exist');
            }
        })        
    }else{
        input.val(input.data('value'));
    }
    
    
}

window.addEventListener('popstate', function(e) {
    try{
        if(e.state){
            let data = e.state;
            load_data(data.id);
        }else
            load_data(0);    
    }catch(ex){}
});

window.addEventListener('pageshow', function(event) {
    if (mainData.pageshowReload && event.persisted) {
        window.location.reload();
    }
});

function doGetCaretPosition(ctrl){
    if(typeof ctrl === 'string' || ctrl instanceof String){
        ctrl = document.querySelector(ctrl);
        if(ctrl === null)
            return 0;
    }else if(ctrl instanceof jQuery)
        ctrl = ctrl.get(0);

    var CaretPos = 0;

    if (ctrl.selectionStart || ctrl.selectionStart == 0){
        CaretPos = ctrl.selectionStart;
    }else if (document.selection){
        ctrl.focus ();
        var Sel = document.selection.createRange ();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }

    return CaretPos;
}


function setCaretPosition(ctrl,pos)
{
    if(typeof ctrl === 'string' || ctrl instanceof String){
        ctrl = document.querySelector(ctrl);
        if(ctrl === null)
            return 0;
    }else if(ctrl instanceof jQuery)
        ctrl = ctrl.get(0);

 if (ctrl.setSelectionRange)
 {
  ctrl.focus();
  ctrl.setSelectionRange(pos,pos);
 }
 else if (ctrl.createTextRange)
 {
  var range = ctrl.createTextRange();
  range.collapse(true);
  range.moveEnd('character', pos);
  range.moveStart('character', pos);
  range.select();
 }
}

function emojiEvents(parentElm){
    if(!parentElm)
    parentElm = '';

    $(parentElm+" .div_text_c textarea, .div_text_c input").off('focus');
    $(parentElm+" .div_text_c textarea, .div_text_c input").on('focus', function(){
        let parent = get_elem_parent($(this), 'div_text_c');
        parent.find('.div_text').removeClass('hide');
    });

    $(parentElm+" .div_text_c textarea, .div_text_c input ").off('blur');
    $(parentElm+" .div_text_c textarea, .div_text_c input ").on('blur', function(){
        let elm = $(this);
        setTimeout(function(){
            let parent = get_elem_parent(elm, 'div_text_c');
            parent.find('.div_text').addClass('hide');
        }, 300);
    });

    

    $(parentElm+" .div_cf").off("click");
    $(parentElm+" .div_cf").on("click", function(e){
        e.stopPropagation();

        let elm = get_elem_parent($(this), 'div_text_c').find($(this).parent().data("selector"));
        ativeEmoji = elm;

        let caretPos = doGetCaretPosition(elm);
        let val = elm.val();
        elm.val(val.substring(0, caretPos) + '{' + val.substring(caretPos) );
        setCaretPosition(elm, caretPos+1); 

        elm.trigger('keyup');
    })
    

    $(parentElm+" .div_emoji").off("click");
    $(parentElm+" .div_emoji").on("click", function(e){
        e.stopPropagation();
    
        $("emoji-picker .emoji-mart").off("click");
        $("emoji-picker .emoji-mart").on("click", function(e){
            e.stopPropagation();
        });
    
        let elm = get_elem_parent($(this), 'div_text_c').find($(this).parent().data("selector"));
        ativeEmoji = elm;
      
        ativeEmoji.data("caretPos", doGetCaretPosition(elm));
    
        let viewportOffset = $(this).parent().get(0).getBoundingClientRect();
        let top = viewportOffset.top;
        let left = viewportOffset.left;
    
        $("emoji-picker .emoji-mart").css({top: top - 2, left: left - get_elem_parent($(this), 'div_text_c').width() + 12});
        $("emoji-picker").css({display: 'block'});
    });
}

emojiEvents();


var ativeEmoji = null
function emojiSeleted(e){
    //$("emoji-picker").css('display', 'none');
    let val = ativeEmoji.val();
    let caretPos = ativeEmoji.data('caretPos');    
    let newcaretPos = Number(caretPos) + e.native.length;
    ativeEmoji.data('caretPos', newcaretPos);    
    ativeEmoji.val(val.substring(0, caretPos) + e.native + val.substring(caretPos) );
    setCaretPosition(ativeEmoji, newcaretPos); 
    ativeEmoji.trigger('input', 'save');

}

$(window).click(function() {
    if(ativeEmoji){
        $("emoji-picker").css({display: 'none'});
        ativeEmoji.focus();
        ativeEmoji = null;
    }
});

$("emoji-picker").css({display: 'none'});


function cf_value(type, value, fromVue){
    if(fromVue === undefined)
        fromVue = false;

    if(value === null)
        return '';
    else if(type == 0)
        return fromVue ? value : escapeHtml(value);
    else if(type == 2)
        return date_to_str(timestamp_to_local_date(value), 'YYYY-MM-DD');
    else if(type == 3)
        return date_to_str(timestamp_to_local_date(value));
    else if(type == 4){
        if(value == 1)
            return 'True';
        else
            return 'False';
    }else
        return value;
}

function handleBttLogic(btt, op, value){
    if(typeof btt == 'string')
        btt = $(btt);
    
    if(op == 0){
        btt.html(btt.data('v'+value));
        btt.data('value', value);
    }else{
        btt.click(function(){
            handleBttLogic($(this), 0, btt.data('value') == 0 ? 1 : 0);            
        })
    }
}



function preRequest(op, op1, op2){
    let param = {op, op1}
    if(op2)
        param.op2 = op2;

    pb_show(true, myi18n.t('processing'));
    execute_request(param, null, null, false, function (data){    
        pb_show(false);                
        if(data.status == 'OK')
            msg_success();
        else
            msg_error(myi18n.t('msg0'));
    })            
}


function bttSpinner(btt, disabled){
    if(btt === null)
        return;

    if(typeof btt == 'string')
        btt = $(btt);

    btt.attr('disabled', disabled);
    let text = btt.find('.text');
    let spinner = btt.find('.spinner-grow');
    if(disabled){
        text.html(btt.data('0'));
        spinner.removeClass('hide');
    }else{
        text.html(btt.data('1'));
        spinner.addClass('hide');
    }     
}

function preUpload(inputfile, btt){
    if(btt){
        inputfile = get_elem_parent($(btt), 'imageC').find('.inputfile');
    }else if(typeof inputfile == 'string')
        inputfile = $(inputfile);

    inputfile.show();
    inputfile.focus();
    inputfile.click();
    inputfile.hide();    
}

function loadImageFile(event, bttUpload, callback, maxWidth, param, urlScript, callback1){
    if(!maxWidth)
        maxWidth = 900;

    if (event.target.files.length > 0) {
        if(bttUpload)
            bttSpinner(bttUpload, true);
        else if(typeof callback === 'object')
            callback.uploading = true;

        loadImage(
            event.target.files[0],
            function (canvas_img) {  
                if(!param)
                    param = {page_id: cur_page.page_id, op : 'flows', op1:'upload', op2:'image', file_name:null, uploadFB: false}
                
                upload_file('imageCanvas', canvas_img, event.target.files[0], param, null, function(json){
                    if(bttUpload)
                        bttSpinner(bttUpload, false);

                    if(json.status === 'OK'){ 
                        if(typeof callback === 'object'){
                            callback.uploading = false;
                            callback.url = json.url;                            
                        }else
                            callback(json.url);

                        if(callback1)
                            callback1(json.url);
                    }else{
                        if(typeof callback === 'object')
                            callback.uploading = false;
                        else
                            callback(null);

                        if(callback1)
                            callback1(null);

                        msg_error(myi18n.t('msg0'));
                    }
                }, urlScript);
            },
            {
                maxWidth: maxWidth,
                canvas: true
            }
        );
    }
}

function msg_state(state) {
    if (state == -1)
        return 'Draft';
    else if (state == 0)
        return myi18n.t('pending');
    else if (state == 1 || state == 2)
        return myi18n.t('sending');
    else if (state == 3)
        return myi18n.t('sent');
    else if (state == 4)
        return myi18n.t('canceled');
}



function getPercent(total, subTotal, digits){
    if(digits === undefined)
        digits = 2;

    let val = total == 0 ? 0 : format_float((100 * subTotal / total), digits);
    return val+"%";
}


try{
    var url = document.location.toString();
    if (url.match('#')){
        mainData.selectedTab = url.split('#')[1];
        $('.nav-pills a[href="#' + mainData.selectedTab + '"]').tab('show');
    }
}catch(ex){}

$('.nav-pills a').on('shown.bs.tab', function (e) {
    if((e.target.hash).indexOf('builder') == -1)
        history.replaceState(null, null, e.target.hash); 
})

function sendFlow(id, ms_id, channel) {
    if(!ms_id && channel === undefined || channel == -1){
        channelSelector(function(channelData){
            sendFlow(id, ms_id, channelData.preview);
        })

        return
    }else if(isNumeric(channel)){
        let item = getItemName(getChannelsData(true), channel, ['c', 'name'], 'item');
        channel = item.preview;
    }

    var param = {page_id: cur_page.page_id, op: 'flows', op1: 'send', id, ms_id, channel: channel};
    

    execute_request(param, null, null, true, function (data) {
        if (data.status == 'OK'){
            msg_success();
        } else
            show_model(true, myi18n.t('msg0'), myi18n.t('ok'), "");
    });
}


function checkWhitelabel(force){
    if(!force && whitelabel && whitelabel.dynamic){
        return true;
    }


    var param = {op: 'whitelabel'};
    execute_request(param, null, null, false, function (data) { 
        if (data.status == "OK"){
            whitelabel = data.data; 
            mainData.wt = whitelabel;      
            mainData.navMenu = whitelabel.dynamic.menu;      
            appDomain = data.data.appdomain;


            if(data.data.fb){
                appFbId = data.data.fb.app;                    
                fbRedirect = data.data.fb.redirect;
            }else{
                appFbId = null;
                fbRedirect = null;
            }
            
            
            wtID = data.data.id;

            
            
            sfHideContents(); 
        }
    });
    
    return false;
}

function renderI18n($cssEl){
    let els = $($cssEl);
    length = els.length;
    for(let i = 0; i < length; i++){
        try{
            $el = els.eq(i);
            $data =  $el.data('v-t');
            if($data){
                $data = $data.replaceAll('\'', '');
                $el.html(myi18n.t($data))
            }
        }catch(ex){}
    }
}


function getItemName(data, id, keys, type){
    if(type === undefined)
        type = 'name'
    if(keys === undefined || keys == null)
        keys = ['id', 'name'];

    if(Array.isArray(id)){
        let descr = '';
        let j = 0;
        for(let i = 0; i < id.length; ++i){
            let name = getItemName(data, id[i]);
            if(name){
                descr += j === 0 ? name : ', '+name;
                j++;
            }
        }

        return descr;
    }else{
        for(let i = 0; i < data.length; ++i){
            if(data[i][keys[0]] == id){
                if(type === 'idx')
                    return i;
                if(type === 'item')
                    return data[i];
                else
                    return data[i][keys[1]];
            }
        }
    }

    return '';
}


function globalSearch(idx){    

    if(total_checked){
        for(let i = 0; i < total_checked.length; i++){
            if(total_checked[i].table){
                total_checked[i].table.search(mainData.searchGlobal).draw();
            }
        }
    }


    
    if(idx !== undefined){
        if(mainData.searchGlobal === ''){
            if(idx === 0)
                mainData.table1.deepResults = []; 
            else if(idx === 1)
                mainData.table2.deepResults = []; 
        }else{
           
            let table = null;
            if(idx === 0)
                table = mainData.table1;
            else if(idx === 1) 
                table = mainData.table2;


            if(table.searchResquest && mainData.activeFolder && mainData.activeFolder.id !== undefined && mainData.searchGlobal.length > 1){
                table.searchResquest.activeFolder = mainData.activeFolder.id;
                table.searchResquest.text = mainData.searchGlobal;
                table.draw++;
                let tableDraw = table.draw;
                setTimeout(function(){
                    if(tableDraw === table.draw){
                        execute_request(table.searchResquest, null, null, false, function (r) {
                            if (r.status == "OK")
                                table.deepResults = r.data;                       
                                    
                        });
                    }
                }, 800)
            }
          
        } 
    }
}

function closeModal(id){
    $(id).modal('hide');
}

function arrayGetIndex(data, id, name){
    if(name === null){
        for(let i = 0; i < data.length; i++){
            if(data[i] == id)    
                return i;
        }
    }else{
        if(!name)
            name = 'id';

        for(let i = 0; i < data.length; i++){
            if(data[i][name] == id)         
                return i;
        }
    }    
    
    return null;
}


function arrayMoveItem(data, item, oldIdx, newIdx){
    if(item === null)
        item = data[oldIdx];

    data.splice(oldIdx, 1);
    data.splice(newIdx, 0, item);
}

function arrayDuplicateItem(data, item, index){
    let newItem = cloneObj(item);
    if(newItem.id)
        newItem.id = new Date().getTime();

    if(data.length == index + 1)
        data.push(newItem);
    else
        data.splice(index, 0, newItem);
}

function arrayRemoveItem(data, id, name, idx){
    if(idx !== undefined){
        data.splice(idx, 1);    
        return
    }

    if(name === null){
        for(let i = 0; i < data.length; i++){
            if(data[i] == id){         
                data.splice(i, 1);                
                break;
            }
        }
    }else{
        if(!name)
        name = 'id';

        for(let i = 0; i < data.length; i++){
            if(data[i][name] == id){         
                data.splice(i, 1);                
                break;
            }
        }
    }    
    
    return data;
}


function getPreRename(text){
    return text.includes('"') || text.includes('\'') ? '' : escapeHtml(text);
}


function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function MergeObjects(obj1, obj2) {
	for (var p in obj2) {
	  try {
		if(obj2[p].constructor==Object )
		  	obj1[p] = MergeObjects(obj1[p], obj2[p]);  
		else
		  obj1[p] = obj2[p];
  
	  } catch(e) {
		obj1[p] = obj2[p];  
	  }
	}  
	return obj1;
}




function handleCloseTag(items, tag){
    items.splice(items.indexOf(tag), 1);
 }



function showInputTag(tagData, app, input) {
    tagData.visible = true;
    app.$nextTick(_ => {
        $(input).focus();
    });
}

function handleInputTagConfirm(items, tagData, lowerCase) {
     
    let val = tagData.value;
    if(lowerCase === undefined || lowerCase)
        val = val.toLowerCase();

    
    if (val && !items.includes(val)) 
        items.push(val);

    tagData.visible = false;
    tagData.value = '';                
  }


  function insertEmoji(input, callback){
	$("emoji-picker .emoji-mart").off("click").on("click", function(e){
		e.stopPropagation();
        if(callback)
            callback($(input).val());
	});

	let elm = $(input);
	ativeEmoji = elm;  
	ativeEmoji.data("caretPos", doGetCaretPosition(elm));
	let offset = elm.offset();
	
	$("emoji-picker .emoji-mart").css({top:  offset.top - 380, left: offset.left});
	$("emoji-picker").css({display: 'block'});
}


function setCookies(item, value){
    /*if(window.location.hostname === 'localhost')
        docCookies.setItem(item, value, Infinity, "/bots/");	
    else*/  
        docCookies.setItem(item, value, Infinity, "/");	
}

function getCookies(item, value){
    if(docCookies.hasItem(item))
        return docCookies.getItem(item);
    else
        return value;
}

function getPageIDParan(){
    let pageID = $.urlParam('acc');
    if(!pageID)
        pageID = $.urlParam('page_id');

    return pageID;
}

var channelsData = [{id:"messenger", name: "Messenger", img:"../images/messenger.svg", icon: "fab fa-facebook-messenger", color: "#0084ff", c: 0},
    {id:"instagram", name: "Instagram", img:"../images/instagram.svg", icon: "fab fa-instagram", color: "#833AB4", c: 10},
    {id:"gbm", name: "Google BM", img:"../images/google-my-business.svg", icon: "fab fa-google", color: "#ea4335", c: 7},
    {id:"whatsapp", name: "WhatsApp", img:"../images/whatsapp.svg", icon: "fab fa-whatsapp", color: "#075e54", c: 5},
    {id:"webchat", name: "Webchat", img:"../images/browser.svg", icon: "fal fa-globe", color: "#333", c: 9},
    {id:"telegram", name: "Telegram", img:"../images/telegram.svg", icon: "fab fa-telegram", color: "#0088cc", c: 8},
    {id:"sms", name: "SMS", img:"../images/sms.svg", icon: "fas fa-sms", color: "#FFA900", c: 2},
    {id:"viber", name: "Viber", img:"../images/viber.svg", icon: "fa-brands fa-viber", color: "#7360F2", c: 12},
    {id:"viberbm", name: "Viber BM", img:"../images/viber.svg", icon: "fa-brands fa-viber", color: "#7360F2", c: 16},
    {id:"voice", name: "Voice", img:"../images/phone.svg", icon: "fa-light fa-phone", color: "#7360F2", c: 15}
];

function channelSelector(callback, allowedChannels, noChannels){
    mainData.channelSelector.callback = callback;
    mainData.channelSelector.data = getChannelsData(true, allowedChannels, noChannels);
    let modalM = $("#selectChannel");
    modalM.modal('show');
}


function getChannelsData(forceWebChat, allowedChannels, noChannels){
    if(!forceWebChat)
        forceWebChat = false;

    if(!noChannels)
        noChannels = [];

    let channels = [];
    if(cur_page.messenger_id != 0 && (!allowedChannels || allowedChannels.includes(0)) && !noChannels.includes(0))
        channels.push({c:0, preview:"standard", id:"messenger", name: "Messenger", img:"../images/messenger.svg", data: {name: cur_page.messenger_id != cur_page.username ? '@'+cur_page.username : myi18n.t('botLink'), link: 'https://m.me/'+cur_page.username}});

    if(cur_page.whatsapp && (!allowedChannels || allowedChannels.includes(5)) && !noChannels.includes(5))
        channels.push({c: 5, preview:"whatsapp",  id:"whatsapp", name: "WhatsApp", img:"../images/whatsapp.svg", data: {name: '+'+cur_page.whatsapp.number, link: 'https://wa.me/'+cur_page.whatsapp.number}});

    if(cur_page.instagram && (!allowedChannels || allowedChannels.includes(10)) && !noChannels.includes(10))
        channels.push({c: 10, preview:"instagram", id:"instagram", name: "Instagram", img:"../images/instagram.svg", data: {name: '@'+cur_page.instagram.username, link: "https://ig.me/m/"+cur_page.instagram.username}});
    
    if(cur_page.sms && (!allowedChannels || allowedChannels.includes(2)) && !noChannels.includes(2)){
        let link =  cur_page.sms.number != '' ? "sms:"+cur_page.sms.number : null;
        channels.push({c: 2, preview:"sms", id:"sms", name: "SMS", img:"../images/sms.svg", data: {name: cur_page.sms.number != '' ? cur_page.sms.number : '----', link: link}});
    }

    if(cur_page.gbm && (!allowedChannels || allowedChannels.includes(7)) && !noChannels.includes(7))
        channels.push({c: 7, preview:"googleBM", id:"gbm", name: "Business Message", img:"../images/google-my-business.svg", data: {name: myi18n.t('botLink'), link: 'https://businessmessages.google.com/widget/agent/'+cur_page.gbm.agentID}});
    
    if(cur_page.telegram && (!allowedChannels || allowedChannels.includes(8)) && !noChannels.includes(8))
        channels.push({c: 8, preview:"telegram", id:"telegram", name: "Telegram", img:"../images/telegram.svg", data: {name: '@'+cur_page.telegram.username, link: 'https://t.me/'+cur_page.telegram.username}});

    if(cur_page.viber && (!allowedChannels || allowedChannels.includes(12)) && !noChannels.includes(12))
        channels.push({c: 12, preview:"viber", id:"viber", name: "Viber", img:"../images/viber.svg", data: {name: '@'+cur_page.viber.username, link: 'viber://pa?chatURI='+cur_page.viber.username}});

    if(cur_page.viberbm && (!allowedChannels || allowedChannels.includes(16)) && !noChannels.includes(16))
        channels.push({c: 16, preview:"viberbm", id:"viberbm", name: "Viber BM", img:"../images/viber.svg", data: {name: '@'+cur_page.viberbm.id, link: 'viber://chat?service='+cur_page.viberbm.id}});
    
    if(cur_page.voice && (!allowedChannels || allowedChannels.includes(15)) && !noChannels.includes(15))
        channels.push({c: 15, preview:"voice", id:"voice", name: myi18n.t('voice'), img:"../images/phone.svg", data: {name: cur_page.voice.number, link: 'tel:'+cur_page.voice.number}});
    
    
    if(cur_page.pers.webchat && (!allowedChannels || allowedChannels.includes(9)) && !noChannels.includes(9))
        channels.push({c: 9, preview:"webchat", id:"webchat", name: "Webchat", img:"../images/browser.svg", data: {name: myi18n.t('learnMore'), link: mainData.wt.links.webchat}});

    return channels;
}

function resetLastDragData(){
	setTimeout(function(){
		lastDragData = {type:''}
	}, 600)
}

function getFlowName(id){
    let name = getItemName(mainData.flows, id, ['id', 'd']);
    if(name !== '')
        return {name, exist: true}
    else
        return {name: myi18n.t('msg17'), exist: false}
}


function isEmailValid(email){
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function show_connectBotToAdmin(ref, channel, message, type){
    let ios = null, android = null, url = null, qrCode = null;
    channel = getItemName(getChannelsData(true), channel, ['c', 'name'], 'item');
    
    if(channel.c == 2 && cur_page.sms.number != '' && message){        
        ios = {url: "sms:"+cur_page.sms.number+(message ? "&body="+message : '')}
        android = {url: "sms:"+cur_page.sms.number+(message ? "?body="+message : '')}

        ios.qr_code =  "https://api.qrserver.com/v1/create-qr-code/?data="+encodeURIComponent(ios.url)+"&size=250x250";
        android.qr_code =  "https://api.qrserver.com/v1/create-qr-code/?data="+encodeURIComponent(android.url)+"&size=250x250";

    }else{
        if(type === 'getLink')
            url = ref;
        else
            url = get_link(ref, null, channel.id, false);

        qrCode = "https://api.qrserver.com/v1/create-qr-code/?data="+encodeURIComponent(url)+"&size=250x250";
    }

    mainData.channelPreview = {type, android, ios,  qr_code: qrCode, url, message, channelName: channel.name}

    $("#connectBotToAdmin").modal("show");
}


function sendBrowserNotification(title, body, icon, url, tag, badge){
    if (!("Notification" in window) || Notification.permission !== 'granted')
        return false;


        let param = {};
        if(body) param.body = body;
        if(icon) param.icon = icon;
        if(badge) param.badge = badge;

    let notification = new Notification(title, param);

    if(url){
        notification.onclick = function () {
            window.open(url);
        };
    }    
}


 function registerServiceWorker(){
    if(!("Notification" in window) || !('serviceWorker' in navigator) || !('PushManager' in window) || Notification.permission !== 'granted')
        return null;

    try{

        return navigator.serviceWorker.register(getPHPUserScript('/js/serviceWorker.js')).then(function (registration) {
            registration.update();
            return registration;
        }).catch(function (err){});
       
    } catch (error) {}

    return null;
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function getClientReferenceId() {
    return window.Rewardful && window.Rewardful.referral || ('checkout_'+(new Date).getTime());
}

function formatMoney(number, currency, cents){
    try{
        var formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency,
        });

        if(cents)
            return formatter.format(number/100);
        else
            return formatter.format(number)
    }catch(ex){
        return currency + " " + number;
    }
}





function preSendProduct(data, callback, showModal){
    let modalM = $("#mSendProduct");    

    if(showModal === undefined)
        showModal = true;
    
    if(showModal)
        modalM.modal('show');

    if(mainData.products === null){
        loadProducts(function(success){
            if(success)
                preSendProduct(data, callback, false);
            else
                modalM.modal('hide');
        })

        return;
    }


    if(!data)
        data = {}

    mainData.sendProduct.easyMode = data.easyMode != undefined ? data.easyMode : true;
    mainData.sendProduct.header = data.header != undefined ? data.header : {type: 'text', text: ''};
    mainData.sendProduct.body = data.body != undefined ? data.body : '';
    mainData.sendProduct.footer = data.body != undefined ? data.footer : '';


    if(data.easyMode){
        mainData.sendProduct.value = data.value !== undefined ? data.value : [];
        mainData.sendProduct.sessions = [{title: '', value: []}];
    }else{
        mainData.sendProduct.sessions = data.sessions ? data.sessions : [{title: '', value: []}];
        mainData.sendProduct.value = [];
    }


    mainData.sendProduct.channel = data.channel != undefined ? data.channel : 0;

    let options = [];
    for(let i = 0; i < mainData.products.length; i++){
        let product = mainData.products[i];            
        let option = {value: product.id, label: product.n}

        if(mainData.sendProduct.channel == 5 && product.hv){
            option.children = [];
            option.disabled = true;
            for(let j = 0; j < mainData.products.length; j++){
                
                if(product.id === mainData.products[j].pp){        
                    let child = mainData.products[j];
                    let name = child.n +" • ";
                    if(child.o3 !== '')
                        name += child.o0 + " • " + child.o1  + " • " +  child.o2  + " • " +  child.o3;
                    else if(child.o2 !== '')
                        name += child.o0 + " • " + child.o1  + " • " +  child.o2;
                    else if(child.o1 !== '')
                        name += child.o0 + " • " + child.o1;
                    else
                        name += child.o0;

                    
                    if(child.sku !== '')
                        option.children.push({value: child.id, label: name, disabled: child.sku === ''});
                }
            }

            if(option.children.length)
                options.push(option);

        }else
            if(product.t == 0 && (mainData.sendProduct.channel != 5 || product.sku !== ''))
                options.push(option);
    }

    mainData.sendProduct.options = options;

    
    
    modalM.find('.positive').off('click').click(function(){
        if(mainData.sendProduct.easyMode){
            if(mainData.sendProduct.value.length === 0){
                msg_error(myi18n.t('msg10'));
                return;
            }           
        }

        modalM.modal('hide');
        callback(cloneObj(mainData.sendProduct));
        
    })

}

function apiGetSteps(flowID, callback){
    let param = {op:'flows', op1:'get', step: true, data:{flowID}}
    execute_request(param, null, null, false, function (r) {
        if (r.status == "OK")
            callback(r.data);
        else
            callback(null);            
    });
}


function testForm(){
	let form = {title: "This is a test", rows: [
        {id:'param0', label: 'Messi', type:"my-input", value: ''},
        {
            id:"player",
            loading: true,
            type:"select", label: "Test Select", value: null, multiple: false, keyId:'id', keyLabel:'name', 
            options: null
        }
    ]}
        
    showForms(form, function(data){
		console.log(data);
    })
  }


function isWaTemplateReady(components){
    if(components.body){
        for(let i = 0; i < components.body.pers.length; i++){
            if(components.body.pers[i].value === '')
                return false;
        }
    }



    if(components.footer){
        for(let i = 0; i < components.footer.pers.length; i++){
            if(components.footer.pers[i].value === '')
                return false;
        }
    }



    if(components.header){
        if(components.header.format == 'TEXT'){
            if(components.header.pers){
                for(let i = 0; i < components.header.pers.length; i++){
                    if(components.header.pers[i].value === '')
                        return false;
                }
            }            
        }else if(components.header.url === '')
            return false;
        
    }



    return true;
}


function auth_integration(op, op1, next){ 
    pb_show(true, myi18n.t('processing'));
    
    if(!next)
        next = null;
    
    var param = {page_id: cur_page.page_id, op: op, op1: op1, data:{next: next}}
        execute_request(param, null, null, false, function (data) {
            if (data.status == 'OK'){
                if(op1 === 'get-auth-link')
                    window.location.href = data.url;
                else    
                    window.location.reload();
            }else if(data.code != 98)
                show_model(true, myi18n.t('msg0'), myi18n.t('ok'), "");
    });    
}


function startSelectFolder(items, content){
    $('#mSelectFolder').modal('show');
    mainData.selectFolder.items = items;
    mainData.selectFolder.content = content;
    mainData.selectFolder.notAllowed = [7];
    mainData.selectFolder.selectedFolder = null;

    if(activeFolder.id == 0)
        preMoveFolder('list', 0);
    else{
        mainData.selectFolder.currentFolders = [{id: 0, name: getContentName(content, 0), selected: false}]
    }
}

function preMoveFolder(op, parent, item){
    if(op == 'selection'){
        if(item.selected)
            mainData.selectFolder.selectedFolder = item;
        else
            mainData.selectFolder.selectedFolder = null;

        return;
    }


    if(op == 'list'){

        mainData.selectFolder.selectedFolder = null;
        mainData.selectFolder.loading = true;
        param = {page_id: cur_page.page_id, op: 'folder', op1: 'get', parent, content: mainData.selectFolder.content};
    
       
        execute_request(param, null, null, false, function (data) {    
          if(data.status === 'OK'){
                let folders = [];
                for(let i = 0; i < data.results.length; i++){
                    let folder = data.results[i];
                    folder.id = parseInt(folder.id);
                    if(mainData.selectFolder.notAllowed.includes(folder.id))
                        continue;

                        folder.selected = false;

                    folders.push(folder);
                }

                let parents = [];
                if(data.parents.length){
                    parents = [{id: 0, name: getContentName(mainData.selectFolder.content, 0)}];

                    for(let i = data.parents.length - 1; i >= 0; i--)
                        parents.push(data.parents[i]);

                }

                mainData.selectFolder.parents = parents;
                mainData.selectFolder.currentFolders = folders;   
                mainData.selectFolder.loading = false;
          }
        }); 
    }else if(op == 'done'){
        folderMoveItem(mainData.selectFolder.items, mainData.selectFolder.selectedFolder.id, mainData.selectFolder.content)
        $('#mSelectFolder').modal('hide');
    }
}

function activateBot(){
    show_model(true, 'Your bot was deactivated because your account reached the maximum number of contacts. Your account will be deactivated again if any new contact sends a message to your bot.', myi18n.t('activateBot'), myi18n.t('cancel'), "");
    $("#btt_yes").click(function () {
        var param = { op: 'settings', op1: 'activateAccount'};
        execute_request(param, null, null, true, function (data) {   
            if(data.status == "OK"){
                msg_success();
                window.location.reload();
            }else{
                pb_show(false); 
            }
        })      
    });    
}


function addNewCF(item, id, types, callback){
        let rows = [
            {id: 'name', label: myi18n.t('name'), type: 'text', value: ''}
        ];

        if(!types)
            types = [0,1,2,3,4];
        
        let cfType = types.length == 1 ? types[0] : null;
        if(cfType === null){
            let options = [];
            for(let i = 0; i < types.length; i++){
                let t = types[i], name = '';
                if(t == 0)
                    name = myi18n.t('text');
                else if(t == 1)
                    name = myi18n.t('number');
                else if(t == 2)
                    name = myi18n.t('date');
                else if(t == 3)
                    name = myi18n.t('dateTime');
                else
                    name = myi18n.t('trueFalse');

                options.push({id: t, name});
            }

            rows.push({id: 'type', label:  myi18n.t('type'), type:'select', options})
        }




        let form = {title: myi18n.t('c_field'), rows: rows}

        showForms(form, function(data){
            if(data){
                if(cfType === null)
                    cfType = data.type;
            
                mainData.form.loading = true;
                param = { op: 'custom-fields', op1: 'add', name:data.name, type: cfType, botfield: 0, value: null, descr: '', folder: 0}
            
                execute_request(param, null, null, true, function (r) {
                    if (r.status == 'OK') { 
                        if(r.affected == 1){                            
                            
                            if(typeof all_custom_fields !== 'undefined' && all_custom_fields)
                                all_custom_fields.push({name: data.name, id: r.id, type: cfType});
                            
                            if(typeof all_cf_suggestion !== 'undefined' && all_cf_suggestion)
                                all_cf_suggestion.push({name: data.name, id: r.id, type: cfType, value:'{'+data.name+'}}'});

                            mainData.customFields.push({name: data.name, id: r.id, type: cfType})
                        }else
                            r.id;

                        if(item)
                            item[id] = r.id;


                        if(callback)
                            callback(r);

                        return;

                    }else
                        msg_error();
                }); 

            }

            if(callback)
                callback(null);
                
        })

    
}




function addNewItemSelect(item, index){
    let lastForm = cloneObj(mainData.form);
    lastForm.callback = mainData.form.callback;
    

    if(item.addNew.data === 'custom-field'){
        let rows = [
            {id: 'name', label: myi18n.t('name'), type: 'text', value: ''}
        ];

        if(!item.addNew.type)
            item.addNew.type = [0,1,2,3,4];
        
        let cfType = item.addNew.type.length == 1 ? item.addNew.type[0] : null;
        if(cfType === null){
            let options = [];
            for(let i = 0; i < item.addNew.type.length; i++){
                let t = item.addNew.type[i], name = '';
                if(t == 0)
                    name = myi18n.t('text');
                else if(t == 1)
                    name = myi18n.t('number');
                else if(t == 2)
                    name = myi18n.t('date');
                else if(t == 3)
                    name = myi18n.t('date');
                else
                    name = myi18n.t('trueFalse');

                options.push({id: t, name});
            }

            rows.push({id: 'type', label:  myi18n.t('type'), type:'select', options})
        }




        let form = {title: myi18n.t('c_field'), rows: rows, keepOnDone: true}

        showForms(form, function(data){
            if(data){
                if(cfType === null)
                    cfType = data.type;
            
                mainData.form.loading = true;
                param = { op: 'custom-fields', op1: 'add', name:data.name, type: cfType, botfield: 0, value: null, descr: '', folder: 0}
            
                execute_request(param, null, null, true, function (r) {
                    if (r.status == 'OK') { 
                        let newItem = lastForm.rows[index];
                        if(r.affected == 1){                            
                            newItem.options.push({id: r.id, name: data.name});
                            newItem.value = r.id;
                            lastForm.rows[index] = newItem;  
                            
                            if(all_custom_fields)
                                all_custom_fields.push({name: data.name, id: r.id, type: cfType});
                            
                            if(all_cf_suggestion)
                                all_cf_suggestion.push({name: data.name, id: r.id, type: cfType, value:'{'+data.name+'}}'});
                        }else
                            lastForm.rows[index].value = r.id;

                        showForms(lastForm, lastForm.callback); 
                            
                    }else
                        msg_error();
                }); 

            }else{
                showForms(lastForm, lastForm.callback); 
            }
                
        })

    }
}


function getChartjsOptions(type, legend, xIsTime){
    if(xIsTime === undefined)
        xIsTime = true;

    let options = {
        plugins: {
            legend: {
                display: legend,
                position: 'bottom'
            }
        }
    }

    if(type == 'bar' || type == 'line'){
        options.scales = {
            x:{
                grid: {
                  display: false
                }
                

            },        
            y: {
              beginAtZero: true,
              grid: {
                display: false
              }
            }
        }

        options.radius = 0;

        if(xIsTime){
            options.scales.x.type = 'time';
            options.scales.x.time = { parser: 'YYYY-MM-DD HH:mm:ss', tooltipFormat: 'LL', displayFormats: { unit: 'day'}}
        }

    }

   

    return options;
}

function getChartValues(data, admins, keysData, keysAdmins){
    if(!keysData)
        keysData = ['id', 'total'];

    if(!keysAdmins)
        keysAdmins = ['id', 'name'];

    let label = [];
    let value = [];
    let name;

    if(admins === null){
        for(let i = 0; i < data.length; i++){
            label.push(data[i][keysData[0]]);
            value.push(data[i][keysData[1]])
        }
    }else{
        for(let i = 0; i < data.length; i++){
            name = getItemName(admins, data[i][keysData[0]]);
            label.push(name ? name : '');
            value.push(data[i][keysData[1]])
        }
    }
    

    return {label, data: value};

}



function convertSecondsToText(seconds){
    let m = moment.utc(1000 * seconds);

    let format;
    if(seconds < 600)
        format = 'm[m] s[s]';
    else if(seconds < 3600)
        format = 'm[m]';
    else if(seconds < 86400)
        format = 'H[h] m[m]';
    else
        format = 'd[d] H[h]';
   
   return m.format(format);
}

function datatableEvents(){
    $('.dataTables_wrapper').on( 'draw.dt', function () {
        $('.dataTables_processing').html('<div class="spinner-grow" style="width: 2rem; height: 2rem;" role="status"> <span class="sr-only">Loading...</span></div>').addClass('text-right border-0')
    } );
}


function preChangeLogo(type, previewURL, callback){
    mainData.newLogo.type = type;
    mainData.newLogo.callback = callback;
    mainData.newLogo.previewURL = previewURL;
    mainData.newLogo.modalM = $("#modalChangeImage");
    mainData.newLogo.modalM.modal('show');
}

function inputLogoChanged(file){
    if(file){
        mainData.newLogo.file = file;
        mainData.newLogo.previewURL = URL.createObjectURL(file.raw)
    }				
}

function changeLogo(){
    mainData.newLogo.uploading = true;
    loadImage(mainData.newLogo.file.raw, function (canvas_img) {  
            param = {op : 'flows', op1:'upload', op2:'image', file_name:null, uploadFB: false}
            if(mainData.newLogo.type)
                param[mainData.newLogo.type] = true;            

            upload_file('imageCanvas', canvas_img, mainData.newLogo.file.raw, param, null, function(r){
                mainData.newLogo.uploading = true;
                if(r.status === 'OK'){ 
                    mainData.newLogo.callback(r.url);                    
                }else
                    msg_error(myi18n.t('msg0')); 
            });
        },{maxWidth: 200, canvas: true}
    );
}


function destroyChart(id){
    let chartStatus = Chart.getChart(id); // <canvas> id
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
}

function hideInformation(){
    $('.mycontainer.divIntro').addClass('hide');
    $('.mycontainer.data').removeClass('hide');
}

function getPersNavLink(url){
    let userName = '', userEmail = '', userID = '', account_id = '', account_secret = '';
    if(mainData.me){
        userName = mainData.me.name;
        userEmail = mainData.me.email;
        userID = mainData.me.fb_id;
    }

    if(cur_page){
        account_id = cur_page.page_id;
        account_secret  = cur_page.secret;
    }


    return url.replace('{{account_id}}', account_id).replace('{{user_name}}', encodeURIComponent(userName)).replace('{{user_id}}', userID).replace('{{user_email}}',userEmail).replace('{{account_secret}}', account_secret);
}

function loadIframe(url){
    if(url){
        url = getPersNavLink(url)
        localStorage.setItem("dURL", url);
    }else
        url = localStorage.getItem("dURL");

    if(url){
        
        if(mainData.iframe || mainData.pageName === 'l')
            mainData.iframe = {url: url}
        else
            document.location.href = 'l';

    }else{
        got_page_error();
    }
       
}

function prePrareAnalyticsData(data){
    data.total = Number(data.total);
    data.previous = Number(data.previous);
    return data;
}

function changeMyAvailability(){
	mainData.me.available = mainData.me.available == 1 ? 0 : 1;
	let param = {op: 'admins', op1: 'changeMyAvailability', data: {available: mainData.me.available}}

	execute_request(param, null, null, false, function (r) {                
		if (r.status != "OK"){
			msg_error();
		}
	});
}


function ciclyToText(cicly, cicly_count){
    switch(cicly){
        case 'month': return cicly_count == 1 ? myi18n.t('bil.month') : myi18n.tc('bil.msg5', cicly_count);
        case 'year': return myi18n.tc('bil.year', cicly_count);
        case 'week': return cicly_count == 1 ? myi18n.t('bil.week') : myi18n.tc('bil.msg6', cicly_count);
        case 'day': return cicly_count == 1 ? myi18n.t('bil.day') : myi18n.tc('bil.msg7', cicly_count);
    }
}

function formatBytes(bytes) {
    if (bytes < 1024)
        return bytes + "B"
    else if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(2) + " KB"
    else 
        return (bytes / (1024 * 1024)).toFixed(2) + " MB"    
}



function setPaginationData(r, tableIdx){
    mainData.tables[tableIdx].pagination.recordsTotal = r.recordsTotal;
}

function tableLoadData(idx, callback){
    pb_show(true);

    let table = mainData.tables[idx];
    table.datatable.start = (table.pagination.currentPage - 1) * table.datatable.length;

    let param = table.request;
    param.datatable = table.datatable;
    param.datatable.draw++;

    let draw = param.datatable.draw;
    
    execute_request(param, null, null, false, function (r) { 
        if(draw === param.datatable.draw){
            if (r.status == "OK"){ 
                setPaginationData(r, idx);
                let items = r.data;

                for(let i = 0; i < items.length; ++i)
                    items[i] = prepareItem(items[i]);

                mainData.data.items = items;

                if(callback)
                    callback();

                pb_show(false);

            }else if(data.code == 51){
                pb_show(false);
            }
        }
    }); 
}



function copyItemToOtherPage(row, op, op1){        
    let op2 = null;
    if(!op1)
        op1 = 'copy';
    else
        op2 = 'copy';

    let options = [];
    for(let i = 0; i < mainData.my_pages.length; ++i){
        if(cur_page.page_id != mainData.my_pages[i].page_id)
            options.push({id: mainData.my_pages[i].page_id, name: mainData.my_pages[i].name}); 
    }
         
    let form = {title: myi18n.t('copyTo'), rows: [{id:'page_id', label: myi18n.t('accountName'), type:"select", value: null, options}]}
    showForms(form, function(data){
        pb_show(true, myi18n.t('processing'));                
        param = {op, op1, op2, data: {id: row.id, page_id: data.page_id}}
        execute_request(param, null, null, false, function (data) {    
            pb_show(false);                
            if(data.status == 'OK'){
                msg_success();
            }else{
                msg_error(myi18n.t('msg0'), 4000);
            }
        })
    })       
}



function getShortRelativeTime(unixTimestamp) {
    let shortFormats = {
        en: { day: 'd', hour: 'h', minute: 'm'},
        pt: { dia: 'd', hora: 'h', minuto: 'm', minute: 'm', hour: 'h'},
        es: { día: 'd', hora: 'h', minuto: 'm', minute: 'm', hour: 'h' },
        fr: { jour: 'j', heure: 'h', minute: 'm', minute: 'm', hour: 'h'},
        de: { Tag: 'd', Stunde: 'h', Minute: 'm', minute: 'm', hour: 'h'},
    };

    const mappings = shortFormats[mainData.locale] || shortFormats['en'];

    let diff = getTimestamp() - unixTimestamp;

    if(diff < 60)
		return '0'+ mappings.minute;
    else if(diff < 120)
		return '1'+ mappings.minute;
    else if(diff >= 3600 && diff < 7200)
		return '1'+ mappings.hour;

    const date = moment.unix(unixTimestamp);

    let relativeTime = date.fromNow(true);    

    Object.entries(mappings).forEach(([long, short]) => {
        relativeTime = relativeTime.replace(new RegExp(long + 's?', 'i'), short).replace(' ', '');
    });

    return relativeTime;
}

function getAdminsTeams(admins, teams){
    let adminsTeams =[];
    for(let i = 0; i < admins.length; i++){
        adminsTeams.push({id: admins[i].fb_id, fb_id: admins[i].fb_id,  name: admins[i].name, profile_pic: admins[i].profile_pic, isTeam: false, available: admins[i].available == 1, startLetter: admins[i].name.length ? admins[i].name[0] : '', first_name: admins[i].first_name, last_name: admins[i].last_name});
    }

    for(let i = 0; i < teams.length; i++){
        adminsTeams.push({id: teams[i].id, fb_id: teams[i].id, name: teams[i].name, profile_pic: whitelabel.appdomain+'images/peopleGroup.svg', isTeam: true, available: true, startLetter: teams[i].name.length ? teams[i].name[0] : ''});
    }

    return adminsTeams;
}

function getCountry(id){
    let country = getItemName(allCountries, id, ['i', 'n'], 'item');
    if(!country)
        return getItemName(allCountries, 840, ['i', 'n'], 'item');
    else
        return country;
}

