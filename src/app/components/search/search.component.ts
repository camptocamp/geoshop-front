import {SEARCH_CATEGORY, SEARCH_CATEGORY_GENERAL} from '@app/constants';
import {ISearchResult} from '@app/models/ISearch';
import {StripHtmlPipe} from '@app/pipes/strip-html.pipe';
import {MapService} from '@app/services/map.service';
import {SearchService} from '@app/services/search.service';

import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent, MatOptgroup} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatHint, MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import Geometry from 'ol/geom/Geometry';
import {debounceTime, switchMap} from 'rxjs/operators';


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
          this.featureByCategory = this.groupFeaturesByCategory(features);
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

  /**
   * Groups features (in terms of {@link ISearchResult}) by their category.
   *
   * @param {ISearchResult[]} features - An array of features to be grouped by category.
   * @return {Map<string, ISearchResult[]>} A map where the keys are category IDs and
   *      the values are arrays of features belonging to those categories.
   */
  private groupFeaturesByCategory(features: ISearchResult[]): Map<string, ISearchResult[]> {
    return features.reduce((acc, feature) => {
      const categoryId: string = SEARCH_CATEGORY.get(feature.category) || feature.category || SEARCH_CATEGORY_GENERAL;
      if (!acc.has(categoryId)) {
        acc.set(categoryId, []);
      }
      acc.get(categoryId)?.push(feature);
      return acc;
    }, new Map<string, ISearchResult[]>);
  }
}
