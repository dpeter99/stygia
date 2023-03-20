import { Stygia } from '@stygia/libs/client/stygia';
import style from './icon-button.scss';
import {IconifyIcon} from "../iconify-icon/iconify-icon";

export class IconButton extends Stygia.Component{

  constructor(props: Stygia.Props) {
    super(props);
  }

  render(): Promise<Stygia.Component> {

    return (
      <button class={style.button}>
        <IconifyIcon icon={this.props.icon} />
      </button>
    )

  }
}

