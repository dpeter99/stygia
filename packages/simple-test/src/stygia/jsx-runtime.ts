//import printTree from "print-tree";
import { Logger } from "./logger"
import { unique } from "webpack-merge";

export abstract class BaseComponent {
  private isComponent = true;
  protected props: Props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(props: Props) {
    this.props = props;
    Logger.error('Constructing: ', this);
  }

  abstract render();

  setProps(props: Props) {
    this.props = props;
  }
}
BaseComponent.prototype["isComponent"] = true;

type Props = {[i: string]: unknown}

const propMarker: unique symbol = Symbol();
type Prop<T> = T & { [propMarker]: true };

type UnProp<TProp> = TProp extends Prop<infer T> ? T : TProp;

export function P<T>(value: T): Prop<T> {
  const prop = Object.defineProperty((value as Prop<T>),propMarker, {});
  return prop;
}

type ComponentProps<TComp> = PickProps<TComp>;
type RawComponentProps<TComp> = RawProps<PickProps<TComp>>;
type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}
type PickProps<T> =
  PickByType<T, Prop<string>>
& PickByType<T, Prop<object>>

type RawProps<TProps> = {
  [P in keyof TProps]: UnProp<TProps[P]>
}

abstract class Component<TSelf> extends BaseComponent{
  protected props: RawComponentProps<TSelf>;
  constructor(props:RawComponentProps<TSelf>) {
    super(props as Props);
    Object.keys(this.props).forEach((k)=>this[k] = P(this.props[k]));
  }

}

export class TestComponent extends Component<TestComponent>{
  public user: Prop<string>;
  public test: Prop<{ name:string, age: number }>
  render(){
    return Stygia.createElement('p',{}, this.props.user);
  }
}





type ComponentTypes = string | ((prop:Props)=>VirtualNode) | (new (props:Props) => BaseComponent);

export type VirtualNode = {
  type: ComponentTypes;
  props: Props;
  children: VirtualNode[];
  _owner?: BaseComponent;
}

function shouldConstruct(tag: Exclude<ComponentTypes, string>): tag is (new (props:Props) => BaseComponent) {
  Logger.info(`Tag: ${tag.name} has "isComponent": ${Object.getPrototypeOf(tag).isComponent}`)
  return tag.prototype.isComponent ?? false;
}
function createElement(
  tag: ComponentTypes,
  props?: Props,
  ...children: (VirtualNode | string)[]
): VirtualNode {
  const childNodes = children.map((child) => {
    return typeof child === 'object' && 'type' in child
      ? child
      : createTextElement(child);
  });

  return {
    type: tag,
    props: props ?? {},
    children: childNodes ?? [],
  };
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
    type: "root",
    props: {},
    dom: container,
    children: [element],
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
  const isFunctionComponent =
    fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
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


function updateFunctionComponent(fiber:Fiber) {
  if(!(fiber.type instanceof Function))
    return;

  if(shouldConstruct(fiber.type)){
    if(!fiber._owner)
      fiber._owner = new fiber.type(fiber.props);

    fiber._owner.setProps(fiber.props);

    fiber.children = [fiber._owner.render()];
  }
  else{
    fiber.children = [fiber.type(fiber.props)];
  }

}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.children)
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
        ...oldFiber,
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
  Logger.info(printFiberTree(1, wipRoot));
  commitWork(wipRoot.child)
  currentRoot = wipRoot;
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    Logger.info(`Updating`, fiber.dom, "old props:", fiber.alternate.props, "new props:", fiber.props);
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}


const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      Logger.info(`Removing event listener: ${eventType}`);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      Logger.info(`Removing property: ${name}`);
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      Logger.info(`Adding property: ${name}`);
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      Logger.info(`Adding event listener: ${eventType}`);
      dom.addEventListener(eventType, nextProps[name]);
    });
}


function createDom(element:VirtualNode){
  let dom: Node | HTMLElement;
  if(element.type === "TEXT_ELEMENT"){
    dom = document.createTextNode(<string>element.props.nodeValue)
  }
  else{
    dom = createDomElement(element);
  }

  updateDom(dom,{},element.props);

  return dom;
}

function createDomElement(element: VirtualNode) {
  const dom = document.createElement(element.type.toString());

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
