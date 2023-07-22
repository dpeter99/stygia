import {Component, Stygia} from '@stygia/libs/client/stygia';

import style from "./top-app-bar.scss";
import {Elevation} from "../elevation/elevation";


export class TopAppBar extends Component{
  override render() {
    return (
      <header class={style.container}>
        <Elevation/>

        {this.children}
      </header>
    )
  }
}
