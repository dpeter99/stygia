import {Component} from "./component";
import {hasProp} from "./utils/object.utils";
import {NativeComp} from "./nativeComp";

export type DocType = 'html';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}



function shouldConstruct(type: ComponentTypes): type is typeof Component  {
  if (type == '' || type == undefined || typeof type == 'string' ) return false;
  //const prototype = type.prototype;
  return type.prototype["isComponent"];
}

export type Props = { [key: string]: any; };

export type TypedProps<T> = Props & T;


type Constructor<T> = new (...args: any[]) => T;

export type ComponentTypes = typeof Component | ((props?:Props, ...children:Component[])=>Component) | string | null;

export type VirtualNode = {
  type: string;
  props: {[i: string]: unknown};
  companion?: Component;
  children: VirtualNode[];
}

export function createElement(
  tag: ComponentTypes,
  props?: Props,
  ...children: Component[]
): any {
  const slots = {};

  /*
  if (children.length > 0) {
    children
      .forEach((comp) => {

        if(!!comp && typeof comp === 'object' && hasProp(comp.getProps(),'st:slot')){
          slots[comp.getProps()['st:slot']] = comp;
          delete comp.getProps()['st:slot'];
        }

        return false;
      });
  }*/

  props = {
    ...(props ?? {}),
    ...slots,
  };

  // It is a class constructor
  if (shouldConstruct(tag)) {
    const compConst = tag as Constructor<Component>;
    return new compConst(props).addChildren(children);
  }
  else if (typeof tag === 'function'){
    return tag(props, ...children);
  }

  return new NativeComp(tag ?? 'div', props, children);
}
