
import {IFeed} from "@app/models/IFeed";
import {ApiService} from "@app/services/api.service";

import {AsyncPipe} from "@angular/common";
import {Component, OnInit} from "@angular/core";
import {MatDivider} from "@angular/material/list";
import {MatMenuItem} from "@angular/material/menu";
import {BehaviorSubject} from "rxjs";


@Component({
  selector: 'gs2-product-update-feed-overlay',
  templateUrl: './product-update-feed-overlay.component.html',
  imports: [
    MatDivider,
    MatMenuItem,
    AsyncPipe
  ]
})
export class ProductUpdateFeedOverlayComponent implements OnInit {

  allFeeds = new BehaviorSubject<IFeed[]>([]);

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.apiService.getProductUpdateFeeds().subscribe(feeds => {
      if (feeds) {
        this.allFeeds.next(feeds);
      } else {
        console.error('Unable to retrieve product update feeds');
      }
    });
  }
}
