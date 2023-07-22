import {Stygia} from '@stygia/libs/client/stygia';
import {IconButton, TopAppBar} from "@stygia/client/ui/matui-lib";

import menu from "@iconify/icons-mdi/menu";
import {Component} from "@stygia/libs/client/stygia";

export class AppHeader extends Component {
  constructor(props: Stygia.Props) {
    super(props);
    this.tag_name = "app-header";
  }

  render() {
    return <TopAppBar>
      <IconButton icon={menu} />
      <div>

      </div>
    </TopAppBar>;
  }
}


