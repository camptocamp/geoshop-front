import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable } from 'rxjs';

import { debounceTime, map, mergeMap, scan, switchMap, tap, throttleTime } from 'rxjs/operators';
import { DialogMetadataComponent } from './dialog-metadata/dialog-metadata.component';
import { IProduct } from '../../_models/IProduct';
import { ApiService } from '../../_services/api.service';
import { ConfigService } from '../../_services/config.service';


import { AppState, selectOrder } from '../../_store';


import { deepCopyOrder } from '../../_helpers/GeoshopUtils';
import { IOrder } from '../../_models/IOrder';
import { updateOrder } from '../../_store/cart/cart.action';

import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'gs2-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [
    MatFormField, ReactiveFormsModule, MatProgressSpinner, CdkVirtualScrollViewport,
    ScrollingModule, CommonModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogModule
  ],
})
export class CatalogComponent implements OnInit {

  // Infinity scrolling
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  batch = 20;
  offset = new BehaviorSubject<number | null>(null);
  infinite: Observable<IProduct[] | unknown[]>;
  total = 0;
  stepToLoadData = 0;
  readonly catalogItemHeight = 64;
  isSearchLoading = false;

  // Filtering
  catalogInputControl = new UntypedFormControl('');

  mediaUrl: string | undefined;
  order: IOrder;

  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private store: Store<AppState>,
    private elRef: ElementRef,
    private snackBar: MatSnackBar,
    private configService: ConfigService) {

    this.store.select(selectOrder).subscribe(x => this.order = x);

    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n: number) => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    this.mediaUrl = this.configService.config?.mediaUrl ? `${this.configService.config.mediaUrl}/` : '';

    this.infinite = merge(
      batchMap.pipe(map(v => Object.values(v))),
      this.catalogInputControl.valueChanges.pipe(
        debounceTime(500),
        switchMap(inputText => {
          this.isSearchLoading = true;

          if (!inputText || inputText.length < 2) {
            return this.apiService.getProducts(0, this.batch)
              .pipe(
                map((response) => {
                  this.isSearchLoading = false;
                  this.total = response ? response.count : 0;
                  return response ? response.results : [];
                })
              );
          }

          return this.apiService.find<IProduct>(inputText, 'product').pipe(
            map(response => {
              this.isSearchLoading = false;
              this.total = response ? response.count : 0;
              return response ? response.results : [];
            })
          );
        })
      )
    );
  }

  ngOnInit(): void {
    const firstElement = this.elRef.nativeElement.children[0].clientHeight;
    const heightAvailable = this.elRef.nativeElement.clientHeight - firstElement - 10;

    const numberOfRowPossible = Math.trunc(heightAvailable / this.catalogItemHeight);
    const half = Math.trunc(numberOfRowPossible / 2);
    this.stepToLoadData = numberOfRowPossible - half;
    this.batch = numberOfRowPossible + half;
  }

  addToCart(product: IProduct) {
    const order = deepCopyOrder(this.order);
    const itemsInCart = order.items.map(x => x.product_id);
    if (itemsInCart.indexOf(product.id) === -1) {
      order.items.push({
        product,
        product_id: product.id
      });
    } else {
      this.snackBar.open($localize`Le produit est déjà dans le panier`, $localize`Fermer`, { duration: 3000 });
    }
    this.store.dispatch(updateOrder({ order }));
  }

  getBatch(offset: number) {
    return this.apiService.getProducts(offset, this.batch)
      .pipe(
        tap(response => this.total = response ? response.count : 0),
        map((response) => response ? response.results : []),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.label;
            return { ...acc, [id]: cur };
          }, {});
        })
      );
  }

  nextBatch(e: number, offset: number) {
    if (offset + 1 >= this.total) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end === total) {
      this.offset.next(offset);
    }
  }

  trackByIdx(i: number) {
    return i;
  }

  openMetadata(product: IProduct) {
    this.apiService.loadMetadata(product.metadata)
      .subscribe(result => {
        if (result) {
          product.metadataObject = result;
          this.dialog.open(DialogMetadataComponent, {
            width: '60%',
            height: '90%',
            data: product.metadataObject,
            autoFocus: false,
          });
        } else {
          this.snackBar.open('Métadonnée indisponible pour le moment.', 'Fermer', { duration: 3000 });
        }
      });
  }
}
