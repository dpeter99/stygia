import { Stygia } from '@stygia/libs/client/stygia';

import style from "./top-app-bar.scss";


export class TopAppBar extends Stygia.Component{
  override render(): Promise<Stygia.Component> {
    return (
      <header class={style.container}>
        {this.children}
      </header>
    )
  }
}


