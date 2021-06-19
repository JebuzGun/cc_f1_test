import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'decks',
        children: [
          {
            path: '',
            loadChildren: () => import('../decks/tab1.module').then(m => m.Tab1PageModule)
          },
          {
            path: 'deck',
            loadChildren: () => import('../deck/deck.module').then(m => m.DeckPageModule),
          }
        ]
      },
      {
        path: 'sets',
        children: [
          {
            path: '',
            loadChildren: () => import('../sets/tab2.module').then(m => m.Tab2PageModule),
          },
          {
            path: 'cards',
            loadChildren: () => import('../cards/cards.module').then(m => m.CardsPageModule),
          },
          {
            path: 'card',
            loadChildren: () => import('../card-detail/card-detail.module').then(m => m.CardDetailPageModule),
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/decks',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/decks',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
