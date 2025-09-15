import type Block from "./Block";

export function render(rootQuery: string, block: Block) {
  const root = document.querySelector(rootQuery);
  if (!root) throw new Error(`Root ${rootQuery} not found`);
  root.innerHTML = "";
  const content = block.getContent();
  if (content) {
    root.append(content);
  }
  block.dispatchComponentDidMount?.();
}

export const isEqual = (a: string, b: string) => a === b;
