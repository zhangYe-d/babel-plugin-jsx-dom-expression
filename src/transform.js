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

const transformNode = (path, info = {}) => {
  const node = path.node;

  switch (node.type) {
    case JSXElement:
      return transformElement(path, info);
    case JSXText:
      const results = {
        template: trimWhitespace(node.extra.raw),
        expressions: [],
      };
      if (!info.skipId)
        results.identifier = path.scope.generateUidIdentifier("$el");
      return results;
    case JSXExpressionContainer:
      if (t.isJSXEmptyExpression(node.expression)) {
        return null;
      }

      return {
        expressions: [node.expression],
        template: "",
      };
    default:
  }

  return results;
};

const transformElement = (path, info) => {
  const openingElementPath = path.get("openingElement");
  const tagName = getTagName(openingElementPath.node);

  return isComponent(tagName)
    ? transformComponent(path, tagName)
    : transformElementDom(path, info);
};

const transformComponent = (path, tagName) => {
  const expressions = [];
  const createComponent = registerImportMethod(
    path,
    "createComponent",
    config.moduleName
  );

  // log(path.get("openingElement").node);

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
    if (results.expressions.length) {
      const elementCallExpression = t.callExpression(templateIdentifier, []);
      results.declarators.unshift(
        t.variableDeclarator(results.identifier, elementCallExpression)
      );
      const arrowFuntion = t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.variableDeclaration("var", results.declarators),
          ...results.expressions,
          t.returnStatement(results.identifier),
        ])
      );
      return t.callExpression(arrowFuntion, []);
    }

    return elementCallExpression;
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

const transformElementDom = (path, info = {}) => {
  // log(path.get("openingElement"));
  const tagName = getTagName(path.get("openingElement").node);
  let expressions = [],
    dynamics = [1],
    declarators = [];
  const results = {
    expressions,
    declarators,
    dynamics,
    template: `<${tagName}`,
  };

  if (!info.skipId) {
    results.identifier = path.scope.generateUidIdentifier("$el");
  }

  transformAttributes(path, results);
  results.template += ">";
  transformChildren(path, results);
  results.template += `</${tagName}>`;
  return results;
};

const transformChildren = (path, results) => {
  // log(path.get("children"));
  const childrenTransformed = path
    .get("children")
    .map((childPath, index) =>
      transformNode(childPath, {
        skipId:
          !results.identifier ||
          !detectExpressions(path.get("children"), index),
      })
    )
    .filter(Boolean);

  let tmptPath = results.identifier;
  childrenTransformed.forEach((child, index) => {
    results.template += child.template;

    if (child.identifier) {
      const declarator = t.variableDeclarator(
        child.identifier,
        t.memberExpression(
          tmptPath,
          t.identifier(index === 0 ? "firstChild" : "nextSibling")
        )
      );

      results.declarators.push(declarator);
      results.expressions.push(...child.expressions);
      results.declarators.push(...(child.declarators || []));
    } else if (child.expressions.length) {
      const insert = registerImportMethod(path, "insert", config.moduleName);
      results.expressions.push(
        t.expressionStatement(
          t.callExpression(insert, [results.identifier, child.expressions[0]])
        )
      );
    }
  });
};

const transformAttributes = (path, results) => {
  const attributes = path
    .get("openingElement")
    .get("attributes")
    .map((a) => a.node);

  attributes.forEach((attribute) => {
    if (t.isStringLiteral(attribute.value)) {
      const [key, value] = getAttributeRawKeyAndValue(attribute);
      results.template += ` ${key}="${value}"`;
    }

    if (
      t.isJSXExpressionContainer(attribute.value) &&
      !t.isJSXEmptyExpression(attribute.value.expression)
    ) {
      const effect = registerImportMethod(path, "effect", config.moduleName);
      results.expressions.push(
        t.expressionStatement(
          t.callExpression(effect, [
            t.arrowFunctionExpression(
              [],
              setAttribute(
                path,
                results.identifier,
                ...getAttributePropertyKeyAndValue(attribute)
              )
            ),
          ])
        )
      );
    }
  });
};

const setAttribute = (path, element, key, value) => {
  const set = registerImportMethod(path, "setAttribute", config.moduleName);
  return t.callExpression(set, [element, t.stringLiteral(key.name), value]);
};

const getAttributePropertyKeyAndValue = (attribute) => {
  let key, value;
  key = t.identifier(attribute.name.name);
  value = t.isJSXExpressionContainer(attribute.value)
    ? attribute.value.expression
    : attribute.value;
  return [key, value];
};

const getAttributeRawKeyAndValue = (attribute) => {
  const key = attribute.name.name;
  let value = attribute.value;
  while (t.isJSXExpressionContainer(value)) value = value.expression;

  return [key, value.value];
};

const detectExpressions = (children, index) => {
  if (children.length) {
    for (let i = index; i < children.length; i++) {
      const childPath = children[i];
      if (t.isJSXText(childPath.node)) continue;
      else if (t.isJSXExpressionContainer(childPath.node)) return true;
      else if (detectExpressions(childPath.get("children"), 0)) return true;
    }
  }
};

const getTagName = (openingElement) => openingElement.name.name;

const isComponent = (tagName) =>
  (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
  /^[^a-zA-Z]/.test(tagName) ||
  tagName.includes(".");

export const registerImportMethod = (path, name, moduleName) => {
  const imports =
    path.scope.getProgramParent().data.imports ||
    (path.scope.getProgramParent().data.imports = new Map());
  const moduleMethodKey = `${moduleName}:$${name}`;

  if (!imports.has(moduleMethodKey)) {
    const identifier = addNamed(path, name, moduleName, {
      nameHint: `_${name}`,
    });

    imports.set(moduleMethodKey, identifier);
    return identifier;
  }

  return t.cloneNode(imports.get(moduleMethodKey));
};

const trimWhitespace = (text) => {
  text = text.replace(/\r/g, "");
  if (/\n/g.test(text)) {
    text = text
      .split("\n")
      .map((t, i) => (i ? t.replace(/^\s*/g, "") : t))
      .filter((s) => !/^\s*$/.test(s))
      .join(" ");
  }
  return text.replace(/\s+/g, " ");
};

export const transformJsxFragment = noop;

const log = (content) => console.log(content);
