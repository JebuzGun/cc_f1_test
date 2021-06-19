import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'card-detail',
    loadChildren: () => import('./card-detail/card-detail.module').then( m => m.CardDetailPageModule)
  },
  {
    path: 'deck',
    loadChildren: () => import('./deck/deck.module').then( m => m.DeckPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
