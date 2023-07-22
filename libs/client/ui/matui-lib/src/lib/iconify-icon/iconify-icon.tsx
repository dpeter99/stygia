import {Component, Stygia} from '@stygia/libs/client/stygia';
import style from './iconify-icon.scss';
import { IconifyIcon as IconifyData } from '@iconify/types';

export {IconifyIcon as  IconifyData} from '@iconify/types';

export class IconifyIcon extends Component<{icon:IconifyData}>{

  constructor(props: Stygia.TypedProps<{icon:IconifyData}>) {
    super(props);
  }

  render() {

    const viewBox = `${this.props.icon.left ?? 0} 0 ${this.props.icon.height} ${this.props.icon.width}`;

    return <svg viewBox={viewBox} class={style["svg-icon"]}>
        {this.props.icon.body}
        </svg>

  }
}

