import { test } from './test';
import printTree from 'print-tree';
import { Stygia, VirtualNode } from './stygia/jsx-runtime';
import { Logger, LogLevel } from './stygia/logger';

Logger.setLevel(LogLevel.ERROR);

function printNodeTree(element: VirtualNode) {
  printTree(
    element,
    (node) => `${node.type} props: ${JSON.stringify(node.props)}`,
    (node) => node.children,
  );
}

const container = document.getElementById("root")

function updateName(e:InputEvent) {
  reRender((<HTMLInputElement>e.target).value);
}

function reRender(p:string) {
  const tree = test(p, updateName);
  //printNodeTree(tree);
  Stygia.render(tree, container)
}

reRender("hello")

