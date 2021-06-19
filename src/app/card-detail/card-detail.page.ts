import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.page.html',
  styleUrls: ['./card-detail.page.scss'],
})
export class CardDetailPage implements OnInit {

  card;

  constructor(private router: Router,
              private route: ActivatedRoute) { }

  async ngOnInit() {
    await this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.card = this.router.getCurrentNavigation().extras.state.card;
      }
    });
  }

}
