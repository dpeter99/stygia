import {Stygia} from '@stygia/libs/client/stygia';
import style from './app-layout.scss';
import {Component} from "@stygia/libs/client/stygia";

export class AppLayout extends Component {
  constructor(props: Stygia.Props) {
    super(props);
  }

  render() {
    return (
      <div class={style.app}>
        <div class="header">{this.props.header}</div>
      </div>
    );
  }
}
