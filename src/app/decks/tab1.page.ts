import {Component, OnInit} from '@angular/core';
import {CardsService} from '../services/cards/cards.service';
import {DatabaseService} from '../services/database/database.service';
import {NavigationExtras, Router} from "@angular/router";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  decks = [];

  constructor(private router: Router,
              private databaseService: DatabaseService) {
  }

  ngOnInit(): void {
    this.loadDecks();
  }

  loadDecks(event?) {
    this.databaseService.getDecksList().then((decks) => {
      this.decks = decks.values;
      if (event) {
        event.target.complete();
      }
    }).catch((error) => console.log(error));
  }

  doRefresh(event) {
    this.loadDecks(event);
  }

  async openDeck(deck) {
    const navigationExtras: NavigationExtras = {
      state: {
        deck
      }
    };
    await this.router.navigate(['tabs','decks','deck'], navigationExtras);
  }

  async newDeck() {
    await this.router.navigate(['tabs','decks','deck']);
  }
}
