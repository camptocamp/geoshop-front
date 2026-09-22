import {IFeed} from "@app/models/IFeed";
import {ConfigService} from "@app/services/config.service";

import {HttpClient} from "@angular/common/http";
import {Component, HostBinding} from "@angular/core";
import {MatIcon} from "@angular/material/icon";
import {MatDivider} from "@angular/material/list";
import {MatMenuItem} from "@angular/material/menu";
import {Observable, of} from "rxjs";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'gs2-product-update-feed-overlay',
  templateUrl: './product-update-feed-overlay.html',
  styleUrls: ['./product-update-feed-overlay.scss'],
  imports: [
    MatDivider,
    MatIcon,
    MatMenuItem
  ]
})
export class ProductUpdateFeedOverlayComponent {

  @HostBinding('class') class = 'overlay-container';

  protected readonly apiUrl: string | undefined;

  constructor(private readonly httpClient: HttpClient, private configService: ConfigService) {
      this.apiUrl = this.configService.config?.apiUrl;
  }

  public fetchProductUpdateFeeds(): Observable<IFeed[] | null> {
    if (!this.apiUrl) {
      console.error('API URL is not defined');
      return of(null);
    }
    const url = `${this.apiUrl}/api/feeds`;
    return this.httpClient.get<IFeed[]>(url.toString())
      .pipe(
        catchError(() => {
          return of(null);
        })
      );
  }
}
