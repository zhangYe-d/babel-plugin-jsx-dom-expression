const text = "hello world";
let bool = true;

const jsx = <h1>hello world</h1>;
const jsx2 = <h1>{text}</h1>;
const jsx5 = <h1>{bool ? "bool" : text}</h1>;

const jsx3 = (
  <h1>
    <div>happy day</div>
  </h1>
);
const jsx4 = (
  <h1>
    <div>{text}</div>
  </h1>
);
