import { Component } from '@angular/core';
import {LoadingController, Platform} from '@ionic/angular';
import {DatabaseService} from './services/database/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform,
              private databaseService: DatabaseService,
              private loadingCtrl: LoadingController) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      const loading = await this.loadingCtrl.create({
        message: 'Cargando información, por favor espere',
        spinner: 'circles'
      });
      await loading.present();
      await this.databaseService.init();
      this.databaseService.dbReady.subscribe(isReady => {
        if (isReady) {
          loading.dismiss();
        }
      });
    });
  }
}
