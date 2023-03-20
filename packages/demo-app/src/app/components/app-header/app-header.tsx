import { Stygia } from '@stygia/libs/client/stygia';
import {IconButton, TopAppBar} from "@stygia/client/ui/matui-lib";

import snowflake from "@iconify/icons-mdi/snowflake";
import {IconifyIcon} from "@stygia/client/ui/matui-lib";

export class AppHeader extends Stygia.Component {
  constructor(props: Stygia.Props) {
    super(props);
  }

  render(): Promise<Stygia.Component> {
    return <TopAppBar>
      <IconButton icon={snowflake} />
    </TopAppBar>;
  }
}


