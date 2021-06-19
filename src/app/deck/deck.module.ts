import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeckPageRoutingModule } from './deck-routing.module';

import { DeckPage } from './deck.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyLoadImageModule,
    DeckPageRoutingModule,
    IonicSelectableModule,
    ReactiveFormsModule
  ],
  declarations: [DeckPage]
})
export class DeckPageModule {}
