import { deepCopyOrder } from '@app/helpers/GeoshopUtils';
import { IOrder } from '@app/models/IOrder';
import { IProduct } from '@app/models/IProduct';
import { ApiService } from '@app/services/api.service';
import { ConfigService } from '@app/services/config.service';
import { AppState, selectOrder } from '@app/store';
import { updateOrder } from '@app/store/cart/cart.action';
import { DialogMetadataComponent } from '@app/welcome/catalog/dialog-metadata/dialog-metadata.component';

import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';

import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, merge, of, Subject } from 'rxjs';

@Component({
  selector: 'gs2-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [
    MatFormField, ReactiveFormsModule,
    CommonModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogModule
  ],
})
export class CatalogComponent {
  stepToLoadData = 0;
  readonly catalogItemHeight = 64;
  isSearchLoading = false;

  // Filtering
  productFilter = new FormControl<string>('');
  allProducts = new BehaviorSubject<IProduct[]>([]) ;

  filteredProducts = combineLatest([this.allProducts, merge(of(""), this.productFilter.valueChanges)]).pipe(
    map(([products, query]) => products.filter((p) => query == null || query.length < 3 || p.label.indexOf(query) != -1))
  );

  mediaUrl: string | undefined;
  order: IOrder;

  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private configService: ConfigService) {

    this.store.select(selectOrder).subscribe(x => this.order = x);
    this.mediaUrl = this.configService.config?.mediaUrl ? `${this.configService.config.mediaUrl}/` : '';
    this.apiService.getProducts().pipe(map((p) => p?.results ?? [])).subscribe(this.allProducts);
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
