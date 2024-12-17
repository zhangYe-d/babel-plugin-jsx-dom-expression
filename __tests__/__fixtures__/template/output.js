import { insert as _insert, template as _template } from "../../mockModule";
var _tmp$ = _template(`<h1>hello world</h1>`),
  _tmp$2 = _template(`<h1></h1>`);
const text = "hello world";
const jsx = _tmp$();
const jsx2 = (() => {
  var _$el2 = _tmp$2();
  _insert(_$el2, text);
  return _$el2;
})();