import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../services/database/database.service';
import {NavigationExtras, Router} from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  cardsSets;

  constructor(private databaseService: DatabaseService,
              private router: Router) {}

  ngOnInit(): void {
    this.getCardSets();
  }

  getCardSets(event?) {
    this.databaseService.getCardSets().then((cardSets) => {
      this.cardsSets = cardSets.values;
      if (event) {
        event.target.complete();
      }
    });
  }

  async navigateCards(cardSet) {
    const navigationExtras: NavigationExtras = {
      state: {
        cardSet
      }
    };
    await this.router.navigate(['tabs','sets','cards'], navigationExtras);
  }
}
