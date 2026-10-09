const sass = require("postcss-sass");

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
    linkParents(root);
    return root;
  },
  stringify: sass.stringify,
};
