import {
  effect as _effect,
  setAttribute as _setAttribute,
  style as _style,
  template as _template,
} from "../../mockModule";
var _tmp$ = _template(`<h1 className="title">hello</h1>`),
  _tmp$2 = _template(`<h1>Title</h1>`),
  _tmp$3 = _template(`<h1>Title with empty style</h1>`),
  _tmp$4 = _template(`<h1>Title with style object</h1>`),
  _tmp$5 = _template(`<h1>Title with style identifier</h1>`);
const style = {
  color: "blue",
};
const className = "title";
const jsx = _tmp$();
const jsx2 = (() => {
  var _$el2 = _tmp$2();
  _effect(() => _setAttribute(_$el2, "className", className));
  return _$el2;
})();
const jsx3 = _tmp$3();
const jsx4 = (() => {
  var _$el4 = _tmp$4();
  _effect(() => _$el4.style.setProperty("color", "red"));
  return _$el4;
})();
const jsx5 = (() => {
  var _$el5 = _tmp$5();
  _style(_$el5, style);
  return _$el5;
})();