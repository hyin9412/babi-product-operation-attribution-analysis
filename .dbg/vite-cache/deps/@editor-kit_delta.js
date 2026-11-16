import {
  __commonJS,
  __toESM
} from "./chunk-SAS5OB7F.js";

// node_modules/fast-diff/diff.js
var require_diff = __commonJS({
  "node_modules/fast-diff/diff.js"(exports, module) {
    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;
    function diff_main(text1, text2, cursor_pos, _fix_unicode) {
      if (text1 === text2) {
        if (text1) {
          return [[DIFF_EQUAL, text1]];
        }
        return [];
      }
      if (cursor_pos != null) {
        var editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
        if (editdiff) {
          return editdiff;
        }
      }
      var commonlength = diff_commonPrefix(text1, text2);
      var commonprefix = text1.substring(0, commonlength);
      text1 = text1.substring(commonlength);
      text2 = text2.substring(commonlength);
      commonlength = diff_commonSuffix(text1, text2);
      var commonsuffix = text1.substring(text1.length - commonlength);
      text1 = text1.substring(0, text1.length - commonlength);
      text2 = text2.substring(0, text2.length - commonlength);
      var diffs = diff_compute_(text1, text2);
      if (commonprefix) {
        diffs.unshift([DIFF_EQUAL, commonprefix]);
      }
      if (commonsuffix) {
        diffs.push([DIFF_EQUAL, commonsuffix]);
      }
      diff_cleanupMerge(diffs, _fix_unicode);
      return diffs;
    }
    function diff_compute_(text1, text2) {
      var diffs;
      if (!text1) {
        return [[DIFF_INSERT, text2]];
      }
      if (!text2) {
        return [[DIFF_DELETE, text1]];
      }
      var longtext = text1.length > text2.length ? text1 : text2;
      var shorttext = text1.length > text2.length ? text2 : text1;
      var i = longtext.indexOf(shorttext);
      if (i !== -1) {
        diffs = [
          [DIFF_INSERT, longtext.substring(0, i)],
          [DIFF_EQUAL, shorttext],
          [DIFF_INSERT, longtext.substring(i + shorttext.length)]
        ];
        if (text1.length > text2.length) {
          diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }
        return diffs;
      }
      if (shorttext.length === 1) {
        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
      }
      var hm = diff_halfMatch_(text1, text2);
      if (hm) {
        var text1_a = hm[0];
        var text1_b = hm[1];
        var text2_a = hm[2];
        var text2_b = hm[3];
        var mid_common = hm[4];
        var diffs_a = diff_main(text1_a, text2_a);
        var diffs_b = diff_main(text1_b, text2_b);
        return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
      }
      return diff_bisect_(text1, text2);
    }
    function diff_bisect_(text1, text2) {
      var text1_length = text1.length;
      var text2_length = text2.length;
      var max_d = Math.ceil((text1_length + text2_length) / 2);
      var v_offset = max_d;
      var v_length = 2 * max_d;
      var v1 = new Array(v_length);
      var v2 = new Array(v_length);
      for (var x = 0; x < v_length; x++) {
        v1[x] = -1;
        v2[x] = -1;
      }
      v1[v_offset + 1] = 0;
      v2[v_offset + 1] = 0;
      var delta = text1_length - text2_length;
      var front = delta % 2 !== 0;
      var k1start = 0;
      var k1end = 0;
      var k2start = 0;
      var k2end = 0;
      for (var d = 0; d < max_d; d++) {
        for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
          var k1_offset = v_offset + k1;
          var x1;
          if (k1 === -d || k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
            x1 = v1[k1_offset + 1];
          } else {
            x1 = v1[k1_offset - 1] + 1;
          }
          var y1 = x1 - k1;
          while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) === text2.charAt(y1)) {
            x1++;
            y1++;
          }
          v1[k1_offset] = x1;
          if (x1 > text1_length) {
            k1end += 2;
          } else if (y1 > text2_length) {
            k1start += 2;
          } else if (front) {
            var k2_offset = v_offset + delta - k1;
            if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
              var x2 = text1_length - v2[k2_offset];
              if (x1 >= x2) {
                return diff_bisectSplit_(text1, text2, x1, y1);
              }
            }
          }
        }
        for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
          var k2_offset = v_offset + k2;
          var x2;
          if (k2 === -d || k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
            x2 = v2[k2_offset + 1];
          } else {
            x2 = v2[k2_offset - 1] + 1;
          }
          var y2 = x2 - k2;
          while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) === text2.charAt(text2_length - y2 - 1)) {
            x2++;
            y2++;
          }
          v2[k2_offset] = x2;
          if (x2 > text1_length) {
            k2end += 2;
          } else if (y2 > text2_length) {
            k2start += 2;
          } else if (!front) {
            var k1_offset = v_offset + delta - k2;
            if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
              var x1 = v1[k1_offset];
              var y1 = v_offset + x1 - k1_offset;
              x2 = text1_length - x2;
              if (x1 >= x2) {
                return diff_bisectSplit_(text1, text2, x1, y1);
              }
            }
          }
        }
      }
      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    }
    function diff_bisectSplit_(text1, text2, x, y) {
      var text1a = text1.substring(0, x);
      var text2a = text2.substring(0, y);
      var text1b = text1.substring(x);
      var text2b = text2.substring(y);
      var diffs = diff_main(text1a, text2a);
      var diffsb = diff_main(text1b, text2b);
      return diffs.concat(diffsb);
    }
    function diff_commonPrefix(text1, text2) {
      if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
        return 0;
      }
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text2.length);
      var pointermid = pointermax;
      var pointerstart = 0;
      while (pointermin < pointermid) {
        if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
          pointermin = pointermid;
          pointerstart = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) {
        pointermid--;
      }
      return pointermid;
    }
    function diff_commonSuffix(text1, text2) {
      if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) {
        return 0;
      }
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text2.length);
      var pointermid = pointermax;
      var pointerend = 0;
      while (pointermin < pointermid) {
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
          pointermin = pointermid;
          pointerend = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) {
        pointermid--;
      }
      return pointermid;
    }
    function diff_halfMatch_(text1, text2) {
      var longtext = text1.length > text2.length ? text1 : text2;
      var shorttext = text1.length > text2.length ? text2 : text1;
      if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null;
      }
      function diff_halfMatchI_(longtext2, shorttext2, i) {
        var seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4));
        var j = -1;
        var best_common = "";
        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
        while ((j = shorttext2.indexOf(seed, j + 1)) !== -1) {
          var prefixLength = diff_commonPrefix(
            longtext2.substring(i),
            shorttext2.substring(j)
          );
          var suffixLength = diff_commonSuffix(
            longtext2.substring(0, i),
            shorttext2.substring(0, j)
          );
          if (best_common.length < suffixLength + prefixLength) {
            best_common = shorttext2.substring(
              j - suffixLength,
              j
            ) + shorttext2.substring(j, j + prefixLength);
            best_longtext_a = longtext2.substring(0, i - suffixLength);
            best_longtext_b = longtext2.substring(i + prefixLength);
            best_shorttext_a = shorttext2.substring(0, j - suffixLength);
            best_shorttext_b = shorttext2.substring(j + prefixLength);
          }
        }
        if (best_common.length * 2 >= longtext2.length) {
          return [
            best_longtext_a,
            best_longtext_b,
            best_shorttext_a,
            best_shorttext_b,
            best_common
          ];
        } else {
          return null;
        }
      }
      var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
      var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
      var hm;
      if (!hm1 && !hm2) {
        return null;
      } else if (!hm2) {
        hm = hm1;
      } else if (!hm1) {
        hm = hm2;
      } else {
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
      }
      var text1_a, text1_b, text2_a, text2_b;
      if (text1.length > text2.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
      } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
      }
      var mid_common = hm[4];
      return [text1_a, text1_b, text2_a, text2_b, mid_common];
    }
    function diff_cleanupMerge(diffs, fix_unicode) {
      diffs.push([DIFF_EQUAL, ""]);
      var pointer = 0;
      var count_delete = 0;
      var count_insert = 0;
      var text_delete = "";
      var text_insert = "";
      var commonlength;
      while (pointer < diffs.length) {
        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
          diffs.splice(pointer, 1);
          continue;
        }
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            count_insert++;
            text_insert += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_DELETE:
            count_delete++;
            text_delete += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_EQUAL:
            var previous_equality = pointer - count_insert - count_delete - 1;
            if (fix_unicode) {
              if (previous_equality >= 0 && ends_with_pair_start(diffs[previous_equality][1])) {
                var stray = diffs[previous_equality][1].slice(-1);
                diffs[previous_equality][1] = diffs[previous_equality][1].slice(0, -1);
                text_delete = stray + text_delete;
                text_insert = stray + text_insert;
                if (!diffs[previous_equality][1]) {
                  diffs.splice(previous_equality, 1);
                  pointer--;
                  var k = previous_equality - 1;
                  if (diffs[k] && diffs[k][0] === DIFF_INSERT) {
                    count_insert++;
                    text_insert = diffs[k][1] + text_insert;
                    k--;
                  }
                  if (diffs[k] && diffs[k][0] === DIFF_DELETE) {
                    count_delete++;
                    text_delete = diffs[k][1] + text_delete;
                    k--;
                  }
                  previous_equality = k;
                }
              }
              if (starts_with_pair_end(diffs[pointer][1])) {
                var stray = diffs[pointer][1].charAt(0);
                diffs[pointer][1] = diffs[pointer][1].slice(1);
                text_delete += stray;
                text_insert += stray;
              }
            }
            if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
              diffs.splice(pointer, 1);
              break;
            }
            if (text_delete.length > 0 || text_insert.length > 0) {
              if (text_delete.length > 0 && text_insert.length > 0) {
                commonlength = diff_commonPrefix(text_insert, text_delete);
                if (commonlength !== 0) {
                  if (previous_equality >= 0) {
                    diffs[previous_equality][1] += text_insert.substring(0, commonlength);
                  } else {
                    diffs.splice(0, 0, [DIFF_EQUAL, text_insert.substring(0, commonlength)]);
                    pointer++;
                  }
                  text_insert = text_insert.substring(commonlength);
                  text_delete = text_delete.substring(commonlength);
                }
                commonlength = diff_commonSuffix(text_insert, text_delete);
                if (commonlength !== 0) {
                  diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                  text_insert = text_insert.substring(0, text_insert.length - commonlength);
                  text_delete = text_delete.substring(0, text_delete.length - commonlength);
                }
              }
              var n = count_insert + count_delete;
              if (text_delete.length === 0 && text_insert.length === 0) {
                diffs.splice(pointer - n, n);
                pointer = pointer - n;
              } else if (text_delete.length === 0) {
                diffs.splice(pointer - n, n, [DIFF_INSERT, text_insert]);
                pointer = pointer - n + 1;
              } else if (text_insert.length === 0) {
                diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete]);
                pointer = pointer - n + 1;
              } else {
                diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete], [DIFF_INSERT, text_insert]);
                pointer = pointer - n + 2;
              }
            }
            if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
              diffs[pointer - 1][1] += diffs[pointer][1];
              diffs.splice(pointer, 1);
            } else {
              pointer++;
            }
            count_insert = 0;
            count_delete = 0;
            text_delete = "";
            text_insert = "";
            break;
        }
      }
      if (diffs[diffs.length - 1][1] === "") {
        diffs.pop();
      }
      var changes = false;
      pointer = 1;
      while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
          if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) === diffs[pointer - 1][1]) {
            diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
            diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
            diffs.splice(pointer - 1, 1);
            changes = true;
          } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
            diffs[pointer - 1][1] += diffs[pointer + 1][1];
            diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
            diffs.splice(pointer + 1, 1);
            changes = true;
          }
        }
        pointer++;
      }
      if (changes) {
        diff_cleanupMerge(diffs, fix_unicode);
      }
    }
    function is_surrogate_pair_start(charCode) {
      return charCode >= 55296 && charCode <= 56319;
    }
    function is_surrogate_pair_end(charCode) {
      return charCode >= 56320 && charCode <= 57343;
    }
    function starts_with_pair_end(str) {
      return is_surrogate_pair_end(str.charCodeAt(0));
    }
    function ends_with_pair_start(str) {
      return is_surrogate_pair_start(str.charCodeAt(str.length - 1));
    }
    function remove_empty_tuples(tuples) {
      var ret = [];
      for (var i = 0; i < tuples.length; i++) {
        if (tuples[i][1].length > 0) {
          ret.push(tuples[i]);
        }
      }
      return ret;
    }
    function make_edit_splice(before, oldMiddle, newMiddle, after) {
      if (ends_with_pair_start(before) || starts_with_pair_end(after)) {
        return null;
      }
      return remove_empty_tuples([
        [DIFF_EQUAL, before],
        [DIFF_DELETE, oldMiddle],
        [DIFF_INSERT, newMiddle],
        [DIFF_EQUAL, after]
      ]);
    }
    function find_cursor_edit_diff(oldText, newText, cursor_pos) {
      var oldRange = typeof cursor_pos === "number" ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
      var newRange = typeof cursor_pos === "number" ? null : cursor_pos.newRange;
      var oldLength = oldText.length;
      var newLength = newText.length;
      if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
        var oldCursor = oldRange.index;
        var oldBefore = oldText.slice(0, oldCursor);
        var oldAfter = oldText.slice(oldCursor);
        var maybeNewCursor = newRange ? newRange.index : null;
        editBefore: {
          var newCursor = oldCursor + newLength - oldLength;
          if (maybeNewCursor !== null && maybeNewCursor !== newCursor) {
            break editBefore;
          }
          if (newCursor < 0 || newCursor > newLength) {
            break editBefore;
          }
          var newBefore = newText.slice(0, newCursor);
          var newAfter = newText.slice(newCursor);
          if (newAfter !== oldAfter) {
            break editBefore;
          }
          var prefixLength = Math.min(oldCursor, newCursor);
          var oldPrefix = oldBefore.slice(0, prefixLength);
          var newPrefix = newBefore.slice(0, prefixLength);
          if (oldPrefix !== newPrefix) {
            break editBefore;
          }
          var oldMiddle = oldBefore.slice(prefixLength);
          var newMiddle = newBefore.slice(prefixLength);
          return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
        }
        editAfter: {
          if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) {
            break editAfter;
          }
          var cursor = oldCursor;
          var newBefore = newText.slice(0, cursor);
          var newAfter = newText.slice(cursor);
          if (newBefore !== oldBefore) {
            break editAfter;
          }
          var suffixLength = Math.min(oldLength - cursor, newLength - cursor);
          var oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
          var newSuffix = newAfter.slice(newAfter.length - suffixLength);
          if (oldSuffix !== newSuffix) {
            break editAfter;
          }
          var oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
          var newMiddle = newAfter.slice(0, newAfter.length - suffixLength);
          return make_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
        }
      }
      if (oldRange.length > 0 && newRange && newRange.length === 0) {
        replaceRange: {
          var oldPrefix = oldText.slice(0, oldRange.index);
          var oldSuffix = oldText.slice(oldRange.index + oldRange.length);
          var prefixLength = oldPrefix.length;
          var suffixLength = oldSuffix.length;
          if (newLength < prefixLength + suffixLength) {
            break replaceRange;
          }
          var newPrefix = newText.slice(0, prefixLength);
          var newSuffix = newText.slice(newLength - suffixLength);
          if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) {
            break replaceRange;
          }
          var oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
          var newMiddle = newText.slice(prefixLength, newLength - suffixLength);
          return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
        }
      }
      return null;
    }
    function diff2(text1, text2, cursor_pos) {
      return diff_main(text1, text2, cursor_pos, true);
    }
    diff2.INSERT = DIFF_INSERT;
    diff2.DELETE = DIFF_DELETE;
    diff2.EQUAL = DIFF_EQUAL;
    module.exports = diff2;
  }
});

// node_modules/@editor-kit/delta/dist/attributeMap-c8f74f59.js
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function composeAttributes(a, b, keepNull) {
  if (a === void 0) {
    a = {};
  }
  if (b === void 0) {
    b = {};
  }
  if (typeof a !== "object") {
    a = {};
  }
  if (typeof b !== "object") {
    b = {};
  }
  var attributes = __assign({}, b);
  if (!keepNull) {
    attributes = Object.keys(attributes).reduce(function(copy, key2) {
      if (attributes[key2] !== null && attributes[key2] !== "") {
        copy[key2] = attributes[key2];
      }
      return copy;
    }, {});
  }
  for (var key in a) {
    if (a[key] !== void 0 && b[key] === void 0) {
      attributes[key] = a[key];
    }
  }
  return Object.keys(attributes).length > 0 ? attributes : void 0;
}
function stringifyAttributesValue(attributes, keepEmptyAttributes) {
  if (keepEmptyAttributes === void 0) {
    keepEmptyAttributes = true;
  }
  return Object.keys(attributes).reduce(function(copy, key) {
    if (keepEmptyAttributes === false && !attributes[key]) {
      return copy;
    }
    copy[key] = typeof attributes[key] === "string" ? attributes[key] : String(attributes[key]);
    return copy;
  }, {});
}
function transformAttributes(a, b, priority) {
  if (a === void 0) {
    a = {};
  }
  if (b === void 0) {
    b = {};
  }
  if (priority === void 0) {
    priority = false;
  }
  if (typeof a !== "object") {
    return b;
  }
  if (typeof b !== "object") {
    return void 0;
  }
  if (!priority) {
    return b;
  }
  var attributes = Object.keys(b).reduce(function(attrs, key) {
    if (a[key] === void 0) {
      attrs[key] = b[key];
    }
    return attrs;
  }, {});
  return Object.keys(attributes).length > 0 ? attributes : void 0;
}
function invertAttributes(attr, base) {
  if (attr === void 0) {
    attr = {};
  }
  if (base === void 0) {
    base = {};
  }
  attr = attr || {};
  var baseInverted = Object.keys(base).reduce(function(memo, key) {
    if (base[key] !== attr[key] && attr[key] !== void 0) {
      memo[key] = base[key];
    }
    return memo;
  }, {});
  return Object.keys(attr).reduce(function(memo, key) {
    if (attr[key] !== base[key] && base[key] === void 0) {
      memo[key] = "";
    }
    return memo;
  }, baseInverted);
}

// node_modules/@editor-kit/delta/dist/interface.es.js
var OpType;
(function(OpType2) {
  OpType2["DELETE"] = "delete";
  OpType2["RETAIN"] = "retain";
  OpType2["INSERT"] = "insert";
})(OpType || (OpType = {}));
var ZoneType;
(function(ZoneType2) {
  ZoneType2["Content"] = "Z";
  ZoneType2["Row"] = "R";
  ZoneType2["Column"] = "C";
})(ZoneType || (ZoneType = {}));
var ENTER = "\n";
var LINE_MARKER = "*";
var ZONE_TYPES = {
  content: ZoneType.Content,
  rs: ZoneType.Row,
  cs: ZoneType.Column
};
var ROOT_ZONE = "0";
var ZONE_TYPE = "zoneType";

// node_modules/@editor-kit/utils/dist/catchErrorDecorator.es.js
var ERROR_LEVEL;
(function(ERROR_LEVEL2) {
  ERROR_LEVEL2[ERROR_LEVEL2["FATAL"] = 0] = "FATAL";
  ERROR_LEVEL2[ERROR_LEVEL2["ERROR"] = 1] = "ERROR";
})(ERROR_LEVEL || (ERROR_LEVEL = {}));

// node_modules/@editor-kit/utils/dist/constants_common.es.js
var LOCAL = "clientside";
var PREFIX_LOCAL = LOCAL + "-";

// node_modules/@editor-kit/utils/dist/internal_getTag.es.js
var toString = Object.prototype.toString;
function getTag(value) {
  if (value === null || value === void 0) {
    return value === void 0 ? "[object Undefined]" : "[object Null]";
  }
  return toString.call(value);
}

// node_modules/@editor-kit/utils/dist/isObjectLike.es.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

// node_modules/@editor-kit/utils/dist/isEqual.es.js
var symbolValueOf = Symbol.prototype.valueOf;
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
function isNullOrUndefined(val) {
  return val === void 0 || val === null;
}
function baseIsEqual(val1, val2, val1Refs, val2Refs) {
  if (val1 === val2) {
    return true;
  }
  if (isNullOrUndefined(val1) || isNullOrUndefined(val2) || !isObjectLike(val1) && !isObjectLike(val2) && typeof val1 !== "function") {
    return eq(val1, val2);
  }
  var tag1 = getTag(val1);
  var tag2 = getTag(val2);
  if (tag1 !== tag2) {
    return false;
  }
  var val1RefsIndex = val1Refs.indexOf(val1);
  var val2RefsIndex = val2Refs.indexOf(val2);
  if (val1RefsIndex === val2RefsIndex && val1RefsIndex >= 0) {
    return true;
  }
  val1Refs.push(val1);
  val2Refs.push(val2);
  var val1Len = tag1 === "[object Array]" ? val1.length : Object.keys(val1).length;
  var val2Len = tag2 === "[object Array]" ? val2.length : Object.keys(val2).length;
  if (val1Len !== val2Len) {
    return false;
  }
  if (tag1 === "[object Array]") {
    for (var i = 0; i < val1.length; i++) {
      if (!baseIsEqual(val1[i], val2[i], val1Refs.slice(), val2Refs.slice())) {
        return false;
      }
    }
    return true;
  } else if (tag1 === "[object Object]") {
    for (var key in val1) {
      if (val1.hasOwnProperty(key)) {
        if (baseIsEqual(val1[key], val2[key], val1Refs.slice(), val2Refs.slice()) === false) {
          return false;
        }
      }
    }
    return true;
  } else {
    if (tag1 === "[object Function]") {
      return val1.toString() === val2.toString();
    } else if (["[object Number]", "[object Boolean]", "[object Date]"].includes(tag1)) {
      return eq(+val1, +val2);
    } else if (tag1 === "[object String]") {
      return "" + val1 === "" + val2;
    } else if (tag1 === "[object Symbol]") {
      if (symbolValueOf) {
        return symbolValueOf.call(val1) === symbolValueOf.call(val2);
      }
    }
  }
  return false;
}
function isEqual(obj1, obj2) {
  return baseIsEqual(obj1, obj2, [], []);
}

// node_modules/@editor-kit/utils/dist/internal_hasUnicode.es.js
var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f";
var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
var rsComboSymbolsRange = "\\u20d0-\\u20ff";
var rsComboMarksExtendedRange = "\\u1ab0-\\u1aff";
var rsComboMarksSupplementRange = "\\u1dc0-\\u1dff";
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange + rsComboMarksExtendedRange + rsComboMarksSupplementRange;
var rsVarRange = "\\ufe0e\\ufe0f";
var rsZWJ = "\\u200d";
var reHasUnicode = RegExp("[" + (rsZWJ + rsAstralRange + rsComboRange + rsVarRange) + "]");

// node_modules/@editor-kit/utils/dist/internal_unicodeToArray.es.js
var rsAstralRange2 = "\\ud800-\\udfff";
var reComboHalfMarksRange2 = "\\ufe20-\\ufe2f";
var rsComboSymbolsRange2 = "\\u20d0-\\u20ff";
var rsComboMarksExtendedRange2 = "\\u1ab0-\\u1aff";
var rsComboMarksSupplementRange2 = "\\u1dc0-\\u1dff";
var rsComboRange2 = reComboHalfMarksRange2 + rsComboSymbolsRange2 + rsComboMarksExtendedRange2 + rsComboMarksSupplementRange2;
var rsVarRange2 = "\\ufe0e\\ufe0f";
var rsAstral = "[" + rsAstralRange2 + "]";
var rsCombo = "[" + rsComboRange2 + "]";
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
var rsNonAstral = "[^" + rsAstralRange2 + "]";
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ2 = "\\u200d";
var reOptMod = rsModifier + "?";
var rsOptVar = "[" + rsVarRange2 + "]?";
var rsOptJoin = "(?:" + rsZWJ2 + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + (rsOptVar + reOptMod) + ")*";
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsNonAstralCombo = "" + rsNonAstral + rsCombo + "?";
var rsSymbol = "(?:" + [rsNonAstralCombo, rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + (rsSymbol + rsSeq), "g");

// node_modules/@editor-kit/delta/dist/index.es.js
var import_fast_diff5 = __toESM(require_diff());

// node_modules/@editor-kit/delta/dist/utils_diffAttributeMap.es.js
function diffAttributeMap(attr, otherAttr) {
  if (attr === void 0) {
    attr = {};
  }
  if (otherAttr === void 0) {
    otherAttr = {};
  }
  if (typeof attr !== "object") {
    attr = {};
  }
  if (typeof otherAttr !== "object") {
    otherAttr = {};
  }
  var attributes = Object.keys(attr).concat(Object.keys(otherAttr)).reduce(function(attrs, key) {
    if (!isEqual(attr[key], otherAttr[key])) {
      attrs[key] = otherAttr[key] === void 0 ? "" : otherAttr[key];
    }
    return attrs;
  }, {});
  return attributes;
}

// node_modules/@editor-kit/delta/dist/delta-6ecead28.js
var import_fast_diff = __toESM(require_diff());
var Iterator = (
  /** @class */
  (function() {
    function Iterator2(ops) {
      this.ops = ops;
      this.index = 0;
      this.offset = 0;
    }
    var __proto = Iterator2.prototype;
    __proto.hasNext = function() {
      return this.peekLength() < Infinity;
    };
    __proto.next = function(length) {
      if (!length) {
        length = Infinity;
      }
      var nextOp = this.ops[this.index];
      if (nextOp) {
        var offset = this.offset;
        var opLength = getOpLength(nextOp);
        if (length >= opLength - offset) {
          length = opLength - offset;
          this.index += 1;
          this.offset = 0;
        } else {
          this.offset += length;
        }
        if (isDeleteOp(nextOp)) {
          return {
            delete: length
          };
        } else {
          var retOp = {};
          if (nextOp.attributes) {
            retOp.attributes = nextOp.attributes;
          }
          if (isRetainOp(nextOp)) {
            retOp.retain = length;
          } else if (isInsertTextOp(nextOp)) {
            retOp.insert = nextOp.insert.substr(offset, length);
          } else {
            retOp.insert = nextOp.insert;
          }
          return retOp;
        }
      } else {
        return {
          retain: Infinity
        };
      }
    };
    __proto.peek = function() {
      return this.ops[this.index];
    };
    __proto.peekLength = function() {
      if (this.ops[this.index]) {
        return getOpLength(this.ops[this.index]) - this.offset;
      } else {
        return Infinity;
      }
    };
    __proto.peekType = function() {
      if (this.ops[this.index]) {
        return getOpType(this.ops[this.index]);
      }
      return OpType.RETAIN;
    };
    __proto.rest = function() {
      if (!this.hasNext()) {
        return [];
      } else if (this.offset === 0) {
        return this.ops.slice(this.index);
      } else {
        var offset = this.offset;
        var index = this.index;
        var next = this.next();
        var rest = this.ops.slice(this.index);
        this.offset = offset;
        this.index = index;
        return [next].concat(rest);
      }
    };
    return Iterator2;
  })()
);
function getOpIterator(ops) {
  return new Iterator(ops);
}
function getOpLength(op) {
  if (isDeleteOp(op)) {
    return op.delete;
  }
  if (isRetainOp(op)) {
    return op.retain;
  }
  if (isInsertTextOp(op)) {
    return op.insert.length;
  }
  if (isInsertObjectOp(op)) {
    return 1;
  }
  throw new Error("op is unknown");
}
function isDeleteOp(op) {
  return typeof (op === null || op === void 0 ? void 0 : op.delete) === "number";
}
function isRetainOp(op) {
  return typeof (op === null || op === void 0 ? void 0 : op.retain) === "number";
}
function isInsertOp(op) {
  return isInsertTextOp(op) || isInsertObjectOp(op);
}
function isInsertTextOp(op) {
  return typeof (op === null || op === void 0 ? void 0 : op.insert) === "string";
}
function isInsertObjectOp(op) {
  return typeof (op === null || op === void 0 ? void 0 : op.insert) === "object";
}
function getOpType(op) {
  if (isDeleteOp(op)) {
    return OpType.DELETE;
  }
  if (isRetainOp(op)) {
    return OpType.RETAIN;
  }
  if (isInsertOp(op)) {
    return OpType.INSERT;
  }
  throw new Error("op is unknown");
}
var OBJECT_PLACEHOLDER = " ";
function diffDelta(delta, otherDelta, cursor) {
  if (delta.ops === otherDelta.ops) {
    return delta.create({
      zoneId: delta.zoneId,
      zoneType: delta.zoneType
    });
  }
  var strings = [delta, otherDelta].map(function(delta2) {
    return delta2.ops.map(function(op) {
      if (!isInsertOp(op)) {
        throw new Error("diffDelta() should use content delta which only includes insert op");
      }
      return isInsertTextOp(op) ? op.insert : OBJECT_PLACEHOLDER;
    }).join("");
  });
  var diffedDelta = delta.create({
    zoneId: delta.zoneId,
    zoneType: delta.zoneType
  });
  var diffResult = (0, import_fast_diff.default)(strings[0], strings[1], cursor);
  var iter = getOpIterator(delta.ops);
  var otherIter = getOpIterator(otherDelta.ops);
  diffResult.forEach(function(item) {
    var op;
    var otherOp;
    var length = item[1].length;
    while (length > 0) {
      var opLength = 0;
      switch (item[0]) {
        case import_fast_diff.default.INSERT:
          opLength = Math.min(otherIter.peekLength(), length);
          diffedDelta.push(otherIter.next(opLength));
          break;
        case import_fast_diff.default.DELETE:
          opLength = Math.min(length, iter.peekLength());
          iter.next(opLength);
          diffedDelta.delete(opLength);
          break;
        case import_fast_diff.default.EQUAL:
          opLength = Math.min(iter.peekLength(), otherIter.peekLength(), length);
          op = iter.next(opLength);
          otherOp = otherIter.next(opLength);
          if (isEqual(op.insert, otherOp.insert)) {
            diffedDelta.retain(opLength, diffAttributeMap(op.attributes, otherOp.attributes));
          } else {
            diffedDelta.push(otherOp).delete(opLength);
          }
          break;
      }
      length -= opLength;
    }
  });
  return diffedDelta.chop();
}
var DeltaSet = (
  /** @class */
  (function() {
    function DeltaSet2(options, isDeltas) {
      if (options === void 0) {
        options = {};
      }
      isDeltas = isDeltas !== null && isDeltas !== void 0 ? isDeltas : Object.keys(options).some(function(zoneId) {
        if (options[zoneId] instanceof Delta) {
          return true;
        }
        return false;
      });
      if (isDeltas) {
        this._deltas = options;
      } else {
        this._deltas = Object.keys(options).reduce(function(deltas, zoneId) {
          deltas[zoneId] = createDelta(options[zoneId]);
          return deltas;
        }, {});
      }
    }
    var __proto = DeltaSet2.prototype;
    Object.defineProperty(__proto, "deltas", {
      get: function() {
        return this._deltas;
      },
      enumerable: false,
      configurable: true
    });
    __proto.get = function(zoneId) {
      return this._deltas[zoneId];
    };
    __proto.compose = function(data, keepEmptyAttributes, immutable) {
      if (keepEmptyAttributes === void 0) {
        keepEmptyAttributes = true;
      }
      if (immutable === void 0) {
        immutable = true;
      }
      return this._call("compose", data, {
        keepEmptyAttributes,
        immutable
      });
    };
    __proto.concat = function(data) {
      return this._call("concat", data);
    };
    __proto.invert = function(base) {
      var baseDeltaSet = new DeltaSet2();
      if (isDelta(base)) {
        baseDeltaSet = new DeltaSet2().add(base.zoneId, base);
      } else if (isDeltaSet(base)) {
        baseDeltaSet = base;
      } else {
        throw Error("DeltaSet invert data is wrong");
      }
      return this.reduce(function(acc, currDelta) {
        var baseDelta = baseDeltaSet.get(currDelta.zoneId) || currDelta.create({
          zoneId: currDelta.zoneId
        });
        var invertedDelta = currDelta.invert(baseDelta);
        return acc.compose(invertedDelta);
      }, new DeltaSet2());
    };
    __proto.transform = function(data, priority) {
      var _this = this;
      if (priority === void 0) {
        priority = false;
      }
      if (isDelta(data)) {
        if (data.zoneId in this.deltas) {
          return this.deltas[data.zoneId].transform(data, priority);
        } else {
          return data;
        }
      } else if (isDeltaSet(data)) {
        return new DeltaSet2(data.reduce(function(deltas, delta) {
          deltas[delta.zoneId] = _this.transform(delta, priority);
          return deltas;
        }, {}));
      } else {
        throw Error("DeltaSet call data is wrong");
      }
    };
    __proto.delete = function(zoneId) {
      delete this._deltas[zoneId];
      return this;
    };
    __proto.add = function(param, delta) {
      if (isDelta(param)) {
        var zoneId = param.zoneId;
        this._deltas[zoneId] = param;
      } else {
        if (!delta) {
          console.error("DeltaSet add delta error, delta is undefined");
          return this;
        }
        var zoneId = param;
        if (delta.zoneId !== zoneId) {
          console.error("DeltaSet add delta error, zoneId is not match");
          return this;
        }
        this._deltas[zoneId] = delta;
      }
      return this;
    };
    __proto.replace = function(zoneId, delta) {
      this.delete(zoneId).add(delta.zoneId, delta);
      return this;
    };
    __proto._call = function(fn, data, options) {
      if (isDelta(data)) {
        return this._callDeltaFunc(fn, data, options);
      } else if (isDeltaSet(data)) {
        var deltaSet_1 = new DeltaSet2(this.deltas);
        data.forEach(function(delta) {
          deltaSet_1 = deltaSet_1._callDeltaFunc(fn, delta, options);
        });
        return deltaSet_1;
      } else {
        throw Error("DeltaSet call: data: " + data + " is not Delta or DeltaSet");
      }
    };
    __proto._callDeltaFunc = function(fn, delta, options) {
      var _options = Object.assign({
        keepEmptyAttributes: true,
        immutable: true
      }, options);
      var zoneId = delta.zoneId;
      var newDeltas = _options.immutable ? __assign({}, this.deltas) : this.deltas;
      if (!this.deltas[zoneId]) {
        var zoneType = delta.zoneType;
        newDeltas[zoneId] = delta.create({
          zoneId,
          zoneType
        })[fn](delta, _options.keepEmptyAttributes);
      } else {
        newDeltas[zoneId] = this.deltas[zoneId][fn](delta, _options.keepEmptyAttributes);
      }
      return new DeltaSet2(newDeltas, true);
    };
    __proto.reduce = function(predicate, initialValue) {
      var _this = this;
      return Object.keys(this._deltas).map(function(zoneId) {
        return _this._deltas[zoneId];
      }).reduce(predicate, initialValue);
    };
    __proto.forEach = function(func) {
      var e_1, _a;
      try {
        for (var _b = __values(Object.entries(this._deltas)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var _d = __read(_c.value, 2), zoneId = _d[0], delta = _d[1];
          func(delta, zoneId);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    };
    return DeltaSet2;
  })()
);
function diffDeltaSet(deltaSet, otherDeltaSet) {
  var diffResult = new DeltaSet();
  deltaSet.forEach(function(delta) {
    var otherDelta = otherDeltaSet.get(delta.zoneId) || delta.create({
      zoneId: delta.zoneId
    });
    diffResult.add(diffDelta(delta, otherDelta));
  });
  otherDeltaSet.forEach(function(otherDelta) {
    var delta = deltaSet.get(otherDelta.zoneId);
    if (!delta) {
      diffResult.add(otherDelta);
    }
  });
  return diffResult;
}
function isLineAttributes(op) {
  return op.insert === LINE_MARKER && op.attributes && op.attributes.lmkr;
}
function cloneOp(op) {
  var newOp = __assign({}, op);
  if (op.attributes) {
    newOp.attributes = __assign({}, op.attributes);
  }
  return newOp;
}
function isDelta(param) {
  return Object.values(ZoneType).includes(param["zoneType"]);
}
function isDeltaSet(param) {
  return param["deltas"] !== void 0;
}
function isEmptyDelta(delta) {
  var _a;
  if (!delta) {
    return true;
  }
  return ((_a = delta === null || delta === void 0 ? void 0 : delta.ops) === null || _a === void 0 ? void 0 : _a.length) === 0;
}
function isEmptyDeltaSet(deltaSet) {
  if (!deltaSet) {
    return true;
  }
  var deltas = deltaSet.deltas;
  var zoneIds = Object.keys(deltas);
  if (zoneIds.length === 0) {
    return true;
  }
  var hasDelta = zoneIds.some(function(zoneId) {
    return !isEmptyDelta(deltas[zoneId]);
  });
  return !hasDelta;
}
function getNotEmptyDelta(deltaSet) {
  return deltaSet.reduce(function(acc, currDelta) {
    if (currDelta.ops.length > 0) {
      return acc.add(currDelta.zoneId, currDelta);
    }
    return acc;
  }, new DeltaSet());
}
var Delta = (
  /** @class */
  (function() {
    function Delta2() {
      this.ops = [];
    }
    var __proto = Delta2.prototype;
    Delta2.registerCreator = function(type, creator) {
      Delta2.creators.set(type, creator);
    };
    Delta2.getCreator = function(type) {
      var creator = Delta2.creators.get(type);
      return creator;
    };
    __proto.insert = function(data, attributes, keepEmptyAttributes) {
      if (keepEmptyAttributes === void 0) {
        keepEmptyAttributes = true;
      }
      if (typeof data === "string" && data.length === 0) {
        return this;
      }
      var newOp = {
        insert: data
      };
      if (attributes != null && typeof attributes === "object" && Object.keys(attributes).length > 0) {
        newOp.attributes = stringifyAttributesValue(attributes, keepEmptyAttributes);
      }
      return this.push(newOp);
    };
    __proto.delete = function(length) {
      if (length <= 0) {
        return this;
      }
      return this.push({
        delete: length
      });
    };
    __proto.retain = function(length, attributes) {
      if (length <= 0) {
        return this;
      }
      var newOp = {
        retain: length
      };
      if (attributes != null && typeof attributes === "object" && Object.keys(attributes).length > 0) {
        newOp.attributes = stringifyAttributesValue(attributes);
      }
      return this.push(newOp);
    };
    __proto.forEach = function(predicate) {
      this.ops.forEach(predicate);
    };
    __proto.eachLine = function(predicate, newline) {
      if (newline === void 0) {
        newline = ENTER;
      }
      var iter = getOpIterator(this.ops);
      var i = 0;
      var lineAttributes = {};
      var ops = [];
      while (iter.hasNext()) {
        if (iter.peekType() !== OpType.INSERT) {
          return;
        }
        var thisOp = iter.peek();
        if (isLineAttributes(thisOp)) {
          lineAttributes = thisOp.attributes || {};
        }
        var start = getOpLength(thisOp) - iter.peekLength();
        var index = typeof thisOp.insert === "string" ? thisOp.insert.indexOf(newline, start) - start : -1;
        if (index < 0) {
          ops.push(iter.next());
        } else {
          ops.push(iter.next(index + 1));
          var line_1 = this.create({
            zoneId: this.zoneId,
            ops
          });
          if (predicate(line_1, lineAttributes, i) === false) {
            return;
          }
          ops = [];
          lineAttributes = {};
          i += 1;
        }
      }
      var line = this.create({
        zoneId: this.zoneId,
        ops
      });
      if (line.length() > 0) {
        predicate(line, lineAttributes, i);
      }
    };
    __proto.push = function(newOp) {
      if (isDeleteOp(newOp) && newOp.delete <= 0) {
        console.warn("delete op is wrong");
        return this;
      }
      if (isRetainOp(newOp) && newOp.retain <= 0) {
        console.warn("retain op is wrong");
        return this;
      }
      if (isInsertTextOp(newOp) && newOp.insert.length === 0) {
        console.warn("insert op is wrong");
        return this;
      }
      var index = this.ops.length;
      var lastOp = this.ops[index - 1];
      newOp = cloneOp(newOp);
      if (typeof lastOp === "object") {
        if (isDeleteOp(newOp) && isDeleteOp(lastOp)) {
          this.ops[index - 1] = {
            delete: lastOp.delete + newOp.delete
          };
          return this;
        }
        if (isEqual(newOp.attributes, lastOp.attributes)) {
          if (isInsertTextOp(newOp) && isInsertTextOp(lastOp)) {
            this.ops[index - 1] = {
              insert: lastOp.insert + newOp.insert
            };
            if (typeof newOp.attributes === "object") {
              this.ops[index - 1].attributes = newOp.attributes;
            }
            return this;
          } else if (isRetainOp(newOp) && isRetainOp(lastOp)) {
            this.ops[index - 1] = {
              retain: lastOp.retain + newOp.retain
            };
            if (typeof newOp.attributes === "object") {
              this.ops[index - 1].attributes = newOp.attributes;
            }
            return this;
          }
        }
      }
      if (index === this.ops.length) {
        this.ops.push(newOp);
      } else {
        this.ops.splice(index, 0, newOp);
      }
      return this;
    };
    __proto.compose = function(other, keepEmptyAttributes) {
      if (keepEmptyAttributes === void 0) {
        keepEmptyAttributes = true;
      }
      if (keepEmptyAttributes === false) {
        var zoneId = other.zoneId, zoneType = other.zoneType;
        other = other.reduce(function(accum, curr) {
          if (curr.insert && curr.attributes) {
            curr.attributes = stringifyAttributesValue(curr.attributes, keepEmptyAttributes);
          }
          accum.push(curr);
          return accum;
        }, this.create({
          zoneId,
          zoneType
        }));
      }
      var thisIter = getOpIterator(this.ops);
      var otherIter = getOpIterator(other.ops);
      var ops = [];
      var firstOther = otherIter.peek();
      if (firstOther != null && isRetainOp(firstOther) && firstOther.attributes == null) {
        var firstLeft = firstOther.retain;
        while (thisIter.peekType() === OpType.INSERT && thisIter.peekLength() <= firstLeft) {
          firstLeft -= thisIter.peekLength();
          ops.push(thisIter.next());
        }
        if (firstOther.retain - firstLeft > 0) {
          otherIter.next(firstOther.retain - firstLeft);
        }
      }
      var delta = this.create({
        zoneId: this.zoneId,
        zoneType: this.zoneType,
        ops
      });
      while (thisIter.hasNext() || otherIter.hasNext()) {
        if (otherIter.peekType() === OpType.INSERT) {
          delta.push(otherIter.next());
        } else if (thisIter.peekType() === OpType.DELETE) {
          delta.push(thisIter.next());
        } else {
          var length_1 = Math.min(thisIter.peekLength(), otherIter.peekLength());
          var thisOp = thisIter.next(length_1);
          var otherOp = otherIter.next(length_1);
          if (isDeleteOp(otherOp) && isInsertTextOp(thisOp)) ;
          else if (isDeleteOp(otherOp) && isRetainOp(thisOp)) {
            delta.push(otherOp);
          } else if (isRetainOp(otherOp)) {
            var newOp = {};
            if (isRetainOp(thisOp)) {
              newOp.retain = length_1;
            } else {
              newOp.insert = thisOp.insert;
            }
            var attributes = composeAttributes(thisOp.attributes, otherOp.attributes, keepEmptyAttributes);
            if (attributes) {
              newOp.attributes = attributes;
            }
            delta.push(newOp);
            if (!otherIter.hasNext() && isEqual(delta.ops[delta.ops.length - 1], newOp)) {
              var rest = this.create({
                zoneId: this.zoneId,
                zoneType: this.zoneType,
                ops: thisIter.rest()
              });
              return delta.concat(rest).chop();
            }
          }
        }
      }
      return delta.chop();
    };
    __proto.concat = function(other) {
      var delta = this.create({
        zoneId: this.zoneId,
        zoneType: this.zoneType,
        ops: this.ops.slice()
      });
      if (other.ops.length > 0) {
        delta.push(other.ops[0]);
        delta.ops = delta.ops.concat(other.ops.slice(1));
      }
      return delta;
    };
    __proto.length = function() {
      return this.reduce(function(length, elem) {
        return length + getOpLength(elem);
      }, 0);
    };
    __proto.reduce = function(predicate, initialValue) {
      return this.ops.reduce(predicate, initialValue);
    };
    __proto.chop = function() {
      var lastOp = this.ops[this.ops.length - 1];
      if (lastOp && lastOp.retain && !lastOp.attributes) {
        this.ops.pop();
      }
      return this;
    };
    __proto.transform = function(arg, priority) {
      if (priority === void 0) {
        priority = false;
      }
      priority = !!priority;
      if (typeof arg === "number") {
        return this.transformPosition(arg, priority);
      }
      var other = arg;
      var thisIter = getOpIterator(this.ops);
      var otherIter = getOpIterator(other.ops);
      var delta = this.create({
        zoneId: this.zoneId,
        zoneType: this.zoneType
      });
      while (thisIter.hasNext() || otherIter.hasNext()) {
        if (thisIter.peekType() === OpType.INSERT && (priority || otherIter.peekType() !== OpType.INSERT)) {
          delta.retain(getOpLength(thisIter.next()));
        } else if (otherIter.peekType() === OpType.INSERT) {
          delta.push(otherIter.next());
        } else {
          var length_2 = Math.min(thisIter.peekLength(), otherIter.peekLength());
          var thisOp = thisIter.next(length_2);
          var otherOp = otherIter.next(length_2);
          if (isDeleteOp(thisOp)) {
            continue;
          } else if (isDeleteOp(otherOp)) {
            delta.push(otherOp);
          } else {
            delta.retain(length_2, transformAttributes(thisOp.attributes, otherOp.attributes, priority));
          }
        }
      }
      return delta.chop();
    };
    __proto.transformPosition = function(index, priority) {
      if (priority === void 0) {
        priority = false;
      }
      priority = !!priority;
      var thisIter = getOpIterator(this.ops);
      var offset = 0;
      while (thisIter.hasNext() && offset <= index) {
        var length_3 = thisIter.peekLength();
        var nextType = thisIter.peekType();
        thisIter.next();
        if (nextType === "delete") {
          index -= Math.min(length_3, index - offset);
          continue;
        } else if (nextType === "insert" && (offset < index || !priority)) {
          index += length_3;
        }
        offset += length_3;
      }
      return index;
    };
    __proto.slice = function(start, end) {
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = Infinity;
      }
      var ops = [];
      var iter = getOpIterator(this.ops);
      var index = 0;
      while (index < end && iter.hasNext()) {
        var nextOp = void 0;
        if (index < start) {
          nextOp = iter.next(start - index);
        } else {
          nextOp = iter.next(end - index);
          ops.push(nextOp);
        }
        index += getOpLength(nextOp);
      }
      return this.create({
        zoneId: this.zoneId,
        zoneType: this.zoneType,
        ops
      });
    };
    __proto.invert = function(base) {
      var inverted = this.create({
        zoneId: this.zoneId,
        zoneType: this.zoneType
      });
      this.reduce(function(baseIndex, op) {
        if (isInsertOp(op)) {
          inverted.delete(getOpLength(op));
        } else if (isRetainOp(op) && !op.attributes) {
          inverted.retain(op.retain);
          return baseIndex + op.retain;
        } else if (isDeleteOp(op) || isRetainOp(op) && op.attributes) {
          var length_4 = op.delete || op.retain;
          var slice = base.slice(baseIndex, baseIndex + length_4);
          slice.forEach(function(baseOp) {
            if (isDeleteOp(op)) {
              inverted.push(baseOp);
            } else if (isRetainOp(op) && op.attributes) {
              inverted.retain(getOpLength(baseOp), invertAttributes(op.attributes, baseOp.attributes));
            }
          });
          return baseIndex + length_4;
        }
        return baseIndex;
      }, 0);
      return inverted.chop();
    };
    Delta2.creators = /* @__PURE__ */ new Map();
    return Delta2;
  })()
);
function createDelta(options) {
  var DeltaCreator = Delta.getCreator(options.zoneType);
  if (!DeltaCreator) {
    console.error("DeltaCreator undefiend", options.zoneType);
  }
  return new DeltaCreator(options);
}

// node_modules/@editor-kit/delta/dist/baseZoneDelta.es.js
var import_fast_diff2 = __toESM(require_diff());
var BaseZoneDelta = (
  /** @class */
  (function(_super) {
    __extends(BaseZoneDelta2, _super);
    function BaseZoneDelta2(deltaOptions) {
      if (deltaOptions === void 0) {
        deltaOptions = {};
      }
      var _this = _super.call(this) || this;
      _this.ops = [];
      var zoneId = deltaOptions.zoneId, ops = deltaOptions.ops;
      _this.zoneId = zoneId || "0";
      _this.zoneType = ZoneType.Content;
      if (ops && ops.length > 0) {
        _this.ops = ops;
      }
      return _this;
    }
    var __proto = BaseZoneDelta2.prototype;
    __proto.create = function(options) {
      options.zoneType = options.zoneType || this.zoneType;
      return new BaseZoneDelta2(options);
    };
    __proto.insertEnter = function(attributes) {
      if (attributes === void 0) {
        attributes = {};
      }
      this.insert(ENTER, attributes);
      return this;
    };
    __proto.insertEnterAndLineMarker = function(_options) {
      return this;
    };
    __proto.insertLineMarker = function(_lineAttributes) {
      return this;
    };
    return BaseZoneDelta2;
  })(Delta)
);

// node_modules/@editor-kit/delta/dist/rowColDelta_interface.es.js
var ID_PREFIX = {
  ROWS_ZONE_ID: "rs",
  COLS_ZONE_ID: "cs",
  ROW_ID: "r1",
  COL_ID: "c1",
  CELL_ID: "x"
};

// node_modules/@editor-kit/delta/dist/rowColDelta_rowColDelta.es.js
var import_fast_diff3 = __toESM(require_diff());
var RowColDelta = (
  /** @class */
  (function(_super) {
    __extends(RowColDelta2, _super);
    function RowColDelta2(deltaOptions) {
      var _this = _super.call(this) || this;
      _this.ops = [];
      var zoneId = deltaOptions.zoneId, ops = deltaOptions.ops, zoneType = deltaOptions.zoneType;
      _this.zoneId = zoneId;
      _this.zoneType = zoneType;
      if (ops && ops.length > 0) {
        _this.ops = ops;
      }
      return _this;
    }
    var __proto = RowColDelta2.prototype;
    __proto.insert = function(id, attributes) {
      if (!id) {
        return this;
      }
      var data = {
        id
      };
      return _super.prototype.insert.call(this, data, attributes, false);
    };
    __proto.create = function(options) {
      options.zoneType = options.zoneType || this.zoneType;
      var delta = new RowColDelta2(options);
      return delta;
    };
    return RowColDelta2;
  })(Delta)
);
var RowDelta = (
  /** @class */
  (function(_super) {
    __extends(RowDelta2, _super);
    function RowDelta2(options) {
      return _super.call(this, __assign({
        zoneType: ZoneType.Row
      }, options)) || this;
    }
    return RowDelta2;
  })(RowColDelta)
);
var ColDelta = (
  /** @class */
  (function(_super) {
    __extends(ColDelta2, _super);
    function ColDelta2(options) {
      return _super.call(this, __assign({
        zoneType: ZoneType.Column
      }, options)) || this;
    }
    return ColDelta2;
  })(RowColDelta)
);
Delta.registerCreator(ZoneType.Row, RowDelta);
Delta.registerCreator(ZoneType.Column, ColDelta);

// node_modules/@editor-kit/delta/dist/rowColDelta_utils.es.js
function isRowsZoneId(id) {
  return id.indexOf(ID_PREFIX.ROWS_ZONE_ID) === 0 && id.length === 34;
}
function isColsZoneId(id) {
  return id.indexOf(ID_PREFIX.COLS_ZONE_ID) === 0 && id.length === 34;
}
function isInsertLineMakerOp(op) {
  return Boolean(op.insert === LINE_MARKER && op.attributes && op.attributes.lmkr);
}
function isInsertRowColOp(op) {
  return typeof op.insert === "object";
}
function getRowColId(op) {
  return typeof op.insert === "object" && op.insert.id;
}

// node_modules/@editor-kit/delta/dist/zoneDelta.es.js
var import_fast_diff4 = __toESM(require_diff());
var ZoneDelta = (
  /** @class */
  (function(_super) {
    __extends(ZoneDelta2, _super);
    function ZoneDelta2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    var __proto = ZoneDelta2.prototype;
    __proto.create = function(options) {
      options.zoneType = options.zoneType || this.zoneType;
      return new ZoneDelta2(options);
    };
    __proto.insert = function(text, attributes) {
      return _super.prototype.insert.call(this, text, attributes, false);
    };
    __proto.insertLineMarker = function(lineAttributes) {
      if (lineAttributes === void 0) {
        lineAttributes = {};
      }
      var attributes = Object.assign({
        lmkr: 1
      }, lineAttributes);
      this.insert(LINE_MARKER, attributes);
      return this;
    };
    __proto.insertEnterAndLineMarker = function(options) {
      this.insert(ENTER, options && options.enterAttributes ? options.enterAttributes : {});
      var lineAttributes = Object.assign({
        lmkr: 1
      }, options && options.lineAttributes ? options.lineAttributes : {});
      this.insert(LINE_MARKER, lineAttributes);
      return this;
    };
    return ZoneDelta2;
  })(BaseZoneDelta)
);
Delta.registerCreator(ZoneType.Content, ZoneDelta);
export {
  BaseZoneDelta,
  ColDelta,
  Delta,
  DeltaSet,
  ENTER,
  ID_PREFIX,
  LINE_MARKER,
  OpType,
  ROOT_ZONE,
  RowColDelta,
  RowDelta,
  ZONE_TYPE,
  ZONE_TYPES,
  ZoneDelta,
  ZoneType,
  cloneOp,
  composeAttributes,
  createDelta,
  diffAttributeMap,
  diffDelta,
  diffDeltaSet,
  getNotEmptyDelta,
  getOpIterator,
  getOpLength,
  getOpType,
  getRowColId,
  invertAttributes,
  isColsZoneId,
  isDeleteOp,
  isDelta,
  isDeltaSet,
  isEmptyDelta,
  isEmptyDeltaSet,
  isInsertLineMakerOp,
  isInsertObjectOp,
  isInsertOp,
  isInsertRowColOp,
  isInsertTextOp,
  isLineAttributes,
  isRetainOp,
  isRowsZoneId,
  stringifyAttributesValue,
  transformAttributes
};
//# sourceMappingURL=@editor-kit_delta.js.map
