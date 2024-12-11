import { types as t } from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";

const noop = () => {};

//  jsx type
const JSXText = "JSXText";
const JSXElement = "JSXElement";
const JSXExpressionContainer = "JSXExpressionContainer";
const JSXEmptyExpression = "JSXEmptyExpression";

// config
const config = {
  moduleName: "solid/web",
};

export const transformJsx = (path) => {
  const results = transformNode(path);
  //   const template = createTemplate(path, results);

  //   log(path.node);
  path.replaceWith(createTemplate(path, results));
};

const transformNode = (path) => {
  const node = path.node;
  switch (node.type) {
    case JSXElement:
      return transformElement(path);
    case JSXText:
    case JSXExpressionContainer:
      if (t.isJSXEmptyExpression(node.expression)) {
        return null;
      }
      return transformNode(node.expression);
  }

  return {};
};

const transformElement = (path) => {
  const openingElementPath = path.get("openingElement");
  const tagName = getTagName(openingElementPath.node);

  return isComponent(tagName)
    ? transformComponent(path, tagName)
    : transformElementDom(path);
};

const transformComponent = (path, tagName) => {
  const expressions = [];
  const createComponent = registerImportMethod(
    path,
    "createComponent",
    config.moduleName
  );

  const props = transformProps(path.get("openingElement").node.attributes);

  expressions.push(
    t.callExpression(createComponent, [t.identifier(tagName), props])
  );
  return { expressions, template: "", isComponent: true };
};

const transformProps = (attributes) => {
  log(attributes);
  const properties = attributes.reduce((props, attribute) => {
    if (t.isJSXExpressionContainer(attribute)) {
      if (t.isEmptyStatement(attribute.expression)) return props;
      const [key, value] = getAttributePropertyKeyAndValue(
        attribute.expression
      );
      return props.concat(t.objectProperty(key, value));
    }

    return props.concat(
      t.objectProperty(...getAttributePropertyKeyAndValue(attribute))
    );
  }, []);

  return t.objectExpression(properties);
};

const createTemplate = (path, results) => {
  return results.expressions[0];
};

const transformElementDom = (path) => {};

const getAttributePropertyKeyAndValue = (attribute) => {
  let key, value;
  key = t.identifier(attribute.name.name);
  value = t.isJSXExpressionContainer(attribute.value)
    ? attribute.value.expression
    : attribute.value;
  return [key, value];
};

const getTagName = (openingElement) => openingElement.name.name;

const isComponent = (tagName) =>
  (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
  /[^a-zA-Z]/.test(tagName) ||
  tagName.includes(".");

const registerImportMethod = (path, name, moduleName) => {
  const imports =
    path.scope.getProgramParent().data.imports ||
    (path.scope.getProgramParent().data.imports = new Map());
  const moduleMethodKey = `${moduleName}:${name}`;

  if (!imports.has(moduleMethodKey)) {
    const identifier = addNamed(path, name, moduleName, {
      nameHint: `_${name}`,
    });

    imports.set(moduleMethodKey, identifier);
    return identifier;
  }

  // need to switch to t.cloneNode()?
  return imports.get(moduleMethodKey).cloneNode();
};

export const transformJsxFragment = noop;

const log = (content) => console.log(content);
