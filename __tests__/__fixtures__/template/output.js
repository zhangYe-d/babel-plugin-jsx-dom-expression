import { insert as _insert, template as _template } from "../../mockModule";
var _tmp$ = _template(`<h1>hello world</h1>`),
  _tmp$2 = _template(`<h1></h1>`),
  _tmp$3 = _template(`<h1><div>happy day</div></h1>`),
  _tmp$4 = _template(`<h1><div></div></h1>`);
const text = "hello world";
let bool = true;
const jsx = _tmp$();
const jsx2 = (() => {
  var _$el2 = _tmp$2();
  _insert(_$el2, text);
  return _$el2;
})();
const jsx5 = (() => {
  var _$el3 = _tmp$2();
  _insert(_$el3, bool ? "bool" : text);
  return _$el3;
})();
const jsx3 = _tmp$3();
const jsx4 = (() => {
  var _$el5 = _tmp$4(),
    _$el6 = _$el5.firstChild,
    _$el7 = _$el6.nextSibling;
  _insert(_$el7, text);
  return _$el5;
})();