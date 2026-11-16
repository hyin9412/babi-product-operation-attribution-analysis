import {
  require_react
} from "./chunk-4GIIBEN7.js";
import {
  __toESM
} from "./chunk-SAS5OB7F.js";

// node_modules/@arco-design/iconbox-react-babi/esm/IconEmptyChart/index.js
var import_react2 = __toESM(require_react());

// node_modules/@arco-design/iconbox-react-babi/esm/context.js
var import_react = __toESM(require_react());
var Context = (0, import_react.createContext)({
  prefix: "babi"
});

// node_modules/@arco-design/iconbox-react-babi/esm/IconEmptyChart/index.js
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
function IconEmptyChartComponent(props, ref) {
  var prefixFromContext = (0, import_react2.useContext)(Context).prefix;
  var _a = props.className, className = _a === void 0 ? "" : _a, prefixFromProps = props.prefix, _b = props.width, width = _b === void 0 ? "1em" : _b, _c = props.height, height = _c === void 0 ? "1em" : _c, _d = props.useCurrentColor, useCurrentColor = _d === void 0 ? false : _d, spin = props.spin, rest = __rest(props, ["className", "prefix", "width", "height", "useCurrentColor", "spin"]);
  var prefix = prefixFromProps || prefixFromContext || "babi";
  var loadingKls = spin ? " ".concat(prefix, "-icon-loading") : "";
  return import_react2.default.createElement(
    "svg",
    __assign({ className: "".concat(prefix, "-icon ").concat(prefix, "-icon-emptyChart").concat(loadingKls, " ").concat(className), width, height, viewBox: "0 0 81 80", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, rest, { ref }),
    import_react2.default.createElement(
      "g",
      { filter: "url(#svg_a2e4822a98__filter0_dii_20_40747)" },
      import_react2.default.createElement("path", { d: "M8.50021 14.6669C8.50009 10.9849 11.4849 8 15.1669 8H47.2484H65.8313C69.5132 8 72.498 10.9848 72.498 14.6667V27.8195L72.4997 65.333C72.4999 69.015 69.515 72 65.833 72H15.1685C11.4866 72 8.50192 69.0154 8.5018 65.3335L8.50021 14.6669Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint0_linear_20_40747)" }),
      import_react2.default.createElement("path", { d: "M8.70021 14.6669C8.7001 11.0954 11.5954 8.2 15.1669 8.2H47.2484H65.8313C69.4028 8.2 72.298 11.0952 72.298 14.6667V27.8195L72.2997 65.333C72.2999 68.9046 69.4046 71.8 65.833 71.8H15.1685C11.5971 71.8 8.70191 68.9049 8.7018 65.3335L8.70021 14.6669Z", stroke: "url(#svg_a2e4822a98__paint1_linear_20_40747)", strokeWidth: ".4" })
    ),
    import_react2.default.createElement("rect", { x: "14.033", y: "13.533", width: "52.933", height: "52.933", rx: "5.133", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint2_linear_20_40747)", stroke: "url(#svg_a2e4822a98__paint3_linear_20_40747)", strokeWidth: ".4" }),
    import_react2.default.createElement("path", { fill: useCurrentColor ? "currentColor" : "#EAEAEA", d: "M31.54 13.616H31.86V66.288H31.54zM49.46 13.658H49.78V66.342H49.46z" }),
    import_react2.default.createElement("path", { transform: "rotate(90 66.77 30.72)", fill: useCurrentColor ? "currentColor" : "#EAEAEA", d: "M66.769 30.72H67.089V83.549H66.769z" }),
    import_react2.default.createElement("path", { transform: "rotate(90 66.781 48.64)", fill: useCurrentColor ? "currentColor" : "#EAEAEA", d: "M66.781 48.64H67.101V101.481H66.781z" }),
    import_react2.default.createElement(
      "mask",
      { id: "svg_a2e4822a98__a", style: { maskType: "alpha" }, maskUnits: "userSpaceOnUse", x: "14", y: "13", width: "54", height: "54" },
      import_react2.default.createElement("rect", { x: "14.449", y: "13.533", width: "52.517", height: "52.933", rx: "5.133", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint4_linear_20_40747)", stroke: "url(#svg_a2e4822a98__paint5_linear_20_40747)", strokeWidth: ".4" })
    ),
    import_react2.default.createElement(
      "g",
      { mask: "url(#svg_a2e4822a98__a)" },
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter1_ii_20_40747)" },
        import_react2.default.createElement("circle", { cx: "55.167", cy: "30", r: "4", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint6_radial_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter2_ii_20_40747)" },
        import_react2.default.createElement("circle", { cx: "51.167", cy: "51.333", r: "4", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint7_radial_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter3_f_20_40747)" },
        import_react2.default.createElement("ellipse", { cx: "50.933", cy: "52.509", rx: "2.446", ry: "2.31", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint8_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter4_iii_20_40747)" },
        import_react2.default.createElement("path", { d: "M23.8334 43C20.6334 48.0666 16.0556 51.7777 14.1667 53L10.1667 56C10.389 57.2222 11.9109 58.6748 16.8334 55.6666C22.8334 52 27.1667 45 27.8334 44C28.5001 43 33.8334 35.3333 36.5001 32.3333C39.1667 29.3333 41.8334 28.3333 44.8334 28.3333C47.1547 28.3333 50.0787 29.5806 51.374 30.2656C51.4424 30.3018 51.5274 30.2733 51.5594 30.2027L53.11 26.7915C53.1411 26.7231 53.1083 26.642 53.039 26.6131C46.775 23.9956 42.4664 23.6868 37.5001 26.6666C32.5001 29.6666 27.8334 36.6666 23.8334 43Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint9_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter5_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M38.5002 26.6665C35.5002 27.6665 32.8335 31.1109 31.8335 32.3332L32.8335 32.9998C34.1668 30.5998 37.3891 28.1109 38.8335 27.3332L38.5002 26.6665Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint10_linear_20_40747)", fillOpacity: ".8" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter6_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M40.5 25.5142C43.9667 23.6475 50.577 25.1923 53.2201 26.9842L52.296 28.4786C47.3977 25.0288 42.1667 25.5142 40.8333 26.1809L40.5 25.5142Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint11_linear_20_40747)", fillOpacity: ".6" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter7_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M19.5847 52.6666C17.7517 54 14.658 54.7377 13.5001 54.6666L13.5001 57C16.1668 56 19.085 54 19.5847 52.6666Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint12_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter8_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M23.1667 45.6665L30.8334 34.6665L33.1667 35.6665V36.3332L30.5001 39.6665L26.5001 44.9998L23.1667 45.6665Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint13_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter9_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M11.8335 56C16.1002 54.6667 23.5002 47 24.8335 43L24.1668 43.3333C21.5002 48 17.1668 51.3333 13.5002 53.6667L11.8335 56Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint14_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter10_ii_20_40747)" },
        import_react2.default.createElement("path", { d: "M20.5002 34.3332C19.4335 35.1332 15.3891 39.111 13.5002 40.9999L12.8335 45.9999C15.1668 44.6665 20.0557 40.3332 21.8335 38.3332C23.0187 36.9999 25.8335 34.6665 28.8335 34.9999C33.8335 35.5554 39.8335 41.6665 41.1668 42.9999C42.2153 44.0484 45.7116 48.1888 47.4133 50.2291C47.4616 50.2869 47.5468 50.2918 47.6031 50.2418L50.3945 47.7605C50.4518 47.7095 50.4544 47.6208 50.4002 47.5666C49.7653 46.9308 49.1003 46.25 47.8335 44.6665C44.71 40.7622 35.5002 32.6665 33.1668 31.9999C25.5002 29.3332 21.8335 33.3332 20.5002 34.3332Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint15_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter11_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M11.8335 43.3333C14.8626 42.4158 20.1161 37.1405 21.0627 34.3882L20.5894 34.6175C18.6962 37.8286 15.6198 40.1222 13.0167 41.7277L11.8335 43.3333Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint16_linear_20_40747)" })
      ),
      import_react2.default.createElement(
        "g",
        { filter: "url(#svg_a2e4822a98__filter12_f_20_40747)" },
        import_react2.default.createElement("path", { d: "M21.8464 37.0353C19.9471 38.4274 13.5955 43.057 11.4053 44.2282L13.0334 45.7429C15.4549 44.2437 21.6155 38.4403 21.8464 37.0353Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint17_linear_20_40747)", fillOpacity: ".8" })
      )
    ),
    import_react2.default.createElement(
      "g",
      { filter: "url(#svg_a2e4822a98__filter13_f_20_40747)" },
      import_react2.default.createElement("ellipse", { cx: "55.147", cy: "31.013", rx: "2.158", ry: "2.458", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint18_linear_20_40747)" })
    ),
    import_react2.default.createElement(
      "g",
      { filter: "url(#svg_a2e4822a98__filter14_f_20_40747)" },
      import_react2.default.createElement("ellipse", { cx: "48.98", cy: "51.35", rx: "1.229", ry: "2.132", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint19_radial_20_40747)", fillOpacity: ".6" })
    ),
    import_react2.default.createElement(
      "g",
      { filter: "url(#svg_a2e4822a98__filter15_f_20_40747)" },
      import_react2.default.createElement("ellipse", { cx: "52.575", cy: "49.529", rx: ".804", ry: "1.484", fill: useCurrentColor ? "currentColor" : "#BEC4DC" })
    ),
    import_react2.default.createElement(
      "g",
      { filter: "url(#svg_a2e4822a98__filter16_f_20_40747)" },
      import_react2.default.createElement("ellipse", { cx: "53.882", cy: "51.891", rx: ".988", ry: "1.402", transform: "rotate(25.846 53.882 51.89)", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint20_radial_20_40747)", fillOpacity: ".6" })
    ),
    import_react2.default.createElement(
      "g",
      { filter: "url(#svg_a2e4822a98__filter17_f_20_40747)" },
      import_react2.default.createElement("path", { d: "M54.2596 53.5532C51.4697 55.0245 48.7987 54.093 48.1247 53.48C48.1247 54.0109 49.2956 55.2685 51.5956 55.1378C53.1124 55.0517 54.2016 54.028 54.2596 53.5532Z", fill: useCurrentColor ? "currentColor" : "url(#svg_a2e4822a98__paint21_linear_20_40747)", fillOpacity: ".8" })
    ),
    import_react2.default.createElement(
      "defs",
      null,
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint0_linear_20_40747", x1: "60.951", y1: "15.847", x2: "22.284", y2: "83.354", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#EBEBEC" }),
        import_react2.default.createElement("stop", { offset: ".855", stopColor: "#EDEDEE" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint1_linear_20_40747", x1: "15.553", y1: "2.963", x2: "51.696", y2: "66.701", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#E0DEDE" }),
        import_react2.default.createElement("stop", { offset: ".192", stopColor: "#E7E7E7" }),
        import_react2.default.createElement("stop", { offset: ".704", stopColor: "#D9D9D9" }),
        import_react2.default.createElement("stop", { offset: ".963", stopColor: "#C3C3C7" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint2_linear_20_40747", x1: "57.542", y1: "19.872", x2: "25.32", y2: "76.129", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#fff" }),
        import_react2.default.createElement("stop", { offset: ".855", stopColor: "#fff" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint3_linear_20_40747", x1: "19.711", y1: "9.136", x2: "49.83", y2: "62.251", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#E2E2E2" }),
        import_react2.default.createElement("stop", { offset: ".192", stopColor: "#EEE" }),
        import_react2.default.createElement("stop", { offset: ".704", stopColor: "#E3E3E3" }),
        import_react2.default.createElement("stop", { offset: ".963", stopColor: "#C3C3C7" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint4_linear_20_40747", x1: "57.617", y1: "19.872", x2: "25.268", y2: "75.91", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#fff" }),
        import_react2.default.createElement("stop", { offset: ".855", stopColor: "#fff" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint5_linear_20_40747", x1: "20.081", y1: "9.136", x2: "50.321", y2: "62.048", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#E2E2E2" }),
        import_react2.default.createElement("stop", { offset: ".192", stopColor: "#EEE" }),
        import_react2.default.createElement("stop", { offset: ".704", stopColor: "#E3E3E3" }),
        import_react2.default.createElement("stop", { offset: ".963", stopColor: "#C3C3C7" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint8_linear_20_40747", x1: "52.635", y1: "50.579", x2: "51.157", y2: "54.896", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#7780A4" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#727B9F" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint9_linear_20_40747", x1: "40.167", y1: "25.667", x2: "46.833", y2: "35.333", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#BFC5DD" }),
        import_react2.default.createElement("stop", { offset: ".652", stopColor: "#858EB3" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint10_linear_20_40747", x1: "37.167", y1: "27.333", x2: "32.834", y2: "32", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#F2F2F2", stopOpacity: "0" }),
        import_react2.default.createElement("stop", { offset: ".41", stopColor: "#D2D5E2" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#CFD4E9" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint11_linear_20_40747", x1: "40.682", y1: "25.696", x2: "43.863", y2: "21.024", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#D0D5E9" }),
        import_react2.default.createElement("stop", { offset: ".475", stopColor: "#DDE1F5" }),
        import_react2.default.createElement("stop", { offset: ".924", stopColor: "#DCDFE9", stopOpacity: ".8" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint12_linear_20_40747", x1: "14.167", y1: "54.333", x2: "14.5", y2: "57", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#66709F" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#6270AE" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint13_linear_20_40747", x1: "31.167", y1: "34.666", x2: "26.167", y2: "46", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#475279" }),
        import_react2.default.createElement("stop", { offset: ".43", stopColor: "#6D779E" }),
        import_react2.default.createElement("stop", { offset: ".685", stopColor: "#747DA3" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#7E88B0" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint14_linear_20_40747", x1: "19.167", y1: "43", x2: "19.167", y2: "55", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#DBE0F3", stopOpacity: ".63" }),
        import_react2.default.createElement("stop", { offset: ".751", stopColor: "#A7AFD1" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#676F92" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint15_linear_20_40747", x1: "31.667", y1: "31.098", x2: "31.667", y2: "50.333", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#F6F6F6" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#E1DEDE" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint16_linear_20_40747", x1: "17.04", y1: "34.388", x2: "17.04", y2: "42.645", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#fff" }),
        import_react2.default.createElement("stop", { offset: ".751", stopColor: "#EBEAEA" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#DFDEDC" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint17_linear_20_40747", x1: "15.625", y1: "40.943", x2: "14.468", y2: "44.952", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#DBDBDB", stopOpacity: ".33" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#CBCBCB" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint18_linear_20_40747", x1: "55.147", y1: "28.555", x2: "55.147", y2: "33.471", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { stopColor: "#F5F5F5" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#C8C8C8" })
      ),
      import_react2.default.createElement(
        "linearGradient",
        { id: "svg_a2e4822a98__paint21_linear_20_40747", x1: "53.645", y1: "54.087", x2: "48.85", y2: "54.458", gradientUnits: "userSpaceOnUse" },
        import_react2.default.createElement("stop", { offset: ".08", stopColor: "#8691BC", stopOpacity: ".64" }),
        import_react2.default.createElement("stop", { offset: ".57", stopColor: "#757EA0" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#868DAA", stopOpacity: ".55" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter0_dii_20_40747", x: "8.186", y: "7.686", width: "65.256", height: "65.57", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dx: ".314", dy: ".628" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".314" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "out" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" }),
        import_react2.default.createElement("feBlend", { in2: "BackgroundImageFix", result: "effect1_dropShadow_20_40747" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "effect1_dropShadow_20_40747", result: "shape" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dx: ".942", dy: ".942" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".314" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "shape", result: "effect2_innerShadow_20_40747" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dx: "-.942", dy: "-.942" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".157" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.879167 0 0 0 0 0.879167 0 0 0 0 0.879167 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "effect2_innerShadow_20_40747", result: "effect3_innerShadow_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter1_ii_20_40747", x: "51.167", y: "24.667", width: "8", height: "12", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dy: "2.667" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: "1.333" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.958333 0 0 0 0 0.958333 0 0 0 0 0.958333 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "shape", result: "effect1_innerShadow_20_40747" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dy: "-1.333" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: "1.333" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.85098 0 0 0 0 0.831373 0 0 0 0 0.823529 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "effect1_innerShadow_20_40747", result: "effect2_innerShadow_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter2_ii_20_40747", x: "47.034", y: "46.333", width: "8.2", height: "9", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dx: "-.133", dy: "-1" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.787639 0 0 0 0 0.810254 0 0 0 0 0.891667 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "shape", result: "effect1_innerShadow_20_40747" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dx: ".067" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".1" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.52549 0 0 0 0 0.564706 0 0 0 0 0.705882 0 0 0 0.69 0" }),
        import_react2.default.createElement("feBlend", { in2: "effect1_innerShadow_20_40747", result: "effect2_innerShadow_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter3_f_20_40747", x: "47.487", y: "49.199", width: "6.892", height: "6.621", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".5", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter4_iii_20_40747", x: "10.167", y: "23.206", width: "43.022", height: "34.907", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dy: "-1.333" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: "1" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.431997 0 0 0 0 0.46781 0 0 0 0 0.620833 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "shape", result: "effect1_innerShadow_20_40747" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dy: ".667" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.832587 0 0 0 0 0.849728 0 0 0 0 0.920833 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "effect1_innerShadow_20_40747", result: "effect2_innerShadow_20_40747" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dx: ".067", dy: "-.333" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".333" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.702188 0 0 0 0 0.718807 0 0 0 0 0.7875 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "effect2_innerShadow_20_40747", result: "effect3_innerShadow_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter5_f_20_40747", x: "31.5", y: "26.333", width: "7.667", height: "7", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".167", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter6_f_20_40747", x: "39.967", y: "24.133", width: "13.787", height: "4.879", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".267", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter7_f_20_40747", x: "12.833", y: "52", width: "7.418", height: "5.667", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".333", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter8_f_20_40747", x: "22.5", y: "34", width: "11.333", height: "12.333", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".333", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter9_f_20_40747", x: "10.834", y: "42", width: "15", height: "15", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".5", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter10_ii_20_40747", x: "12.834", y: "29.765", width: "37.606", height: "21.178", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dy: "-1.333" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.870588 0 0 0 0 0.85098 0 0 0 0 0.854902 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "shape", result: "effect1_innerShadow_20_40747" }),
        import_react2.default.createElement("feColorMatrix", { in: "SourceAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
        import_react2.default.createElement("feOffset", { dy: ".667" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".333" }),
        import_react2.default.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
        import_react2.default.createElement("feColorMatrix", { values: "0 0 0 0 0.964706 0 0 0 0 0.960784 0 0 0 0 0.964706 0 0 0 1 0" }),
        import_react2.default.createElement("feBlend", { in2: "effect1_innerShadow_20_40747", result: "effect2_innerShadow_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter11_f_20_40747", x: "10.834", y: "33.388", width: "11.229", height: "10.945", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".5", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter12_f_20_40747", x: "10.939", y: "36.569", width: "11.374", height: "9.641", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".233", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter13_f_20_40747", x: "51.655", y: "27.222", width: "6.983", height: "7.583", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter14_f_20_40747", x: "46.417", y: "47.884", width: "5.125", height: "6.931", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter15_f_20_40747", x: "50.438", y: "46.712", width: "4.274", height: "5.635", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter16_f_20_40747", x: "51.469", y: "49.224", width: "4.825", height: "5.334", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".667", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "filter",
        { id: "svg_a2e4822a98__filter17_f_20_40747", x: "47.791", y: "53.147", width: "6.801", height: "2.334", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
        import_react2.default.createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
        import_react2.default.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
        import_react2.default.createElement("feGaussianBlur", { stdDeviation: ".167", result: "effect1_foregroundBlur_20_40747" })
      ),
      import_react2.default.createElement(
        "radialGradient",
        { id: "svg_a2e4822a98__paint6_radial_20_40747", cx: "0", cy: "0", r: "1", gradientUnits: "userSpaceOnUse", gradientTransform: "matrix(0 4 -4 0 55.167 30)" },
        import_react2.default.createElement("stop", { stopColor: "#EDECED" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#F7F7F8" })
      ),
      import_react2.default.createElement(
        "radialGradient",
        { id: "svg_a2e4822a98__paint7_radial_20_40747", cx: "0", cy: "0", r: "1", gradientUnits: "userSpaceOnUse", gradientTransform: "rotate(90 -.416 51.583) scale(3.33333)" },
        import_react2.default.createElement("stop", { stopColor: "#626C94" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#AAB2CF" })
      ),
      import_react2.default.createElement(
        "radialGradient",
        { id: "svg_a2e4822a98__paint19_radial_20_40747", cx: "0", cy: "0", r: "1", gradientUnits: "userSpaceOnUse", gradientTransform: "matrix(0 2.13231 -1.22941 0 48.98 51.35)" },
        import_react2.default.createElement("stop", { stopColor: "#ABB1CE" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#AAB6E4", stopOpacity: ".73" })
      ),
      import_react2.default.createElement(
        "radialGradient",
        { id: "svg_a2e4822a98__paint20_radial_20_40747", cx: "0", cy: "0", r: "1", gradientUnits: "userSpaceOnUse", gradientTransform: "matrix(0 1.40202 -.98777 0 53.882 51.89)" },
        import_react2.default.createElement("stop", { stopColor: "#ACB8EC" }),
        import_react2.default.createElement("stop", { offset: "1", stopColor: "#B4BEE8", stopOpacity: ".51" })
      )
    )
  );
}
var IconEmptyChart = import_react2.default.forwardRef(IconEmptyChartComponent);
var IconEmptyChart_default = IconEmptyChart;

export {
  Context,
  IconEmptyChart_default
};
//# sourceMappingURL=chunk-7IXCFXS5.js.map
