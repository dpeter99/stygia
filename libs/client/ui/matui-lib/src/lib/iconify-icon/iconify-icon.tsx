import { Stygia } from '@stygia/libs/client/stygia';
import style from './iconify-icon.scss';

export class IconifyIcon extends Stygia.Component{

  constructor(props: Stygia.Props) {
    super(props);
  }

  render(): Promise<Stygia.Component> {

    const viewBox = `${this.props.icon.left ?? 0} ${this.props.icon.right ?? 0} ${this.props.icon.height} ${this.props.icon.width}`;

    return <svg viewBox={viewBox} class={style["svg-icon"]}>
        {this.props.icon.body}
        </svg>

  }
}

