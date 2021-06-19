import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CARDS_API, X_RAPIDAPI_HOST, X_RAPIDAPI_KEY} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor(private httpClient: HttpClient) { }

  getAllCards() {
    const headers = new HttpHeaders({
      'x-rapidapi-key': X_RAPIDAPI_KEY,
      'x-rapidapi-host': X_RAPIDAPI_HOST
    });
    return this.httpClient.get(`${CARDS_API}/cards`, {headers, params: {locale: 'esMX'}});
  }
}
