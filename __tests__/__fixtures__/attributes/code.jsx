const style = { color: "blue" };
const className = "title";

const jsx = <h1 className="title">hello</h1>;
const jsx2 = <h1 className={className}>Title</h1>;
const jsx3 = <h1 style={{}}>Title with empty style</h1>;
const jsx4 = <h1 style={{ color: "red" }}>Title with style object</h1>;
const jsx5 = <h1 style={style}>Title with style identifier</h1>;
