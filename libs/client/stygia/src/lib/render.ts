type Fiber = {
  type: string;

  dom: Node;
  parent: Fiber;
  children: Fiber[];
  props: {[i:string]:string};
}

/***
 * Creates the DOM Node for the given virtual dom fiber
 * @param fiber
 */
function createDom(fiber: Fiber): Node {
  let dom: Text | HTMLElement;
  if (fiber.type == "TEXT_ELEMENT") {
    dom = document.createTextNode("");

  } else {
    dom = document.createElement(fiber.type) as HTMLElement;
    const isProperty = (key: string) => key !== "children"
    Object.keys(fiber.props)
      .filter(isProperty)
      .forEach(name => {
        (dom as HTMLElement).setAttribute(name, fiber.props[name]);
      });
  }

  return dom
}

function render(element: Fiber, container: HTMLElement) {
  nextUnitOfWork = {
    dom: container,
    props: {},
    children: [element],
  }
}


let nextUnitOfWork: Fiber | undefined;

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)


function performUnitOfWork(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  const elements = fiber.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

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

