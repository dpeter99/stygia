import {Component, Stygia} from '@stygia/libs/client/stygia';
import style from './icon-button.scss';
import {IconifyIcon, IconifyData} from "../iconify-icon/iconify-icon";

export class IconButton extends Component<{icon:IconifyData}>{

  constructor(props: Stygia.TypedProps<{icon:IconifyData}>) {
    super(props);
  }

  render() {

    return (
      <button class={style.button}>
        <IconifyIcon icon={this.props.icon} />
      </button>
    )

  }
}

