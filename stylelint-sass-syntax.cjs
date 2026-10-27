const sass = require("postcss-sass");

const moduleLoads = new WeakMap();
const moduleLoadPattern =
  /^\s*@(?:use|forward|import)\b[^\n]*(?:\r?\n[ \t]*@(?:use|forward|import)\b[^\n]*)*\r?\n?/;

function splitModuleLoads(css) {
  const match = css.match(moduleLoadPattern);
  if (!match) {
    return "";
  }
  return match[0];
}

function linkParents(node) {
  if (!node || !node.nodes) {
    return;
  }

  for (let index = 0; index < node.nodes.length; index += 1) {
    const linked = node.nodes[index];
    if (linked.parent !== node) {
      linked.parent = node;
    }
    if (!linked.source) {
      const sourced = (linked.nodes || []).find((item) => item.source);
      linked.source = (sourced && sourced.source) || node.source;
    }
    linkParents(linked);
  }
}

module.exports = {
  parse(css, opts) {
    const root = sass.parse(css, opts);
    const loads = splitModuleLoads(css);
    moduleLoads.set(root, loads);
    root.raws.sassModuleLoads = loads;
    linkParents(root);
    return root;
  },
  stringify(node, builder) {
    const loads = moduleLoads.get(node) || (node.raws && node.raws.sassModuleLoads) || "";
    if (loads) {
      builder(loads);
    }
    sass.stringify(node, builder);
  },
};
