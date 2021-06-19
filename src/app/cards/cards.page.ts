import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {DatabaseService} from '../services/database/database.service';
import {IonRouterOutlet, ModalController} from '@ionic/angular';
import {ModalNewCardComponent} from '../modal-new-card/modal-new-card.component';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {

  cardSet: string;
  cards: any[];
  defaultImage = '../../assets/stone.png';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private modalCtrl: ModalController,
              private routerOutlet: IonRouterOutlet,
              private databaseService: DatabaseService) { }

  async ngOnInit() {
    await this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.cardSet = this.router.getCurrentNavigation().extras.state.cardSet;
      }
    });
    this.getCards();
  }

  getCards() {
    this.databaseService.getCardsOfCardSet(this.cardSet).then((cards) => {
      this.cards = cards.values;
    });
  }

  async seeCardDetail(card) {
    const navigationExtras: NavigationExtras = {
      state: {
        card
      }
    };
    await this.router.navigate(['tabs','sets','card'], navigationExtras);
  }

  async newCard() {
    const modalCtrl = await this.modalCtrl.create({
      component: ModalNewCardComponent,
      backdropDismiss: false,
      cssClass: 'modal-new-card'
    });
    await modalCtrl.present().catch((error) => console.log(error));
    modalCtrl.onDidDismiss().then((result) => {
      if (result.data.ok) {
        this.getCards();
      }
    });
  }
}
