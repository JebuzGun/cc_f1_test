import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

import { CapacitorSQLite } from '@capacitor-community/sqlite';
import {Storage} from '@capacitor/storage';
import {Capacitor} from '@capacitor/core';
import {BehaviorSubject, forkJoin, from, of} from 'rxjs';

import {CardsService} from '../cards/cards.service';
import {switchMap} from "rxjs/operators";

const DB_SETUP_KEY = 'first_db_setup';
const DB_NAME_KEY = 'db_name';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  dbReady = new BehaviorSubject(false);
  private platform: string;
  private dbName: string;

  constructor(private http: HttpClient,
              private cardsService: CardsService,
              private alertCtrl: AlertController) {
  }

  async init(): Promise<void> {
    this.platform = Capacitor.getPlatform();
    if (this.platform === 'android') {
      try {
        const sqlite = CapacitorSQLite as any;
        await sqlite.requestPermissions();
        await this.setupDatabase();
      } catch (e) {
        const alert = await this.alertCtrl.create({
          header: 'Sin acceso a la DB',
          message: 'Esta app no puede funcionar sin este permiso.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      await this.setupDatabase();
    }
  }

  async getCardList() {
    const statement = 'SELECT * FROM cards ORDER BY id;';
    return CapacitorSQLite.query({statement, values: [], database: this.dbName});
  }

  async getCardSets() {
    const statement = 'SELECT DISTINCT cardSet FROM cards ORDER BY cardSet;';
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

  async getSpellSchool() {
    const statement = 'SELECT DISTINCT spellSchool FROM cards ORDER BY spellSchool;';
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

  async getType() {
    const statement = 'SELECT DISTINCT type FROM cards ORDER BY type;';
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

  async getPlayerClass() {
    const statement = 'SELECT DISTINCT playerClass FROM cards ORDER BY playerClass;';
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

  async getCardsOfCardSet(cardSet) {
    const statement = `SELECT * FROM cards WHERE cardSet='${cardSet}' ORDER BY cardSet;`;
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

//TODO: Create abstract method for queries to an table by Id
  async getCardById(id) {
    const statement = `SELECT * FROM cards WHERE id='${id}';`;
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName})).values[0];
  }

  async getDecksList() {
    const statement = `SELECT * FROM decks ORDER BY id;`;
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

  async getDeckCardsById(id) {
    const statement = `SELECT * FROM cards_decks WHERE id_deck ='${id}' ORDER BY id_card;`;
    return (await CapacitorSQLite.query({statement, values: [], database: this.dbName}));
  }

  async addNewDeck(id, name) {
    const statement = `INSERT INTO decks (id, name) VALUES ('${id}','${name}');`;
    return (await CapacitorSQLite.execute({ statements: statement, database: this.dbName}));
  }

  async addCardToDeck(idCard, idDeck) {
    const statement = `INSERT INTO cards_decks (id_card, id_deck) VALUES ('${idCard}', '${idDeck}');`;
    return (await CapacitorSQLite.execute({ statements: statement, database: this.dbName}));
  }

  async addNewCard(card) {
    // eslint-disable-next-line max-len
    const statement = `INSERT INTO cards (artist, attack, cardSet, collectible, cost, dbfId, flavor, health, id, img,
    last_modified, locale, name, playerClass, rarity, spellSchool, text, type) VALUES ('${card.artist}',${card.attack},
    '${card.cardSet}','${card.collectible}',${card.cost},'${card.dbfId}','${card.flavor}',${card.health},'${card.id}','${card.img}','${card.lastModified}',
    '${card.locale}','${card.name}','${card.playerClass}','${card.rarity}','${card.spellSchool}', '${card.text}', '${card.type}');`;
    return (await CapacitorSQLite.execute({ statements: statement, database: this.dbName}));
  }

  async deleteCardFromDeck(cardId, deckId, lastModified) {
    const statement = `DELETE FROM cards_decks WHERE id_card='${cardId}' AND id_deck ='${deckId}' AND last_modified=${lastModified};`;
    return (await CapacitorSQLite.execute({statements: statement, database: this.dbName}));
  }

  private async setupDatabase() {
    const dbSetupDone = await Storage.get({key: DB_SETUP_KEY});
    if (!dbSetupDone.value) {
      this.downloadDatabase();
    } else {
      this.dbName = (await Storage.get({key: DB_NAME_KEY})).value;
      await CapacitorSQLite.createConnection({database: this.dbName});
      await CapacitorSQLite.open({database: this.dbName});
      this.dbReady.next(true);
    }
  }

  private downloadDatabase() {
    // Getting the db structure and the data
    forkJoin([this.http.get('assets/db.json'), this.cardsService.getAllCards()]).subscribe(async (callsArray: any) => {
      let jsonToImport = callsArray[0];
      const cardsFromServer = callsArray[1];
      // Filling the array of the table "cards"
      await Object.keys(cardsFromServer).map((key: string) => {
        cardsFromServer[key].forEach((card) => {
          if (card.cardId && card.type !== 'hero') {
            let mechanics;
            if (typeof card.mechanics === 'object' && card.mechanics !== null) {
              mechanics = JSON.stringify(card.mechanics);
            }
            jsonToImport.tables[0].values.push([
              card.cardId, card.artist, card.attack, card.cardSet, card.collectible, card.cost,
              card.dbfId, card.flavor, card.health, card.img, card.locale, mechanics, card.name,
              card.playerClass, card.rarity, card.spellSchool, card.text, card.type, undefined
            ]);
          }
        });
      });
      // Validating the data in the "jsonToImport"
      const jsonString = JSON.stringify(jsonToImport);
      const isValid = await CapacitorSQLite.isJsonValid({jsonstring: jsonString});
      if (isValid.result) {
        await Storage.set({key: DB_NAME_KEY, value: 'hearthstone-deck-db'});
        this.dbName = 'hearthstone-deck-db';
        await CapacitorSQLite.createConnection({database: this.dbName});
        await CapacitorSQLite.open({database: this.dbName});
        await CapacitorSQLite.importFromJson({jsonstring: jsonString});
        await Storage.set({key: DB_SETUP_KEY, value: '1'});
        this.dbReady.next(true);
      }
    }, error => {
      console.log(error);
    });
  }
}
