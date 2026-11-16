import {
  require_lodash
} from "./chunk-IQXLWIR3.js";
import {
  useDeepEffect_default,
  useUpdateEffect_default
} from "./chunk-LLOOCPN3.js";
import "./chunk-UYE6WE4Q.js";
import {
  IconQuestionCircleFill_default,
  IconSelectAll_default,
  IconSettings_default
} from "./chunk-4QTOOECG.js";
import "./chunk-W4FM7UV2.js";
import {
  IconTableEmpty_default
} from "./chunk-CJQKK7DR.js";
import {
  IconFreezeFirstColumn_default
} from "./chunk-YGCENATP.js";
import {
  Button_default,
  Checkbox_default,
  Divider_default,
  Empty_default,
  Form_default,
  Grid_default,
  Modal_default,
  Popconfirm_default,
  Popover_default,
  Radio_default,
  Table_default,
  Tooltip_default,
  Typography_default
} from "./chunk-4WEYD7EE.js";
import "./chunk-NLILU7VE.js";
import "./chunk-BRKXN5ZZ.js";
import "./chunk-IDO2CQEJ.js";
import "./chunk-4PPBP6OJ.js";
import "./chunk-GFXXBPWB.js";
import "./chunk-XLQI6CV3.js";
import "./chunk-7R4DT26Z.js";
import "./chunk-K2DVR7U4.js";
import {
  require_react_dom
} from "./chunk-UNU2QU3V.js";
import "./chunk-7IXCFXS5.js";
import {
  require_react
} from "./chunk-4GIIBEN7.js";
import {
  __commonJS,
  __toESM
} from "./chunk-SAS5OB7F.js";

// node_modules/merge/lib/src/index.js
var require_src = __commonJS({
  "node_modules/merge/lib/src/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPlainObject = exports.clone = exports.recursive = exports.merge = exports.main = void 0;
    module.exports = exports = main;
    exports.default = main;
    function main() {
      var items = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
      }
      return merge2.apply(void 0, items);
    }
    exports.main = main;
    main.clone = clone;
    main.isPlainObject = isPlainObject;
    main.recursive = recursive;
    function merge2() {
      var items = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
      }
      return _merge(items[0] === true, false, items);
    }
    exports.merge = merge2;
    function recursive() {
      var items = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
      }
      return _merge(items[0] === true, true, items);
    }
    exports.recursive = recursive;
    function clone(input) {
      if (Array.isArray(input)) {
        var output = [];
        for (var index = 0; index < input.length; ++index)
          output.push(clone(input[index]));
        return output;
      } else if (isPlainObject(input)) {
        var output = {};
        for (var index in input)
          output[index] = clone(input[index]);
        return output;
      } else {
        return input;
      }
    }
    exports.clone = clone;
    function isPlainObject(input) {
      return input && typeof input === "object" && !Array.isArray(input);
    }
    exports.isPlainObject = isPlainObject;
    function _recursiveMerge(base, extend) {
      if (!isPlainObject(base))
        return extend;
      for (var key in extend) {
        if (key === "__proto__" || key === "constructor" || key === "prototype")
          continue;
        base[key] = isPlainObject(base[key]) && isPlainObject(extend[key]) ? _recursiveMerge(base[key], extend[key]) : extend[key];
      }
      return base;
    }
    function _merge(isClone, isRecursive, items) {
      var result;
      if (isClone || !isPlainObject(result = items.shift()))
        result = {};
      for (var index = 0; index < items.length; ++index) {
        var item = items[index];
        if (!isPlainObject(item))
          continue;
        for (var key in item) {
          if (key === "__proto__" || key === "constructor" || key === "prototype")
            continue;
          var value = isClone ? clone(item[key]) : item[key];
          result[key] = isRecursive ? _recursiveMerge(result[key], value) : value;
        }
      }
      return result;
    }
  }
});

// node_modules/@byted-babi/babi-design/es/TableBlock/table.js
var import_lodash3 = __toESM(require_lodash());
var import_react4 = __toESM(require_react());

// node_modules/@byted-babi/babi-design/es/hooks/useConcurrencyQueen.js
var import_react = __toESM(require_react());
var ConcurrencyQueue = class {
  constructor(concurrent) {
    this.list = [];
    this.current = 0;
    this.concurrent = concurrent;
  }
  getLength() {
    return this.list.length;
  }
  push(fn) {
    this.list.push(fn);
    this.run();
  }
  run() {
    const runnableNumber = this.concurrent - this.current;
    const runnableArray = [];
    for (let i2 = 0; i2 < runnableNumber; i2++) {
      if (this.getLength() <= 0) {
        break;
      }
      const func = this.list.shift();
      runnableArray.push(func);
    }
    runnableArray.forEach((fn) => {
      this.current++;
      fn().finally(() => {
        this.current--;
        if (this.concurrent - this.current > 0) {
          this.run();
        }
      });
    });
  }
};
function useConcurrencyQueen(concurrent) {
  const concurrencyQueue = (0, import_react.useMemo)(() => {
    const queue = new ConcurrencyQueue(concurrent);
    return queue;
  }, [concurrent]);
  const concurRun = (0, import_react.useCallback)((fn) => {
    if (!fn) {
      return Promise.resolve();
    }
    const promise = new Promise((resolve, reject) => {
      concurrencyQueue.push(() => fn().then(resolve, reject));
    });
    return promise;
  }, [concurrencyQueue]);
  return {
    concurRun
  };
}
var useConcurrencyQueen_default = useConcurrencyQueen;

// node_modules/@byted-babi/babi-design/es/utils/format.js
var import_merge = __toESM(require_src());
var formatDimensionColumn = (columns, dimensionValue, dimensionOptions) => {
  const res = [];
  let dataIndex = [];
  if (dimensionValue && dimensionValue.filter((value) => value).length) {
    dimensionValue.forEach((x) => {
      dataIndex = [...dataIndex, ...dimensionOptions[dimensionOptions.findIndex((option) => option.value === x)].columns];
    });
  }
  if (!dataIndex.length) {
    return columns;
  }
  dataIndex = Array.from(new Set(dataIndex));
  for (let i2 = 0; i2 < columns.length; i2++) {
    const column = Object.assign({}, columns[i2]);
    if (column.children) {
      const children = [];
      for (let j = 0; j < column.children.length; j++) {
        if (dataIndex.includes(column.children[j].dataIndex)) {
          children.push(column.children[j]);
        }
      }
      if (children.length) {
        column.children = children;
        res.push(column);
      }
    } else if (dataIndex.includes(column.dataIndex)) {
      res.push(column);
    }
  }
  return res;
};
var mergeProps = function(...rest) {
  return import_merge.default.recursive(true, ...rest);
};

// node_modules/@byted-babi/babi-design/es/TableBlock/constant.js
var DEFAULT_PAGE_SIZE = 10;
var defaultPagination = {
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  current: 1,
  showTotal: true,
  showJumper: false,
  sizeCanChange: true
};

// node_modules/@byted-babi/babi-design/es/TableBlock/interface.js
var useCheckbox = Checkbox_default.useCheckbox;
var callType;
(function(callType2) {
  callType2["dataSourceChange"] = "dataSourceChange";
  callType2["paginationChange"] = "paginationChange";
  callType2["refChange"] = "refChange";
})(callType || (callType = {}));

// node_modules/@byted-babi/babi-design/es/TableBlock/util.js
var import_lodash = __toESM(require_lodash());
var import_react2 = __toESM(require_react());

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

// node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default = validate;

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
var i;
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var stringify_default = stringify;

// node_modules/uuid/dist/esm-browser/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  var v;
  var arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default = parse;

// node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  var bytes = [];
  for (var i2 = 0; i2 < str.length; ++i2) {
    bytes.push(str.charCodeAt(i2));
  }
  return bytes;
}
var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35_default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    var bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (var i2 = 0; i2 < 16; ++i2) {
        buf[offset + i2] = bytes[i2];
      }
      return buf;
    }
    return stringify_default(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

// node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  if (typeof bytes === "string") {
    var msg = unescape(encodeURIComponent(bytes));
    bytes = new Uint8Array(msg.length);
    for (var i2 = 0; i2 < msg.length; ++i2) {
      bytes[i2] = msg.charCodeAt(i2);
    }
  }
  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
function md5ToHexEncodedArray(input) {
  var output = [];
  var length32 = input.length * 32;
  var hexTab = "0123456789abcdef";
  for (var i2 = 0; i2 < length32; i2 += 8) {
    var x = input[i2 >> 5] >>> i2 % 32 & 255;
    var hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
    output.push(hex);
  }
  return output;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[getOutputLength(len) - 1] = len;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  for (var i2 = 0; i2 < x.length; i2 += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5ff(a, b, c, d, x[i2], 7, -680876936);
    d = md5ff(d, a, b, c, x[i2 + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i2 + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i2 + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i2 + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i2 + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i2 + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i2 + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i2 + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i2 + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i2 + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i2 + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i2 + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i2 + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i2 + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i2 + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i2 + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i2 + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i2 + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i2], 20, -373897302);
    a = md5gg(a, b, c, d, x[i2 + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i2 + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i2 + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i2 + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i2 + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i2 + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i2 + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i2 + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i2 + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i2 + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i2 + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i2 + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i2 + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i2 + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i2 + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i2 + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i2 + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i2 + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i2 + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i2 + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i2 + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i2], 11, -358537222);
    c = md5hh(c, d, a, b, x[i2 + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i2 + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i2 + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i2 + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i2 + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i2 + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i2], 6, -198630844);
    d = md5ii(d, a, b, c, x[i2 + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i2 + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i2 + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i2 + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i2 + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i2 + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i2 + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i2 + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i2 + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i2 + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i2 + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i2 + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i2 + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i2 + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i2 + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }
  var length8 = input.length * 8;
  var output = new Uint32Array(getOutputLength(length8));
  for (var i2 = 0; i2 < length8; i2 += 8) {
    output[i2 >> 5] |= (input[i2 / 8] & 255) << i2 % 32;
  }
  return output;
}
function safeAdd(x, y) {
  var lsw = (x & 65535) + (y & 65535);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var md5_default = md5;

// node_modules/uuid/dist/esm-browser/v3.js
var v3 = v35_default("v3", 48, md5_default);

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (var i2 = 0; i2 < 16; ++i2) {
      buf[offset + i2] = rnds[i2];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default = v4;

// node_modules/uuid/dist/esm-browser/sha1.js
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  var K = [1518500249, 1859775393, 2400959708, 3395469782];
  var H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof bytes === "string") {
    var msg = unescape(encodeURIComponent(bytes));
    bytes = [];
    for (var i2 = 0; i2 < msg.length; ++i2) {
      bytes.push(msg.charCodeAt(i2));
    }
  } else if (!Array.isArray(bytes)) {
    bytes = Array.prototype.slice.call(bytes);
  }
  bytes.push(128);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);
  for (var _i = 0; _i < N; ++_i) {
    var arr = new Uint32Array(16);
    for (var j = 0; j < 16; ++j) {
      arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
    }
    M[_i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (var _i2 = 0; _i2 < N; ++_i2) {
    var W = new Uint32Array(80);
    for (var t = 0; t < 16; ++t) {
      W[t] = M[_i2][t];
    }
    for (var _t = 16; _t < 80; ++_t) {
      W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
    }
    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];
    for (var _t2 = 0; _t2 < 80; ++_t2) {
      var s = Math.floor(_t2 / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
}
var sha1_default = sha1;

// node_modules/uuid/dist/esm-browser/v5.js
var v5 = v35_default("v5", 80, sha1_default);

// node_modules/@byted-babi/babi-design/es/TableBlock/util.js
var wrapFn = import_lodash.default.flowRight([handleSorter, handleFilter, handleEllipsis, handleCellProps]);
function handleColumItem(column, options) {
  const clone = Object.assign({}, column);
  return wrapFn({
    column: clone,
    options
  }).column;
}
function handleCellProps(columnConfig) {
  const { column, options } = columnConfig;
  const { onCell } = options;
  const { dataIndex = "" } = column;
  if (!(typeof onCell === "function")) {
  } else {
    column.onCell = (record, index) => onCell(dataIndex, record, index);
  }
  return { column, options };
}
function handleEllipsis(columnConfig) {
  const { column, options } = columnConfig;
  if (column.ellipsisConfig && !column.hasEllipsis) {
    const preRender = column.render;
    column.render = function(...rest) {
      return import_react2.default.createElement(Typography_default.Paragraph, { style: {
        marginBottom: 0
      }, ellipsis: import_lodash.default.isObject(column.ellipsisConfig) ? column.ellipsisConfig : {
        rows: 1,
        expandable: false,
        showTooltip: {
          type: "popover"
        }
      } }, typeof preRender === "function" ? preRender(...rest) : rest[0]);
    };
    column.hasEllipsis = true;
  }
  return { column, options };
}
function handleFilter(columnConfig) {
  var _a, _b, _c;
  const { column, options } = columnConfig;
  const { filterConfig, tableData } = options;
  const { filter = {}, filterValue } = filterConfig;
  const { dataIndex = "" } = column;
  if (Array.isArray(filter) && filter.includes(dataIndex) || Object.keys(filter).includes(dataIndex)) {
    let defaultFilter = {
      filters: [],
      filteredValue: (filterValue === null || filterValue === void 0 ? void 0 : filterValue[dataIndex]) || []
    };
    if (Array.isArray(filter)) {
      defaultFilter.filters = fetchOps(tableData, dataIndex);
    } else {
      defaultFilter.filters = (((_a = filter[dataIndex]) === null || _a === void 0 ? void 0 : _a.options) ? (_b = filter[dataIndex]) === null || _b === void 0 ? void 0 : _b.options : fetchOps(tableData, dataIndex, (_c = filter[dataIndex]) === null || _c === void 0 ? void 0 : _c.getlabel)) || [];
      defaultFilter = Object.assign(Object.assign({}, defaultFilter), filter[dataIndex]);
    }
    return {
      column: Object.assign(Object.assign({}, column), defaultFilter),
      options
    };
  }
  return { column, options };
}
function handleSorter(columnConfig) {
  const { column, options } = columnConfig;
  const { sorter, sortDirections } = column;
  if (sorter && !sortDirections) {
    column.sortDirections = ["descend", "ascend"];
  }
  return {
    column,
    options
  };
}
var defaultSorter = (a, b) => a - b;
var ascendData = function(data = [], field = "", sort = defaultSorter) {
  return data.sort((a, b) => sort(a[field], b[field], a, b));
};
var fetchOps = (data, dataIndex, getlabel) => {
  const dataMap = data.reduce((pre, cur) => {
    const value = cur[dataIndex];
    pre.set(value, {
      text: typeof getlabel === "function" ? getlabel(value, cur) : value,
      value
    });
    return pre;
  }, /* @__PURE__ */ new Map());
  return Array.from(dataMap.values());
};
function handleTableData(data, key, childrenColumnName) {
  if (import_lodash.default.isEmpty(data)) {
    return [];
  }
  if (typeof key === "function") {
    return data;
  }
  return data.map((x) => {
    const common = Object.assign(Object.assign({}, x), { [key]: x[key] || import_lodash.default.isNumber(x[key]) ? x[key] : v4_default() });
    return x[childrenColumnName] ? Object.assign({}, common, {
      [childrenColumnName]: handleTableData(x[childrenColumnName], key, childrenColumnName)
    }) : common;
  });
}
function isSameTableData(aRecord = {}, bRecord = {}, rowKey) {
  if (import_lodash.default.isEmpty(aRecord) && import_lodash.default.isEmpty(bRecord)) {
    return false;
  }
  return Object.is(aRecord, bRecord) || getRowKey(aRecord, rowKey) === getRowKey(bRecord, rowKey);
}
function getRowKey(record = {}, rowKey) {
  return typeof rowKey === "function" ? rowKey(record) : record[rowKey];
}

// node_modules/@byted-babi/babi-design/es/TableBlock/table.js
import styleModule from "/Users/bytedance/Downloads/genius-ai-prototype-kxccmjtsybmc/node_modules/@byted-babi/babi-design/es/TableBlock/style/style.module.less";

// node_modules/@byted-babi/babi-design/es/TableBlock/hook/useScrollbar.js
var import_react3 = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var useScrollBar = (tableRef, scrollBarConfig) => {
  var _a, _b, _c;
  const { showScrollBar, scrollBarStyle } = scrollBarConfig;
  const isShowScrollBar = (0, import_react3.useMemo)(() => {
    if (navigator.userAgent.indexOf("Mac") > -1)
      return false;
    return showScrollBar;
  }, [showScrollBar]);
  const scrollBarRef = (0, import_react3.useRef)(null);
  const scrollWrapperRef = (0, import_react3.useRef)();
  const [count, setCount] = (0, import_react3.useState)(0);
  function handleScrollWrapper(parentDom) {
    const scrollWrapper = parentDom === null || parentDom === void 0 ? void 0 : parentDom.querySelector(".arco-table-content-inner");
    if (scrollWrapper instanceof HTMLDivElement && parentDom instanceof HTMLDivElement) {
      scrollWrapper.style.overflowX = "hidden";
      const scrollWrapperParent = parentDom.querySelector(".arco-table-content-scroll");
      if (scrollWrapperParent instanceof HTMLDivElement) {
        scrollWrapperParent.style.overflow = "visible";
      }
      scrollWrapperRef.current = scrollWrapper;
      setCount(count + 1);
    }
  }
  (0, import_react3.useEffect)(() => {
    var _a2;
    const parentDom = (_a2 = tableRef.current) === null || _a2 === void 0 ? void 0 : _a2.getRootDomElement();
    parentDom && isShowScrollBar && handleScrollWrapper(parentDom);
  }, [(_b = (_a = tableRef.current) === null || _a === void 0 ? void 0 : _a.getRootDomElement) === null || _b === void 0 ? void 0 : _b.call(_a)]);
  if (!tableRef.current || !scrollWrapperRef.current) {
    return {
      scrollBarJsx: import_react3.default.createElement(import_react3.default.Fragment, null)
    };
  }
  return {
    scrollBarJsx: (0, import_react_dom.createPortal)(import_react3.default.createElement(
      "div",
      { style: Object.assign({ width: "100%", height: 14, position: "sticky", bottom: 0, zIndex: 1 }, scrollBarStyle) },
      import_react3.default.createElement(
        "div",
        { style: {
          position: "absolute",
          width: "100%",
          bottom: 0,
          height: 20,
          overflowX: "auto"
        }, ref: scrollBarRef, onScroll: () => {
          var _a2;
          scrollWrapperRef.current.scrollLeft = (_a2 = scrollBarRef.current) === null || _a2 === void 0 ? void 0 : _a2.scrollLeft;
        } },
        import_react3.default.createElement("div", { style: {
          width: getComputedStyle((_c = scrollWrapperRef.current) === null || _c === void 0 ? void 0 : _c.querySelector("table")).width,
          height: 1
        } })
      )
    ), scrollWrapperRef.current.parentNode)
  };
};
var useScrollbar_default = useScrollBar;

// node_modules/@byted-babi/babi-design/es/utils/filter.js
var import_lodash2 = __toESM(require_lodash());
function filterTableListByFilterValue(list, filterValue = {}, filterConfig = {}) {
  if (import_lodash2.default.isEmpty(filterValue)) {
    return [...list];
  }
  const filterKeys = Object.keys(filterValue);
  const indexFilter = filterConfig.filter || {};
  return list.filter((item) => (
    // 所有维度返回true 就保留数据
    filterKeys.every((key) => {
      var _a;
      if (key) {
        const value = filterValue[key] || [];
        return value.length ? typeof ((_a = indexFilter[key]) === null || _a === void 0 ? void 0 : _a.onFilter) === "function" ? value.some((x) => indexFilter[key].onFilter(x, item)) : value.includes(item[key]) : true;
      }
    })
  ));
}

// node_modules/@byted-babi/babi-design/es/TableBlock/table.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s); i2 < p.length; i2++) {
      if (e.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i2]))
        t[p[i2]] = s[p[i2]];
    }
  return t;
};
var MaxLimit = 1e5;
var DEFAULT_PAGE_SIZE2 = 10;
var defaultRowKey = "ID";
var defaultSorterConfig = {
  ignoreRows: 0
};
function CommonTable(props, ref) {
  var _a;
  const { style, className, rowKey = defaultRowKey, columns = [], size = "default", dataSource, pagination: initialPagination = defaultPagination, sorterConfig = defaultSorterConfig, filterConfig = {}, isSync = false, loadingTip = "", renderPagination, onCell, scrollBar = false, childrenColumnName = "children" } = props, rest = __rest(props, ["style", "className", "rowKey", "columns", "size", "dataSource", "pagination", "sorterConfig", "filterConfig", "isSync", "loadingTip", "renderPagination", "onCell", "scrollBar", "childrenColumnName"]);
  const [loading, setLoading] = (0, import_react4.useState)(false);
  const [tableData, setTableData] = (0, import_react4.useState)([]);
  const [data, setData] = (0, import_react4.useState)(tableData);
  const [showPagination, setShowPagination] = (0, import_react4.useState)(false);
  const [pagination, setPagination] = (0, import_react4.useState)(initialPagination);
  const isbackendPage = (0, import_react4.useRef)(false);
  const pageSizeRestTriggerRef = (0, import_react4.useRef)(false);
  const callTypeRef = (0, import_react4.useRef)();
  const { concurRun } = useConcurrencyQueen_default(1);
  const mergeSorterConfig = mergeProps(defaultSorterConfig, sorterConfig);
  const [sortValue, setSortValue] = (0, import_react4.useState)({});
  const [filterValue, setFilterValue] = (0, import_react4.useState)();
  const tableRef = (0, import_react4.useRef)(null);
  const showScrollBar = Boolean(scrollBar && ((_a = rest.scroll) === null || _a === void 0 ? void 0 : _a.x));
  const { scrollBarJsx } = useScrollbar_default(tableRef, (0, import_lodash3.isBoolean)(scrollBar) ? {
    showScrollBar
  } : Object.assign(Object.assign({}, scrollBar), { showScrollBar }));
  const dataSourceConfig = (0, import_react4.useMemo)(() => {
    if (typeof dataSource === "function" || Array.isArray(dataSource)) {
      return {
        getData: dataSource,
        jumpToFirst: true
      };
    }
    return dataSource;
  }, [dataSource]);
  const defaultFilters = (0, import_react4.useMemo)(() => typeof filterConfig.filter === "object" ? Object.keys(filterConfig.filter).reduce((pre, cur) => {
    var _a2, _b;
    return Object.assign(Object.assign({}, pre), { [cur]: (_b = (_a2 = filterConfig.filter) === null || _a2 === void 0 ? void 0 : _a2[cur]) === null || _b === void 0 ? void 0 : _b.defaultFilters });
  }, {}) : {}, [filterConfig]);
  const finalFilters = (0, import_react4.useMemo)(() => filterConfig.filterValue || filterValue || defaultFilters, [filterConfig.filterValue, filterValue, defaultFilters]);
  function handleFilterAndSorter(isTableDataChange = true) {
    if (isbackendPage.current) {
      isTableDataChange && setData(tableData);
    } else {
      const filterData = handleFilter2(finalFilters);
      const data2 = handleSorter2(sortValue, filterData);
      setData(data2);
      setPagination((pre) => Object.assign(Object.assign({}, pre), { total: data2.length, current: isTableDataChange ? pre.current : 1 }));
    }
  }
  (0, import_react4.useEffect)(() => {
    handleFilterAndSorter();
  }, [tableData]);
  useDeepEffect_default(() => {
    handleFilterAndSorter(false);
  }, [finalFilters, sortValue]);
  function changeTableData(data2) {
    data2 = handleTableData(data2, rowKey, childrenColumnName);
    setTableData(data2);
  }
  const getData = (0, import_react4.useCallback)((pageSize, currentPage) => __awaiter(this, void 0, void 0, function* () {
    const dataSourceOrigin = dataSourceConfig.getData;
    if (Array.isArray(dataSourceOrigin)) {
      return changeTableData(dataSourceOrigin);
    }
    const limit = pageSize !== null && pageSize !== void 0 ? pageSize : DEFAULT_PAGE_SIZE2;
    const offset = ((currentPage !== null && currentPage !== void 0 ? currentPage : 1) - 1) * (pageSize !== null && pageSize !== void 0 ? pageSize : 0);
    setLoading(true);
    try {
      const res = yield dataSourceOrigin({ limit, offset }, callTypeRef.current);
      if (Array.isArray(res)) {
        isbackendPage.current = false;
        setPagination((prevState) => Object.assign(Object.assign({}, prevState), { total: res.length }));
        if (res.length > limit) {
          setShowPagination(true);
        }
        changeTableData(res);
        return setLoading(false);
      }
      if (res === null || res === void 0 ? void 0 : res.Limit) {
        isbackendPage.current = res.Limit < MaxLimit;
      }
      if (res && Array.isArray(res.List)) {
        setPagination((prevState) => Object.assign(Object.assign({}, prevState), { total: res.Total }));
        if (res.Total > limit) {
          setShowPagination(true);
        }
        changeTableData(res.List);
        return setLoading(false);
      }
    } catch (e) {
    }
  }), [dataSourceConfig]);
  const reset = () => {
    setPagination((prevState) => Object.assign(Object.assign({}, prevState), { current: 1 }));
  };
  const refresh = () => {
    if (isSync) {
      concurRun(() => __awaiter(this, void 0, void 0, function* () {
        return yield getData(pagination.pageSize, pagination.current);
      }));
    } else {
      getData(pagination.pageSize, pagination.current);
    }
  };
  const handleColumns = (0, import_react4.useCallback)(function handleColumns2(columnArr) {
    return columnArr.map((column) => {
      if (import_lodash3.default.isObject(column) && !import_lodash3.default.isEmpty(column) && !import_lodash3.default.has(column, "children")) {
        return handleColumItem(column, {
          filterConfig: Object.assign(Object.assign({}, filterConfig), { filterValue: finalFilters }),
          tableData,
          onCell
        });
      }
      if (import_lodash3.default.isArray(column.children)) {
        column.children = handleColumns2(column.children);
      }
      return column;
    });
  }, [filterConfig, finalFilters, tableData, onCell]);
  const finalColumns = (0, import_react4.useMemo)(() => handleColumns(columns), [columns, handleColumns]);
  (0, import_react4.useEffect)(() => {
    callTypeRef.current = callType.dataSourceChange;
    if (pagination.current === 1) {
      refresh();
    } else {
      pageSizeRestTriggerRef.current = true;
      if (dataSourceConfig.jumpToFirst) {
        reset();
      } else {
        refresh();
      }
    }
  }, [dataSourceConfig]);
  useUpdateEffect_default(() => {
    if (isbackendPage.current || pageSizeRestTriggerRef.current) {
      if (pageSizeRestTriggerRef.current) {
        pageSizeRestTriggerRef.current = false;
      }
      callTypeRef.current = callType.paginationChange;
      refresh();
    }
  }, [pagination.pageSize, pagination.current]);
  const goPrev = () => {
    setPagination((prevState) => {
      var _a2;
      const current = (_a2 = prevState.current) !== null && _a2 !== void 0 ? _a2 : 1;
      if (current <= 1) {
        return prevState;
      }
      return Object.assign(Object.assign({}, prevState), { current: current - 1 });
    });
  };
  function refChangeFn(fn) {
    return (...rest2) => {
      callTypeRef.current = callType.refChange;
      if (typeof fn === "function") {
        return fn.apply(fn, rest2);
      }
    };
  }
  function deleteRowFromTableData(rowKeys) {
    if (import_lodash3.default.isUndefined(rowKeys) || Array.isArray(rowKeys) && rowKeys.length === 0) {
      return tableData;
    }
    const rowKeysArr = Array.isArray(rowKeys) ? rowKeys : [rowKeys];
    const filterData = tableData.filter((item) => !rowKeysArr.includes(getRowKey(item, rowKey)));
    changeTableData(filterData);
  }
  function addRow(record, addItemIndex) {
    const rowData = handleTableData([record], rowKey, childrenColumnName)[0];
    const keepDataSize = (data2) => {
      if (isbackendPage.current && data2.length > (pagination.pageSize || 10)) {
        data2.pop();
      }
      return data2;
    };
    if (addItemIndex !== void 0) {
      const [lastHead, lastTail] = [tableData.slice(0, addItemIndex), tableData.slice(addItemIndex)];
      const newData = [...lastHead, rowData, ...lastTail];
      changeTableData(keepDataSize(newData));
    } else if (isbackendPage.current || !showPagination) {
      const newData = [rowData].concat(tableData);
      changeTableData(keepDataSize(newData));
    } else {
      return addRow(record, (((pagination === null || pagination === void 0 ? void 0 : pagination.current) || 1) - 1) * (pagination.pageSize || 10));
    }
    return rowData;
  }
  function replaceRow(oldRecord, newRecord) {
    const resultData = tableData.map((row) => {
      const isSame = isSameTableData(row, oldRecord, rowKey);
      return isSame ? newRecord : row;
    });
    changeTableData(resultData);
  }
  function deleteRow(record) {
    const recordKey = getRowKey(record, rowKey);
    const row = findRow(recordKey);
    if (row) {
      deleteRowFromTableData(getRowKey(record, rowKey));
      if (showPagination && data.length % (pagination.pageSize || 10) === 1) {
        goPrev();
      }
    }
  }
  function batchDeleteRow(rowKeys) {
    deleteRowFromTableData(rowKeys);
  }
  function findRow(id) {
    return tableData.find((item) => getRowKey(item, rowKey) === id);
  }
  (0, import_react4.useImperativeHandle)(ref, () => ({
    reset,
    refresh: refChangeFn(refresh),
    goPrev,
    getData: () => tableData,
    getFinalData: () => data,
    addRow: refChangeFn(addRow),
    replaceRow,
    deleteRow,
    loading,
    setLoading,
    setFilterValue,
    setPagination,
    findRow,
    batchDeleteRow,
    getRootDomElement: () => {
      var _a2, _b;
      return (_b = (_a2 = tableRef.current) === null || _a2 === void 0 ? void 0 : _a2.getRootDomElement) === null || _b === void 0 ? void 0 : _b.call(_a2);
    }
  }));
  function tableOnChange(_page, sorter, filters, extra) {
    if (!isbackendPage.current) {
      switch (extra.action) {
        case "filter":
          setFilterValue(filters);
          break;
        case "sort":
          setSortValue(sorter);
          break;
        default:
          break;
      }
    }
  }
  function handleFilter2(filters = {}) {
    if (import_lodash3.default.isEmpty(filters)) {
      return tableData;
    }
    const items = filterTableListByFilterValue(tableData, filters, filterConfig);
    return items;
  }
  function handleSorter2(sorter, tableData2 = []) {
    var _a2;
    const { field, direction } = sorter;
    if (!direction) {
      return tableData2;
    }
    const data2 = tableData2.slice(mergeSorterConfig.ignoreRows);
    const fixedData = tableData2.slice(0, mergeSorterConfig.ignoreRows);
    const resData = ascendData(data2, field, (_a2 = mergeSorterConfig.sort) === null || _a2 === void 0 ? void 0 : _a2[field]);
    let finalData = [];
    if (direction === "ascend") {
      finalData = fixedData.concat(resData);
    } else {
      finalData = fixedData.concat(resData.reverse());
    }
    return finalData;
  }
  function handleOnchange(page, sorter, filters, extra) {
    var _a2;
    const { onChange } = page, restPage = __rest(page, ["onChange"]);
    if (typeof page.pageSize === "object") {
      return;
    }
    const p = Object.assign(Object.assign({}, pagination), restPage);
    (_a2 = rest.onChange) === null || _a2 === void 0 ? void 0 : _a2.call(rest, p, sorter, filters, extra);
    tableOnChange(p, sorter, filters, extra);
    setPagination(p);
  }
  return import_react4.default.createElement(
    import_react4.default.Fragment,
    null,
    import_react4.default.createElement(Table_default, Object.assign({ noDataElement: import_react4.default.createElement(Empty_default, { className: styleModule.emptyDescription, icon: import_react4.default.createElement(IconTableEmpty_default, null), description: "暂无数据" }) }, rest, { childrenColumnName, size, ref: tableRef, columns: finalColumns, data, style, className: [styleModule.table].concat(Array.isArray(className) ? className : [className || ""]), rowKey, loading: { loading, tip: loadingTip }, pagination: showPagination ? pagination : isbackendPage.current ? pagination : {
      pageSize: Infinity
    }, onChange: handleOnchange, renderPagination: (paginationNode) => {
      paginationNode = showPagination ? paginationNode : null;
      if (typeof renderPagination === "function") {
        return renderPagination(paginationNode);
      }
      return import_react4.default.createElement("div", { className: "arco-table-pagination" }, paginationNode);
    } })),
    scrollBar && scrollBarJsx
  );
}
var CommonTableForward = (0, import_react4.forwardRef)(CommonTable);
CommonTableForward.useScrollBar = useScrollbar_default;
var table_default = CommonTableForward;

// node_modules/@byted-babi/babi-design/es/TableBlock/columnSetting.js
var import_react6 = __toESM(require_react());

// node_modules/@byted-babi/babi-design/es/locale/zh-CN.js
var zhCN = {
  tableBlock: {
    dataSettingTitle: "数据指标",
    columnSettingModalTitle: "配置",
    columnSettingTitle: "定制列",
    dimensionSettingModalTitle: "聚合项",
    dimensionSettingQuestionOne: "（1）账单总数 < 15W, 支持任意聚合",
    dimensionSettingQuestionTwo: "（2）账单总数[15W, 300W], 不支持按服务树及customer聚合",
    dimensionSettingQuestionThree: "（3）账单总数 > 300W, 不支持全部聚合功能",
    dimensionSettingQuestionFour: "账单明细的最小构成维度是一个计费项，计费单元、售卖区域、结算周期唯一确定一个计费",
    dimensionSettingRadioTitle: "聚合维度",
    dimensionSettingInstance: "请注意：使用实例ID查询时，响应时间可能较长",
    fixedColumn: "冻结列"
  },
  exportButton: {
    title: "导出",
    getDataError: "获取数据失败，请重试。",
    getQueryError: "导出参数解析失败，请重试。",
    emptyDataError: "导出数据为空，无法下载",
    exportLoading: "正在导出，请稍后...",
    exportSuccess: "导出成功，立即跳转至",
    exportRecord: "导出记录",
    downloadFile: "下载文件",
    exportError: "导出失败，请重试"
  },
  common: {
    allCheck: "全选",
    others: "其他"
  },
  budget: {
    item: "计费项"
  }
};
var zh_CN_default = zhCN;

// node_modules/@byted-babi/babi-design/es/constants/context.js
var import_react5 = __toESM(require_react());
var ProviderContext = (0, import_react5.createContext)({});
var larkSheetUrlCheckReg = new RegExp(/^(https:\/\/(bytedance|dcar).(\S)*\/(sheets|wiki)\/)(\S+)(\?sheet=\S)?/);
var LarkSheetInfoReg = new RegExp(/^(https:\/\/(bytedance|dcar).(\S)*\/(sheets|wiki)\/)/g);

// node_modules/@byted-babi/babi-design/es/TableBlock/columnSetting.js
var import_lodash4 = __toESM(require_lodash());
var __awaiter2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var { Row, Col } = Grid_default;
var getColumns = (columns) => {
  if (!columns) {
    return [];
  }
  let list = [];
  columns.forEach((item) => {
    if (item.children && item.children.length) {
      list = list.concat(getColumns(item.children));
    } else {
      list.push(item);
    }
  });
  return list;
};
function getColumnConfigLabel(col) {
  return typeof col.title === "string" ? col.title : col.titleStr ? col.titleStr : col.settingKey;
}
var getCustomerKeys = (data) => {
  const customKeys = [];
  data.forEach((item) => {
    if (typeof item === "object") {
      if (Object.values(item)[0]) {
        customKeys.push(Object.keys(item)[0]);
      }
    } else if (typeof item === "string") {
      customKeys.push(item);
    }
  });
  return customKeys;
};
var getKeys = (obj) => Object.keys(obj)[0];
var ColumnSettings = (props) => {
  var _a, _b;
  const configContext = (0, import_react6.useContext)(ProviderContext);
  const { api, locale = zh_CN_default } = configContext;
  const GetDBCustom = (_a = api === null || api === void 0 ? void 0 : api.db) === null || _a === void 0 ? void 0 : _a.GetDBCustom;
  const SetDBCustom = (_b = api === null || api === void 0 ? void 0 : api.db) === null || _b === void 0 ? void 0 : _b.SetDBCustom;
  const { title = locale.tableBlock.columnSettingModalTitle, columns = [], style = {}, className, itemKey, onChange, canSelectAll = false, render, initValue, getPopupContainer } = props;
  const [customColumns, setCustomerColumns] = (0, import_react6.useState)(initValue !== null && initValue !== void 0 ? initValue : []);
  const [selectAll, setSellectAll] = (0, import_react6.useState)(false);
  const [visible, setVisible] = (0, import_react6.useState)(false);
  const [loading, setLoading] = (0, import_react6.useState)(false);
  const allColumns = getColumns(columns).filter((item) => item.settingKey);
  const objArray = allColumns.map((item) => {
    const obj = {};
    obj[item.settingKey] = true;
    return obj;
  });
  (0, import_react6.useEffect)(() => {
    const getData = () => __awaiter2(void 0, void 0, void 0, function* () {
      const dbKeys = (yield GetDBCustom === null || GetDBCustom === void 0 ? void 0 : GetDBCustom(itemKey)) || [];
      const isInit = import_lodash4.default.isEmpty(dbKeys);
      if (isInit && initValue) {
        setCustomerColumns(initValue);
        return;
      }
      dbKeys.forEach((item) => {
        if (typeof item === "object") {
          objArray.forEach((obj) => {
            if (getKeys(obj) === getKeys(item)) {
              const keys = getKeys(obj);
              obj[keys] = item[keys];
            }
          });
        } else if (typeof item === "string") {
          objArray.forEach((obj) => {
            if (getKeys(obj) === item) {
              obj[item] = true;
            }
          });
        }
      });
      const customerKeys = [];
      objArray.forEach((item) => {
        if (Object.values(item)[0]) {
          customerKeys.push(Object.keys(item)[0]);
        }
      });
      setCustomerColumns(customerKeys);
      yield SetDBCustom === null || SetDBCustom === void 0 ? void 0 : SetDBCustom(itemKey, objArray);
    });
    getData();
  }, [itemKey]);
  const showModal = () => {
    setVisible(true);
  };
  const handleOk = () => __awaiter2(void 0, void 0, void 0, function* () {
    setLoading(true);
    objArray.forEach((item) => {
      const keys = getKeys(item);
      if (customColumns.includes(keys)) {
        item[keys] = true;
      } else {
        item[keys] = false;
      }
    });
    yield SetDBCustom === null || SetDBCustom === void 0 ? void 0 : SetDBCustom(itemKey, objArray);
    const data = (yield GetDBCustom === null || GetDBCustom === void 0 ? void 0 : GetDBCustom(itemKey)) || [];
    const customKeys = getCustomerKeys(data);
    setCustomerColumns(customKeys);
    setLoading(false);
    setVisible(false);
  });
  const handleCancel = () => __awaiter2(void 0, void 0, void 0, function* () {
    const data = (yield GetDBCustom === null || GetDBCustom === void 0 ? void 0 : GetDBCustom(itemKey)) || [];
    const isInit = import_lodash4.default.isEmpty(data);
    const customKeys = isInit ? initValue !== null && initValue !== void 0 ? initValue : getCustomerKeys(data) : getCustomerKeys(data);
    setCustomerColumns(customKeys);
    setVisible(false);
  });
  const handleChange = (customKeys) => {
    setCustomerColumns(customKeys);
  };
  useUpdateEffect_default(() => {
    const filterColumns = (columns2) => columns2.map((item) => {
      if (item.settingKey || item.children) {
        if (customColumns.includes(item.settingKey)) {
          return item;
        }
        if (item.children && item.children.length) {
          return Object.assign(Object.assign({}, item), { children: filterColumns(item.children) });
        }
      } else {
        return item;
      }
    }).filter((x) => x);
    onChange(filterColumns(columns), customColumns, allColumns);
  }, [customColumns, columns]);
  const classNameWrapper = {};
  if (className) {
    classNameWrapper.className = className;
  }
  const checkboxOptions = (0, import_react6.useMemo)(() => getColumns(columns).filter((x) => x.settingKey).map((col) => ({
    label: getColumnConfigLabel(col),
    value: col.settingKey
  })), [columns]);
  (0, import_react6.useEffect)(() => {
    setSellectAll(customColumns.length === checkboxOptions.length);
  }, [customColumns, checkboxOptions]);
  const handleSelectAllChange = (checked) => {
    setCustomerColumns(checked ? checkboxOptions.map(({ value }) => value) : []);
    setSellectAll(checked);
  };
  const innerRender = () => {
    const props2 = {
      icon: import_react6.default.createElement(IconSettings_default, null),
      onClick: showModal,
      type: "secondary",
      size: "default"
    };
    if (typeof render === "function") {
      return render(props2);
    }
    return import_react6.default.createElement(
      Tooltip_default,
      { content: locale.tableBlock.columnSettingTitle },
      import_react6.default.createElement(Button_default, Object.assign({}, props2))
    );
  };
  return import_react6.default.createElement(
    "div",
    Object.assign({}, classNameWrapper, { style }),
    innerRender(),
    import_react6.default.createElement(
      Modal_default,
      { title, visible, onOk: handleOk, onCancel: handleCancel, confirmLoading: loading, getPopupContainer },
      canSelectAll && import_react6.default.createElement(
        "div",
        null,
        import_react6.default.createElement(Checkbox_default, { checked: selectAll, onChange: handleSelectAllChange }, "全选"),
        import_react6.default.createElement(Divider_default, { style: { marginTop: 5, marginBottom: 10 } })
      ),
      import_react6.default.createElement(
        Checkbox_default.Group,
        { value: customColumns, onChange: handleChange, style: { width: "100%" } },
        import_react6.default.createElement(Row, null, checkboxOptions.map(({ label, value }) => import_react6.default.createElement(
          Col,
          { span: 8, key: value, style: { marginBottom: 5 } },
          import_react6.default.createElement(Checkbox_default, { value, style: { whiteSpace: "nowrap" } }, label)
        )))
      )
    )
  );
};
var columnSetting_default = ColumnSettings;

// node_modules/@byted-babi/babi-design/es/TableBlock/dimensionSetting.js
var import_react7 = __toESM(require_react());
var { Row: Row2, Col: Col2 } = Grid_default;
var DimensionSetting = (props) => {
  const { locale = zh_CN_default } = (0, import_react7.useContext)(ProviderContext);
  const { title = locale.tableBlock.dimensionSettingModalTitle, options = [], values = [], className, style = {}, onChange } = props;
  const [visible, setVisible] = (0, import_react7.useState)(false);
  const [currentValues, setCurrentValues] = (0, import_react7.useState)([]);
  const showModal = () => {
    setCurrentValues(values);
    setVisible(true);
  };
  const handleOk = () => {
    onChange(currentValues);
    setVisible(false);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const onChangeAll = (checked) => {
    if (checked) {
      setCurrentValues(options.map((x) => x.value));
    } else {
      setCurrentValues([]);
    }
  };
  const wrapperClassName = {};
  if (className) {
    wrapperClassName.className = className;
  }
  return import_react7.default.createElement(
    "div",
    Object.assign({}, wrapperClassName, { style }),
    import_react7.default.createElement(
      Tooltip_default,
      { content: locale.tableBlock.dimensionSettingModalTitle },
      import_react7.default.createElement(Button_default, { icon: import_react7.default.createElement(IconSelectAll_default, null), onClick: showModal, type: "secondary", size: "default" })
    ),
    import_react7.default.createElement(
      Modal_default,
      { title, visible, onOk: handleOk, onCancel: handleCancel },
      import_react7.default.createElement(Checkbox_default, { onChange: onChangeAll, checked: Boolean(options.length) && currentValues.length === options.length, indeterminate: Boolean(currentValues.length) && currentValues.length !== options.length }, locale.common.allCheck),
      import_react7.default.createElement(Divider_default, { style: { margin: "5px 0" } }),
      import_react7.default.createElement(
        Checkbox_default.Group,
        { value: currentValues || values, onChange: setCurrentValues, style: { width: "100%" } },
        import_react7.default.createElement(Row2, null, options.map((x) => import_react7.default.createElement(
          Col2,
          { span: 8, key: x.value, style: { marginBottom: 5 } },
          import_react7.default.createElement(Checkbox_default, { value: x.value, style: { whiteSpace: "nowrap" } }, x.label === "计费项" ? import_react7.default.createElement(
            "span",
            null,
            locale.budget.item,
            import_react7.default.createElement(
              Popover_default,
              { content: locale.tableBlock.dimensionSettingQuestionFour, triggerProps: { showArrow: false } },
              import_react7.default.createElement(IconQuestionCircleFill_default, { style: {
                color: "#faad14",
                position: "relative",
                left: 5
              } })
            )
          ) : x.label)
        ))),
        currentValues.includes("instance") && import_react7.default.createElement(
          Row2,
          { style: {
            display: "flex",
            justifyContent: "center",
            marginTop: "20px"
          } },
          import_react7.default.createElement("span", { style: { color: "#f65d56" } }, locale.tableBlock.dimensionSettingInstance)
        )
      )
    )
  );
};
var dimensionSetting_default = DimensionSetting;

// node_modules/@byted-babi/babi-design/es/TableBlock/dimensionSettingRadio.js
var import_react8 = __toESM(require_react());
var { Item } = Form_default;
var RadioGroup = Radio_default.Group;
var DimensionSettingRadio = function(props, ref) {
  const { locale = zh_CN_default } = (0, import_react8.useContext)(ProviderContext);
  const { options = [], defaultValue, title = locale.tableBlock.dimensionSettingRadioTitle, onChange, columns = [] } = props;
  const [value, setValue] = (0, import_react8.useState)(defaultValue || "");
  function handleValueChange(value2) {
    setValue(value2);
  }
  (0, import_react8.useImperativeHandle)(ref, () => ({
    setValue
  }));
  (0, import_react8.useEffect)(() => {
    const resultColumns = formatDimensionColumn(columns, [value], options);
    onChange && onChange(value, resultColumns);
  }, [value, columns]);
  return import_react8.default.createElement(
    "div",
    null,
    import_react8.default.createElement(
      Item,
      { layout: "inline", colon: true, label: title },
      import_react8.default.createElement(RadioGroup, { onChange: handleValueChange, value, options })
    )
  );
};
var DimensionSettingRadioForward = (0, import_react8.forwardRef)(DimensionSettingRadio);
var dimensionSettingRadio_default = DimensionSettingRadioForward;

// node_modules/@byted-babi/babi-design/es/TableBlock/columnDataSetting.js
var import_react9 = __toESM(require_react());
var import_lodash5 = __toESM(require_lodash());
var { Item: Item2 } = Form_default;
var CheckboxGroup = Checkbox_default.Group;
var ColumnDataSetting = function(props, ref) {
  const { locale = zh_CN_default } = (0, import_react9.useContext)(ProviderContext);
  const { options = [], defaultValue, title = locale.tableBlock.dataSettingTitle, onChange, columns = [] } = props;
  const [value, setValue] = (0, import_react9.useState)(defaultValue || []);
  function handleValueChange(value2) {
    setValue(value2);
  }
  (0, import_react9.useImperativeHandle)(ref, () => ({
    setValue
  }));
  function handleColumns(columnArr) {
    const resultColumns = columnArr.map((item) => {
      var _a, _b;
      let column = Object.assign({}, item);
      if (import_lodash5.default.has(column, "settingDimensionKey")) {
        if (!(value === null || value === void 0 ? void 0 : value.includes(column.settingDimensionKey))) {
          column = {};
          return column;
        }
      }
      if (import_lodash5.default.has(column, "children") && ((_a = column.children) === null || _a === void 0 ? void 0 : _a.length) && ((_b = column === null || column === void 0 ? void 0 : column.children) === null || _b === void 0 ? void 0 : _b.some((child) => !import_lodash5.default.isEmpty(child)))) {
        const children = column.children;
        column.children = handleColumns(children);
        if (column.children.every((child) => import_lodash5.default.isEmpty(child)) || import_lodash5.default.isEmpty(column.children)) {
          column = {};
        }
      }
      return column;
    });
    return resultColumns.filter((column) => !import_lodash5.default.isEmpty(column));
  }
  (0, import_react9.useEffect)(() => {
    const resultColumns = handleColumns(columns);
    onChange && onChange(resultColumns, value);
  }, [value, columns]);
  return import_react9.default.createElement(
    "div",
    null,
    import_react9.default.createElement(
      Item2,
      { layout: "inline", colon: true, label: title },
      import_react9.default.createElement(CheckboxGroup, { onChange: handleValueChange, value, options })
    )
  );
};
var ColumnDataSettingForward = (0, import_react9.forwardRef)(ColumnDataSetting);
var columnDataSetting_default = ColumnDataSettingForward;

// node_modules/@byted-babi/babi-design/es/TableBlock/editTable/allEditTable.js
var import_react11 = __toESM(require_react());
var import_lodash6 = __toESM(require_lodash());

// node_modules/@byted-babi/babi-design/es/TableBlock/editTable/constants.js
var import_react10 = __toESM(require_react());
var SingleEditTableContext = (0, import_react10.createContext)({});
var allEditDefaultOperateConfig = {
  operateNode: (_rowData, isEdit, onDelete) => import_react10.default.createElement(import_react10.default.Fragment, null, onDelete && import_react10.default.createElement(Button_default, { type: "text", status: "danger", disabled: !isEdit, onClick: onDelete }, "删除")),
  operateDataIndex: "Operate"
};
var singleEditDefaultOperateConfig = {
  operateNode: (_rowData, extra, handleFn) => {
    const { hasEdit, isEditCurrentRow } = extra;
    const { onEdit, onSave, onCancel, onDelete } = handleFn;
    if (isEditCurrentRow) {
      return import_react10.default.createElement(
        "div",
        null,
        onSave && import_react10.default.createElement(Button_default, { onClick: onSave, style: { marginRight: 10 }, type: "text" }, "保存"),
        onCancel && import_react10.default.createElement(Button_default, { onClick: onCancel, type: "text" }, "取消")
      );
    }
    return import_react10.default.createElement(
      "div",
      null,
      onEdit && import_react10.default.createElement(Button_default, { onClick: onEdit, type: "text", style: { marginRight: 10 }, disabled: hasEdit }, "编辑"),
      onDelete && import_react10.default.createElement(
        Popconfirm_default,
        { onOk: onDelete, disabled: hasEdit, title: "请确认是否删除该条配置" },
        import_react10.default.createElement(Button_default, { type: "text", status: "danger", disabled: hasEdit }, "删除")
      )
    );
  },
  operateDataIndex: "Operate"
};

// node_modules/@byted-babi/babi-design/es/TableBlock/editTable/allEditTable.js
var __rest2 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s); i2 < p.length; i2++) {
      if (e.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i2]))
        t[p[i2]] = s[p[i2]];
    }
  return t;
};
var { Item: Item3 } = Form_default;
var AllEditTable = function(props, ref) {
  const { isEdit, operateConfig, editConfig, onDelete, formProps, dataSource, context } = props, rest = __rest2(props, ["isEdit", "operateConfig", "editConfig", "onDelete", "formProps", "dataSource", "context"]);
  const { form } = formProps;
  const onCell = (0, import_react11.useCallback)(() => ({
    form,
    onDelete: onDelete || ref && ref.current.deleteRow,
    editConfig,
    operateConfig,
    isEdit,
    context
  }), [onDelete, editConfig, operateConfig, form, isEdit, ref, context]);
  function resetValue() {
    const keys = Object.keys(form.getFields());
    form.setFields(Object.assign({}, keys.reduce((pre, cur) => Object.assign(Object.assign({}, pre), { [cur]: {
      value: void 0
    } }), {})));
  }
  (0, import_react11.useEffect)(() => {
    !isEdit && resetValue();
  }, [isEdit]);
  return import_react11.default.createElement(
    Form_default,
    Object.assign({ wrapperCol: { span: 24 }, labelCol: { span: 0 } }, formProps),
    import_react11.default.createElement(table_default, Object.assign({ ref, components: {
      body: {
        cell: EditCell
      }
    }, dataSource, onCell }, rest))
  );
};
function EditCell(props) {
  const { rowData, column, children, form, onDelete, editConfig, operateConfig, isEdit, context } = props;
  const mergeOperateConfig = mergeProps(allEditDefaultOperateConfig, operateConfig);
  const { operateDataIndex, operateNode } = mergeOperateConfig;
  const { dataIndex } = column;
  const { ID } = rowData;
  const _children = import_lodash6.default.isUndefined(children) ? null : children;
  const deleteRow = (0, import_react11.useMemo)(() => onDelete ? () => onDelete(rowData) : onDelete, [onDelete, rowData]);
  if (dataIndex === operateDataIndex) {
    return typeof operateNode === "function" ? operateNode(rowData, isEdit, deleteRow) : operateNode;
  }
  if (isEdit) {
    if (editConfig[dataIndex]) {
      const getConfig = editConfig[dataIndex];
      const childrenConfig = getConfig(rowData, form, context) || {};
      return import_react11.default.createElement(Item3, Object.assign({ field: `${ID}.${dataIndex}`, style: { marginTop: 20 }, initialValue: rowData[dataIndex] }, childrenConfig.props), childrenConfig.children);
    }
    return _children;
  }
  return _children;
}
var allEditTable_default = (0, import_react11.forwardRef)(AllEditTable);

// node_modules/@byted-babi/babi-design/es/TableBlock/editTable/singleEditTable.js
var import_react13 = __toESM(require_react());
var import_lodash8 = __toESM(require_lodash());

// node_modules/@byted-babi/babi-design/es/TableBlock/hook/useEditTableConfig.js
var import_lodash7 = __toESM(require_lodash());
var import_react12 = __toESM(require_react());
var __awaiter3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var useEditTableConfig = (tableRef, options) => {
  const { saveApiFn, delApiFn, createRow } = options;
  const [editInfo, setEditInfo] = (0, import_react12.useState)({});
  function onEdit(rowData, form) {
    (form === null || form === void 0 ? void 0 : form.resetFields) && form.resetFields();
    setEditInfo({
      data: rowData,
      form,
      isCreate: false
    });
  }
  (0, import_react12.useEffect)(() => {
    if (editInfo.data) {
      editInfo.form && editInfo.form.resetFields();
    }
  }, [editInfo]);
  function onSave(rowData, form, ctx) {
    var _a, _b, _c;
    return __awaiter3(this, void 0, void 0, function* () {
      try {
        const data = yield form.validate();
        (_a = tableRef.current) === null || _a === void 0 ? void 0 : _a.setLoading(true);
        if (typeof saveApiFn === "function") {
          yield saveApiFn(data, Object.assign(Object.assign({}, editInfo), { form, data: rowData }), ctx);
        }
        setEditInfo({});
        (_b = tableRef.current) === null || _b === void 0 ? void 0 : _b.refresh();
      } catch (e) {
        (_c = tableRef.current) === null || _c === void 0 ? void 0 : _c.setLoading(false);
      }
    });
  }
  function onCancel(isRefreshForCreate = true) {
    var _a, _b;
    !import_lodash7.default.isEmpty(editInfo) && setEditInfo({});
    if (import_lodash7.default.isEmpty(editInfo) || import_lodash7.default.isEmpty(editInfo.data)) {
      return;
    }
    if (editInfo.isCreate) {
      (_a = tableRef.current) === null || _a === void 0 ? void 0 : _a.deleteRow(editInfo.data || {});
      isRefreshForCreate && ((_b = tableRef.current) === null || _b === void 0 ? void 0 : _b.refresh());
    } else {
    }
  }
  function onAdd(newRecord, addItemIndex) {
    var _a;
    const newRow = newRecord || createRow || {};
    const data = (_a = tableRef.current) === null || _a === void 0 ? void 0 : _a.addRow(newRow, addItemIndex);
    setEditInfo({
      data,
      isCreate: true
    });
  }
  function onDelete(rowData, ctx) {
    var _a, _b, _c, _d;
    return __awaiter3(this, void 0, void 0, function* () {
      try {
        (_a = tableRef.current) === null || _a === void 0 ? void 0 : _a.setLoading(true);
        if (typeof delApiFn === "function") {
          yield delApiFn(rowData, ctx);
        }
        (_b = tableRef.current) === null || _b === void 0 ? void 0 : _b.deleteRow(rowData);
        (_c = tableRef.current) === null || _c === void 0 ? void 0 : _c.refresh();
      } catch (e) {
        (_d = tableRef.current) === null || _d === void 0 ? void 0 : _d.setLoading(false);
      }
    });
  }
  return {
    editInfo,
    setEditInfo,
    onEdit,
    onSave,
    onCancel,
    onAdd,
    onDelete
  };
};
var useEditTableConfig_default = useEditTableConfig;

// node_modules/@byted-babi/babi-design/es/TableBlock/editTable/singleEditTable.js
var __rest3 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s); i2 < p.length; i2++) {
      if (e.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i2]))
        t[p[i2]] = s[p[i2]];
    }
  return t;
};
var { Item: Item4, useForm } = Form_default;
var SingleEditTable = function(props, ref) {
  const { editConfig, operateConfig, editInfo, onEdit, onSave, onCancel, onDelete, onChange, context, rowKey = defaultRowKey, components: componentsProp, formProps, onFormValuesChange, initRowState } = props, rest = __rest3(props, ["editConfig", "operateConfig", "editInfo", "onEdit", "onSave", "onCancel", "onDelete", "onChange", "context", "rowKey", "components", "formProps", "onFormValuesChange", "initRowState"]);
  const onCell = (0, import_react13.useCallback)(() => ({
    editConfig,
    operateConfig,
    editInfo,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    rowKey,
    context: Object.assign(Object.assign({}, context), { editInfo })
  }), [editConfig, operateConfig, editInfo, onEdit, onSave, onCancel, onDelete, rowKey, context]);
  const components = (0, import_react13.useMemo)(() => Object.assign(Object.assign({}, componentsProp), { body: Object.assign(Object.assign({}, componentsProp === null || componentsProp === void 0 ? void 0 : componentsProp.body), { row: EditableRow, cell: EditableCell }) }), [componentsProp]);
  const onRow = () => ({ formProps, onFormValuesChange, initRowState });
  return import_react13.default.createElement(table_default, Object.assign({ ref, components, onCell, onRow, rowKey, onChange: (p, s, f2, e) => {
    onCancel && onCancel(true);
    onChange && onChange(p, s, f2, e);
  } }, rest));
};
function EditableRow(props) {
  const { children, className, record, initRowState, formProps, onFormValuesChange } = props, rest = __rest3(props, ["children", "className", "record", "initRowState", "formProps", "onFormValuesChange"]);
  const [form] = useForm();
  const initValue = typeof initRowState === "function" ? initRowState(record) : initRowState ? initRowState : {};
  const [rowState, setRowState] = (0, import_react13.useState)(initValue);
  return import_react13.default.createElement(
    SingleEditTableContext.Provider,
    { value: {
      form,
      rowState,
      setRowState
    } },
    import_react13.default.createElement(Form_default, Object.assign({ style: { display: "table-row" }, form, wrapper: "tr", wrapperProps: rest, className: `${className} editable-row`, wrapperCol: { span: 24 }, labelCol: { span: 0 }, onValuesChange: (value, values) => onFormValuesChange === null || onFormValuesChange === void 0 ? void 0 : onFormValuesChange(value, values, form) }, typeof formProps === "function" ? formProps(record) : formProps !== null && formProps !== void 0 ? formProps : {}), children)
  );
}
function EditableCell(props) {
  const { rowData, column, children, editConfig, operateConfig, editInfo, onEdit, onSave, onCancel, onDelete, rowKey, context } = props;
  const ctx = (0, import_react13.useContext)(SingleEditTableContext);
  const { form } = ctx;
  const { dataIndex } = column;
  const isEditCurrentRow = isSameTableData(editInfo.data, rowData, rowKey);
  const mergeOperateConfig = mergeProps(singleEditDefaultOperateConfig, operateConfig);
  const { operateDataIndex, operateNode } = mergeOperateConfig;
  const ctxProps = (0, import_react13.useMemo)(() => {
    return {
      context,
      rowCtx: ctx
    };
  }, [context, ctx]);
  const handleFn = (0, import_react13.useMemo)(() => ({
    onEdit: () => onEdit(rowData, form, ctxProps),
    onSave: () => onSave(rowData, form, ctxProps),
    onCancel: () => onCancel(true, ctxProps),
    onDelete: () => onDelete(rowData, ctxProps)
  }), [onEdit, onSave, onCancel, onDelete, rowData, form, ctxProps]);
  const _children = import_lodash8.default.isUndefined(children) ? null : children;
  function handleChildren(isEditCurrentRow2, hasEdit) {
    if (dataIndex === operateDataIndex) {
      return typeof operateNode === "function" ? operateNode(rowData, {
        hasEdit,
        isEditCurrentRow: isEditCurrentRow2,
        form
      }, handleFn, ctxProps) : operateNode;
    }
    if (editConfig[dataIndex]) {
      if (isEditCurrentRow2) {
        const getConfig = editConfig[dataIndex];
        const childrenConfig = getConfig(rowData, form, ctxProps) || {};
        const { extra } = childrenConfig;
        const { onlyCreate } = extra || {};
        const editCom = import_react13.default.createElement(Item4, Object.assign({ field: dataIndex, style: { marginTop: 20 }, initialValue: rowData[dataIndex] }, childrenConfig.props), childrenConfig.children);
        return onlyCreate ? editInfo.isCreate ? editCom : _children : editCom;
      }
      return _children;
    }
    return _children;
  }
  return handleChildren(isEditCurrentRow, !import_lodash8.default.isEmpty(editInfo.data));
}
var forwardComponent = (0, import_react13.forwardRef)(SingleEditTable);
var SingleEditTableComponent = forwardComponent;
SingleEditTableComponent.useEditTableConfig = useEditTableConfig_default;
var singleEditTable_default = SingleEditTableComponent;

// node_modules/@byted-babi/babi-design/es/TableBlock/fixedSetting.js
var import_react14 = __toESM(require_react());
var CheckboxGroup2 = Checkbox_default.Group;
var useCheckbox2 = Checkbox_default.useCheckbox;
var { Row: Row3, Col: Col3 } = Grid_default;
var FixedSetting = function(props, ref) {
  const { locale = zh_CN_default } = (0, import_react14.useContext)(ProviderContext);
  const { customTriggerRender, title = locale.tableBlock.fixedColumn, initValue, columns, onChange, customGroupRender } = props;
  const [visible, setVisible] = (0, import_react14.useState)(false);
  const [refresh, setRefresh] = (0, import_react14.useState)(false);
  const allEnableFixedColumns = (0, import_react14.useMemo)(() => {
    return getColumns(columns).filter((item) => item.fixedConfig);
  }, [columns]);
  const options = (0, import_react14.useMemo)(() => {
    return allEnableFixedColumns.map((item) => ({
      label: getColumnConfigLabel(item),
      value: item.dataIndex
    }));
  }, [allEnableFixedColumns]);
  const selectWrapper = useCheckbox2(options.map((x) => x.value), initValue);
  const { selected, setSelected, selectAll, unSelectAll, isAllSelected, isPartialSelected } = selectWrapper;
  (0, import_react14.useImperativeHandle)(ref, () => ({
    selectWrapper
  }));
  const showModal = () => {
    setVisible(true);
  };
  function handleOk() {
    setVisible(false);
    setRefresh(!refresh);
  }
  function handleCancel() {
    setVisible(false);
  }
  function getColumnBySelected(column, value) {
    return column.map((item) => {
      if (item.children) {
        return Object.assign(Object.assign({}, item), { children: getColumnBySelected(item.children, value) });
      } else {
        if (value.includes(item.dataIndex)) {
          return Object.assign(Object.assign({}, item), { fixed: "left" });
        } else {
          const isConfigColumn = options.find((x) => x.value === item.dataIndex);
          return Object.assign(Object.assign({}, item), { fixed: isConfigColumn ? void 0 : item.fixed });
        }
      }
    });
  }
  (0, import_react14.useEffect)(() => {
    const resColumn = getColumnBySelected(columns, selected);
    onChange(resColumn);
  }, [columns, refresh]);
  const triggerRender = () => {
    const props2 = {
      icon: import_react14.default.createElement(IconFreezeFirstColumn_default, null),
      onClick: showModal,
      type: "secondary",
      size: "default"
    };
    if (typeof customTriggerRender === "function") {
      return customTriggerRender(props2);
    }
    return import_react14.default.createElement(
      Tooltip_default,
      { content: locale.tableBlock.fixedColumn },
      import_react14.default.createElement(Button_default, Object.assign({}, props2))
    );
  };
  function groupRender() {
    if (typeof customGroupRender === "function") {
      return customGroupRender({
        selectWrapper,
        options,
        allEnableFixedColumns
      });
    }
    return import_react14.default.createElement(
      CheckboxGroup2,
      { value: selected, onChange: setSelected, style: { width: "100%" } },
      import_react14.default.createElement(Row3, null, options.map((x) => import_react14.default.createElement(
        Col3,
        { span: 8, key: x.value, style: { marginBottom: 5 } },
        import_react14.default.createElement(Checkbox_default, { value: x.value, style: { whiteSpace: "nowrap" } }, x.label)
      )))
    );
  }
  return import_react14.default.createElement(
    "div",
    null,
    triggerRender(),
    import_react14.default.createElement(
      Modal_default,
      { title, visible, onOk: handleOk, onCancel: handleCancel },
      import_react14.default.createElement(Checkbox_default, { onChange: (checked) => {
        if (checked) {
          selectAll();
        } else {
          unSelectAll();
        }
      }, checked: isAllSelected(), indeterminate: isPartialSelected() }, locale.common.allCheck),
      import_react14.default.createElement(Divider_default, { style: { margin: "5px 0" } }),
      groupRender()
    )
  );
};
var fixedSetting_default = (0, import_react14.forwardRef)(FixedSetting);

// node_modules/@byted-babi/babi-design/es/TableBlock/index.js
var TableBlockComponent = {
  Table: table_default,
  ColumnSetting: columnSetting_default,
  DimensionSetting: dimensionSetting_default,
  DimensionSettingRadio: dimensionSettingRadio_default,
  ColumnDataSetting: columnDataSetting_default,
  AllEditTable: allEditTable_default,
  SingleEditTable: singleEditTable_default,
  FixedSetting: fixedSetting_default
};
var TableBlock_default = TableBlockComponent;
export {
  TableBlock_default as default
};
//# sourceMappingURL=@byted-babi_babi-design_es_TableBlock.js.map
