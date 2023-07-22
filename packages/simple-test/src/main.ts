import { test } from "./test";
import printTree from "print-tree";
import { Stygia, VirtualNode } from "./stygia/jsx-runtime";

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
  printNodeTree(tree);
  Stygia.render(tree, container)
}

reRender("hello")




const testinput = document.getElementById("test")

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

testinput.addEventListener("input", async (e)=>{
  // @ts-ignore
  let val = e.target.value;
  await delay(1000);
  // @ts-ignore
  testinput.value = val
})

