import {Component} from "./component";
import {DocType, Props, VirtualNode} from "./stygia";

type NativeTags =
  "img";

const selfClosing : NativeTags[] = ['img'];

export class NativeComp extends Component {
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
      if (selfClosing.includes(this.tag))
        return `<${this.tag}${this.props_string()}/>`;

    return `<${this.tag}${this.props_string()}>
          ${await this.children_string(type)}
       </${this.tag}>`;
  }

  render() {
    return Promise.resolve(this);
  }
}
