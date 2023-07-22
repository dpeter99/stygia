//import printTree from "print-tree";

export abstract class Component{
  private isComponent = true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(props: Props) {}

  abstract render();
}
Component.prototype["isComponent"] = true;

type Props = {[i: string]: unknown}

type ComponentTypes = string | ((prop:Props)=>VirtualNode) | (new (props:Props) => Component);

export type VirtualNode = {
  type: string;
  props: Props;
  children: VirtualNode[];
  _owner?: Component;
}

function shouldConstruct(tag: Exclude<ComponentTypes, string>): tag is (new (props:Props) => Component) {
  // console.log(`Tag: ${tag.name} has "isComponent": ${Object.getPrototypeOf(tag).isComponent}`)
  return tag.prototype.isComponent ?? false;
}
function createElement(
  tag: ComponentTypes,
  props?: Props,
  ...children: (VirtualNode | string)[]
): VirtualNode{

  const childNodes = children.map((child) => {
    return typeof child === 'object' ? child : createTextElement(child);
  });

  let virtualTag: VirtualNode = {
    type: "asd",
    props: props ?? {},
    children: childNodes ?? [],
  };

  if(typeof tag === 'function'){
    if(shouldConstruct(tag)){
      virtualTag._owner = new tag(props);
      virtualTag.children = [virtualTag._owner.render()];
    }
    else{
      virtualTag = tag(props);
    }
  }
  else if(typeof tag === 'string'){
    virtualTag.type = tag;
  }

  return virtualTag

}

function createTextElement(text:string): VirtualNode {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
    },
    children: [],
  }
}




type Fiber = VirtualNode & {
  dom?: Node;
  parent?: Fiber;
  sibling?: Fiber;
  child?: Fiber;
  alternate?: Fiber;
  effectTag: "UPDATE" | "PLACEMENT" | "DELETION",
}

function printFiberTree(depth: number, fiber: Fiber) {
  if(!fiber)
    return "";

  let res = printFiber(depth, fiber);

  res += printFiberTree(depth + 1, fiber.child)
  res += printFiberTree(depth, fiber.sibling)

  return res;

  function printFiber(depth: number,fiber: Fiber) {
    return (
      "-".repeat(depth) +
      `${fiber.type ?? "?"} tag: ${fiber.effectTag} props: ${JSON.stringify(
        fiber.props
      )}\n`
    );
  }
}

let nextUnitOfWork: Fiber = null;
let currentRoot: Fiber = null;
let wipRoot: Fiber = null;
let deletions = null


function render(element:VirtualNode, container: HTMLElement) {
  wipRoot = {
    ...element,
    dom: container,
    alternate: currentRoot,
    effectTag: "UPDATE",
  }
  deletions = []
  nextUnitOfWork = wipRoot;
}

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber: Fiber): Fiber {
  if(!fiber.dom){
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.children ?? [];
  reconcileChildren(fiber, elements);


  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

/**
 * Reconciles the children of the given fiber
 * @param wipFiber The parent fiber for the children that need to be updated
 */
function reconcileChildren(wipFiber: Fiber, elements: VirtualNode[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        children: element.children,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        children: element.children,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function remakeChildren(wipFiber: Fiber) {
  let index = 0
  let prevSibling: Fiber = null

  while (index < wipFiber.children.length) {
    const element = wipFiber.children[index]

    const newFiber: Fiber = {
      ...element,
      parent: wipFiber,
      dom: null,
      effectTag: "PLACEMENT",
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

}


function commitRoot(){
  deletions.forEach(commitWork)
  console.log(printFiberTree(1, wipRoot));
  commitWork(wipRoot.child)
  currentRoot = wipRoot;
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    console.log(`Updating`, fiber.dom, "old props:", fiber.alternate.props, "new props:", fiber.props);
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  }

  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}


const isEvent = key => key.startsWith("on")
const isProperty = key =>
  key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

function updateDom(dom: HTMLElement, prevProps, nextProps) {

  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      console.log(`Removing event listener: ${eventType}`)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      console.log(`Removing property: ${name}`)
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      console.log(`Adding property: ${name}`)
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      console.log(`Adding event listener: ${eventType}`)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}


function createDom(element:VirtualNode){
  let dom: Node | HTMLElement;
  if(element.type === "TEXT_ELEMENT"){
    dom = document.createTextNode(<string>element.props.nodeValue)
  }
  else{
    const htmlElement = createDomElement(element);
    updateDom(htmlElement,{},element.props);

    dom = htmlElement
  }

  return dom;
}

function createDomElement(element: VirtualNode) {
  const dom = document.createElement(element.type);

  const isProperty = (key) => key !== 'children';
  Object.keys(element.props ?? {})
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  //element.children.forEach((child) => render(child, dom));
  return dom;
}







export const Stygia = {
  createElement,
  render
}
