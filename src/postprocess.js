import { callExpression } from "@babel/types";
import { registerImportMethod } from "./transform.js";
import { types as t } from "@babel/core";
export default postprocess = (path) => {
  const templateInfos = path.scope.getProgramParent().data.templateInfos;
  const config = path.hub.file.metadata.config;

  if (templateInfos) {
    const templateMethod = registerImportMethod(
      path,
      "template",
      config.moduleName
    );
    const declarators = templateInfos.map(({ identifier, template }) =>
      t.variableDeclarator(
        identifier,
        callExpression(templateMethod, [
          t.templateLiteral([t.templateElement({ raw: template })], []),
        ])
      )
    );

    path.node.body.splice(1, 0, t.variableDeclaration("var", declarators));
  }
};
