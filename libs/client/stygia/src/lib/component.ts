import {createElement, DocType, Props, TypedProps, VirtualNode} from "./stygia";

export abstract class Component<P = unknown> {
  private isComponent = true;

  protected children: any[] = [];

  protected props: TypedProps<P>;

  protected tag_name: string;

  constructor(props: TypedProps<P>) {
    this.props = props;
    this.tag_name = Object.getPrototypeOf(this).constructor.name;
  }

  get tagName(){return this.tag_name}

  getProps() {
    return this.props;
  }

  addChildren(children: any[]) {
    this.children = children;
    return this;
  }

  abstract render(): Promise<Component>;

  async wrapRender(): Promise<Component> {
    return createElement(this.tag_name, {}, await this.render());
  }

  toString(): Promise<string> {
    return this.stringify('html');
  }

  async stringify(type: DocType): Promise<string> {
    const ele = await this?.wrapRender();

    //if (ele) return (await ele.stringify(type)) ?? '';

    return '';
  }
}

///@ts-ignore
Component.prototype.isComponent = {};
