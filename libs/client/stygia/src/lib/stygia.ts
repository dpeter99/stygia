import {hasProp} from "./utils/object.utils";

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

export abstract class Component {
  protected children: any[] = [];
  protected props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  getProps() {
    return this.props;
  }

  addChildren(children: any[]) {
    this.children = children;
    return this;
  }

  abstract render(): Promise<Component | null>;

  toString(): Promise<string> {
    return this.stringify('html');
  }

  async stringify(type: DocType): Promise<string> {
    const ele = await this?.render();

    if (ele) return (await ele.stringify(type)) ?? '';

    return '';
  }
}

export class NativeComp extends Component {
  static readonly selfClosing = ['img'];

  public tag: any;

  constructor(tag: string, props: Props, children: any[]) {
    super(props);
    this.tag = tag;
    this.props = props ?? {};
    this.children = children;
  }

  propValueString(k: string, value: any) {
    if (typeof value === 'boolean' || value === null) {
      if (value) return ` ${k}`;
      else return ``;
    }

    const prefix = (val: string, key: string = k) => ` ${key}="${val}"`;

    //if(k === 'style')
    //    return new Style(value).toString();

    if (value instanceof Function)
      if (this.props['IIFE'])
        return ''; //prefix(minify('js', `(${this.props[k].toString()})()`))
      else return ''; //prefix(minify('js', `${this.props[k].name.toString()}`), `bind:${k}`)

    return prefix(value.toString());
  }

  protected props_string() {
    if (!this.props) return '';

    return Object.keys(this.props)
      .filter((k) => this.props[k] !== undefined && this.props[k] !== null)
      .map((k) => `${this.propValueString(k, this.props[k])}`)
      .join('');
  }

  async children_string(
    type: DocType,
    children: any[] = this.children
  ): Promise<string> {
    const concat = children.map(async (c) => {
      if (c instanceof Promise) c = await c;

      if (typeof c === 'string') return c;
      if (c instanceof Promise) return await c;
      if (c instanceof Component) return await c.stringify(type);
      if (c instanceof Array) return await this.children_string(type, c);
      //if (this.tag === 'script' && this.props['IIFE'] && c instanceof Function)
      //    return minify('js', `\n(${c})();\n`);

      return c;
    });
    const finished = await Promise.all(concat);

    return finished.join('');
  }

  override async stringify(type: DocType = 'html'): Promise<string> {
    if (!this.tag || this.tag == '')
      return `${await this.children_string(type)}`;

    if (this.children == undefined || this.children.length <= 0)
      if (NativeComp.selfClosing.includes(this.tag))
        return `<${this.tag}${this.props_string()}/>`;

    return `<${this.tag}${this.props_string()}>
          ${await this.children_string(type)}
       </${this.tag}>`;
  }

  render(): Promise<Component> {
    return Promise.resolve(this);
  }
}

///@ts-ignore
Component.prototype.isComponent = {};

function shouldConstruct(type: any) {
  if (type == '' || type == undefined) return false;
  const prototype = type.prototype;
  return !!(prototype && prototype.isComponent);
}

export type Props = {
  [key: string]: any;
};

export type ComponentTypes = Component | string;

export function createElement(
  tag: any,
  props?: Props,
  ...children: ComponentTypes[]
): any {
  const slots = {};
  if (children.length > 0) {
    children
      .forEach((comp) => {

        if(!!comp && typeof comp === 'object' && hasProp(comp.getProps(),'st:slot')){
          slots[comp.getProps()['st:slot']] = comp;
          delete comp.getProps()['st:slot'];
        }

        return false;
      });
  }

  props = {
    ...(props ?? {}),
    ...slots,
  };

  // It is a class constructor
  if (shouldConstruct(tag)) {
    return new tag(props).addChildren(...children);
  }

  // It is a function component
  if (typeof tag === 'function') return tag(props, ...children);

  return new NativeComp(tag, props, children);
}
