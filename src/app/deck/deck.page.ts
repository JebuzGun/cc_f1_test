import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {DatabaseService} from '../services/database/database.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-deck',
  templateUrl: './deck.page.html',
  styleUrls: ['./deck.page.scss'],
})
export class DeckPage implements OnInit {

  deckId: string;
  deckName: string;
  deckRaw: any[] = [];
  deckContent: any[] = [];
  nameControl: FormControl = new FormControl();

  cardSets = [];
  cards = [];
  selectedCardSet;
  selectedCards: any[] = [];

  addingCards = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private databaseService: DatabaseService,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    await this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.deckId = this.router.getCurrentNavigation().extras.state.deck.id;
        this.deckName = this.router.getCurrentNavigation().extras.state.deck.name;
        this.getDeckCardsById(this.deckId);
      }
    });
    this.databaseService.getCardSets().then((result) => {
      this.cardSets = result.values;
    });
  }

  addCards() {
    this.addingCards = true;
  }

  mapToProp(data, prop) {
    return data.reduce((res, item) => Object.assign(res, {[item[prop]]: 1 + (res[item[prop]] || 0)}), Object.create(null));
  }

  async addNewCards() {
    const currentAndFutureCards = this.deckContent.concat(this.selectedCards);
    const verifyRepeated = this.mapToProp(currentAndFutureCards, 'name');
    for (const key of Object.keys(verifyRepeated)) {
      if (verifyRepeated[key] > 4) {
        const toast = await this.toastCtrl.create({
          message: 'No se puede tener más de 4 copias de una carta, por favor edite su selección para continuar',
          color: 'danger',
          duration: 10000,
          position: 'bottom'
        });
        await toast.present();
        return;
      }
    }
    const loading = await this.loadingCtrl.create({
      message: 'Agregando cartas al mazo, por favor espere',
      spinner: 'circles'
    });
    await loading.present();
    if (!this.deckName && this.deckContent.length === 0) {
      this.deckId = 'deck-' + new Date().getTime();
      await this.databaseService.addNewDeck(this.deckId ,this.nameControl.value);
    }
    const promiseArray = [];
    await this.selectedCards.forEach((card) => {
      promiseArray.push(this.databaseService.addCardToDeck(card.id, this.deckId));
    });
    Promise.all(promiseArray).then(async () => {
      this.addingCards = false;
      this.selectedCards = [];
      await this.getDeckCardsById(this.deckId);
      await loading.dismiss();
    }).catch(() => loading.dismiss());
  }

  async cardSetChange() {
    await this.databaseService.getCardsOfCardSet(this.selectedCardSet.cardSet).then((result) => {
      this.cards = result.values;
      this.selectedCards = [];
    });
  }

  async getDeckCardsById(id) {
    this.databaseService.getDeckCardsById(id).then(async (deck) => {
      let queriesArray = [];
      this.deckRaw = deck.values;
      deck.values.forEach((cardDeck) => {
        queriesArray.push(this.databaseService.getCardById(cardDeck.id_card));
      });
      Promise.all(queriesArray).then((cardQueriesArray) => {
        this.deckContent = cardQueriesArray;
      });
    });
  }

  async delete(item, slidingItem) {
    const indexInRaw = this.deckRaw.findIndex((raw) => raw.id_card === item.id);
    this.databaseService.deleteCardFromDeck(this.deckRaw[indexInRaw].id_card, this.deckRaw[indexInRaw].id_deck, this.deckRaw[indexInRaw].last_modified).then(async () => {
      const toast = await this.toastCtrl.create({
        message: 'Carta eliminada',
        color: 'success',
        duration: 4000,
        position: 'bottom'
      });
      await toast.present();
      await this.getDeckCardsById(this.deckId);
      slidingItem.close();
    });
  }

  addDuplicated(card, slidingItem) {
    this.addingCards = true;
    this.selectedCards.push(card);
    slidingItem.close();
  }

  cardChange(event) {
    if (this.deckName && this.deckContent.length > 0) {
      //verify quantity max permitted
    }
  }
}
