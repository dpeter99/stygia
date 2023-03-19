import { Stygia } from '@stygia/libs/client/stygia';
import style from './app-layout.scss';

export class AppLayout extends Stygia.Component {
  constructor(props: Stygia.Props) {
    super(props);
  }

  render(): Promise<Stygia.Component> {
    return (
      <div class={style.app}>
        <div class="header">{this.props.header}</div>
      </div>
    );
  }
}
