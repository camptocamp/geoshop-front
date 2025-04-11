import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

import { IConfig } from '../_models/IConfig';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public config: IConfig | undefined;

  constructor(private http: HttpClient) {
  }

  load() {
    return this.http.get<IConfig>('assets/configs/config.json').pipe(
      map((config) => {
        this.config = config;
        if (this.config?.apiUrl.endsWith('/')) {
          this.config.apiUrl = this.config.apiUrl.substr(0, this.config.apiUrl.length - 1);
        }
        return config
      }));
  }
}
