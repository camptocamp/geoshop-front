import { SEARCH_CATEGORY, SEARCH_CATEGORY_GENERAL } from '@app/constants';
import { ISearchResult } from '@app/models/ISearch';
import { StripHtmlPipe } from '@app/pipes/strip-html.pipe';
import { MapService } from '@app/services/map.service';
import { SearchService } from '@app/services/search.service';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteModule, MatOptgroup, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule, MatHint } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Geometry from 'ol/geom/Geometry';
import { debounceTime, switchMap} from 'rxjs/operators';




@Component({
  selector: 'gs2-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    MatProgressSpinnerModule, MatCardModule, ReactiveFormsModule, FormsModule,
    MatFormFieldModule, MatAutocompleteModule, MatIconModule, MatInputModule, MatOptgroup,
    CommonModule,MatOptionModule, MatButtonModule, MatHint,
    StripHtmlPipe  
  ],
})
export class SearchComponent implements OnInit {
  isSearchLoading = false;
  shouldDisplayClearButton = false;

  // Geocoder
  formGeocoder = new UntypedFormGroup({
    search: new UntypedFormControl('')
  });
  featureByCategory: Map<string, ISearchResult[]> = new Map<string, ISearchResult[]>();

  public get searchCtrl() {
    return this.formGeocoder.get('search');
  }

  constructor(
    private mapService: MapService,
    private readonly searchService: SearchService,
  ) {
  }

  ngOnInit(): void {
    if (this.searchCtrl) {
      this.searchCtrl.valueChanges
        .pipe(
          debounceTime(500),
          switchMap(inputText => {
            this.isSearchLoading = true;
            if (inputText.length === 0) {
              this.shouldDisplayClearButton = false;
            }
            return this.searchService.search(inputText);
          })
        )
        .subscribe(features => {
          this.isSearchLoading = false;
          this.shouldDisplayClearButton = true;
          this.featureByCategory = features.reduce((acc, feature) => {
            const categoryId = SEARCH_CATEGORY.get(feature.category) || SEARCH_CATEGORY_GENERAL;
            if (!acc.has(categoryId)) {
              acc.set(categoryId, []);
            }
            acc.get(categoryId)?.push(feature);
            return acc;
          }, new Map<string, ISearchResult[]>);
        });
    }
  }

  displayGeocoderResultWith(value: { label: string; geometry: Geometry }) {
    return value.label;
  }

  displayGeocoderResultOnTheMap(evt: MatAutocompleteSelectedEvent) {
    this.mapService.addFeatureFromGeocoderToDrawing(evt.option.value);
    this.shouldDisplayClearButton = true;
  }
}
