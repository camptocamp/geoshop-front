import { deepCopyOrder } from '@app/helpers/GeoshopUtils';
import { IOrder } from '@app/models/IOrder';
import { IProduct } from '@app/models/IProduct';
import { ApiService } from '@app/services/api.service';
import { ConfigService } from '@app/services/config.service';
import { AppState, selectOrder } from '@app/store';
import { updateOrder } from '@app/store/cart/cart.action';
import { DialogMetadataComponent } from '@app/welcome/catalog/dialog-metadata/dialog-metadata.component';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'gs2-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [
    MatFormFieldModule, ReactiveFormsModule,
    CommonModule, MatInputModule, MatIconModule, MatButtonModule, MatDialogModule
  ],
})
export class CatalogComponent implements OnInit {
  stepToLoadData = 0;
  readonly catalogItemHeight = 64;
  isSearchLoading = false;

  // Filtering
  productFilter = new FormControl<string>('');
  allProducts = new BehaviorSubject<IProduct[]>([]);

  filteredProducts = combineLatest([
    this.allProducts,
    this.productFilter.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([products, query]) => {
      const filterQuery = query?.toLowerCase() ?? '';
      return products.filter(
        (p) => filterQuery.length < 3 || p.label.toLocaleLowerCase().includes(filterQuery));
    }));

  mediaUrl: string | undefined;
  order: IOrder;

  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private configService: ConfigService) {

    this.store.select(selectOrder).subscribe(x => this.order = x);
    this.mediaUrl = this.configService.config?.mediaUrl ? `${this.configService.config.mediaUrl}/` : '';
  }

  ngOnInit() {
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
    console.log("HERE", i);
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
