import { Stygia } from '@stygia/libs/client/stygia';
import { AppHeader } from './components/app-header/app-header';
import { AppLayout } from './components/app-layout/app-layout';

export const index = () => (
  <AppLayout>
    <AppHeader st:slot="header" />
  </AppLayout>
);
