import { types as t } from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";
import { identifier } from "@babel/types";
import { callExpression } from "@babel/types";

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

  log(path.get("openingElement").node);

  const props = transformProps(path.get("openingElement").node.attributes);

  expressions.push(
    t.callExpression(createComponent, [t.identifier(tagName), props])
  );
  return { expressions, template: "", isComponent: true };
};

const transformProps = (attributes) => {
  // log(attributes);
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
  if (results.identifier) {
    const templateIdentifier = registerTemplate(path, results.template);
    const { dynamics } = results;
    if (dynamics.length) {
      const arrowFuntion = t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.variableDeclaration("var", [
            t.variableDeclarator(
              results.identifier,
              callExpression(templateIdentifier, [])
            ),
          ]),
          t.returnStatement(results.identifier),
        ])
      );
      return t.callExpression(arrowFuntion, []);
    }

    return t.callExpression(results.identifier, []);
  }

  return results.expressions[0];
};

const registerTemplate = (path, template) => {
  const templateInfos =
    path.scope.getProgramParent().data.templateInfos ||
    (path.scope.getProgramParent().data.templateInfos = []);

  const templateInfo = templateInfos.find(
    (tempObj) => tempObj.template === template
  );
  if (templateInfo) {
    return templateInfo.identifier;
  }

  const identifier = path.scope.generateUidIdentifier("tmp$");
  templateInfos.push({
    identifier,
    template,
  });

  return identifier;
};

const transformElementDom = (path) => {
  let expressions = [],
    dynamics = [1];
  const results = {
    identifier: path.scope.generateUidIdentifier("el$"),
    expressions,
    dynamics,
  };
  return results;
};

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
  /^[^a-zA-Z]/.test(tagName) ||
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

  return t.cloneNode(imports.get(moduleMethodKey));
};

export const transformJsxFragment = noop;

const log = (content) => console.log(content);
