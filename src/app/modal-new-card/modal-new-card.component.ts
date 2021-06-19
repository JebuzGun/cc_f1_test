import {Component, OnInit} from '@angular/core';
import {LoadingController, ModalController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DatabaseService} from '../services/database/database.service';


@Component({
  selector: 'app-modal-new-card',
  templateUrl: './modal-new-card.component.html',
  styleUrls: ['./modal-new-card.component.scss']
})
export class ModalNewCardComponent implements OnInit {

  newCardForm: FormGroup;
  spellSchools: any[] = [];
  types: any[] = [];
  playersClass: any[] = [];

  constructor(private modalCtrl: ModalController,
              private databaseService: DatabaseService,
              private loadingCtrl: LoadingController,
              private formBuilder: FormBuilder) {
    this.newCardForm = this.formBuilder.group({
      artist: [''],
      attack: [''],
      cardSet: ['Ashes of Outland'],
      collectible: [''],
      cost: ['', Validators.compose([Validators.required])],
      dbfId: [''],
      flavor: [''],
      health: [''],
      id: ['', Validators.compose([Validators.required])],
      img: [''],
      lastModified: [undefined],
      locale: ['esMX'],
      name: ['', Validators.compose([Validators.required])],
      playerClass: [''],
      rarity: [''],
      spellSchool: [''],
      text: [''],
      type: [''],
    });
  }

  async ngOnInit() {
    await this.getOptionsForForm();
    this.newCardForm.controls.name.valueChanges.subscribe((value) => {
      if (value.length >= 1) {
        const dateTime = new Date().getTime();
        this.newCardForm.controls.id.setValue(`${value}-${dateTime}`);
      }
    });
  }

  async dismissModal() {
    await this.modalCtrl.dismiss();
  }

  async getOptionsForForm() {
    const arrayDBCalls = [
      await this.databaseService.getSpellSchool(),
      await this.databaseService.getType(),
      await this.databaseService.getPlayerClass()
    ];
    await Promise.all(arrayDBCalls).then((results) => {
      this.spellSchools = results[0].values.filter((el) => el.spellSchool !== null);
      this.types = results[1].values.filter((el) => el.type !== null);
      this.playersClass = results[2].values.filter((el) => el.playerClass !== null);
    });
  }

  async postNewCard() {
    const loading = await this.loadingCtrl.create({
      message: 'Agregando cartas al mazo, por favor espere',
      spinner: 'lines'
    });
    await loading.present();
    await this.databaseService.addNewCard(this.newCardForm.value).then((result) => {
      loading.dismiss();
      this.modalCtrl.dismiss({result, ok: true});
    });
  }
}
