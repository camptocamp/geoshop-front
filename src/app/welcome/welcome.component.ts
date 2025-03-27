import { Component, ChangeDetectorRef, OnDestroy, HostBinding } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MapService } from '../_services/map.service';
import { AppState, getUser } from '../_store';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { IIdentity } from '../_models/IIdentity';
import { AngularSplitModule } from 'angular-split';
import { CatalogComponent } from './catalog/catalog.component';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'gs2-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [
    AngularSplitModule, CatalogComponent, MapComponent,
  ],
})
export class WelcomeComponent implements OnDestroy {

  @HostBinding('class') class = 'main-container';

  leftPositionForButtons = 30;
  isCatalogVisible = true;
  mobileQuery: MediaQueryList;

  private mobileQueryListener: () => void;
  private user$ = new BehaviorSubject<Partial<IIdentity> | null>(null);

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private mapService: MapService,
    private store: Store<AppState>,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
    this.store.select(getUser).subscribe(user => this.user$.next(user));
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

  dragEnd(event: any) {
    this.mapService.resizeMap();
    this.leftPositionForButtons = event.sizes[0];
  }

  transitionEnd(event: number) {
    console.log(event);
    this.mapService.resizeMap();
    this.leftPositionForButtons = 10;
  }
}
