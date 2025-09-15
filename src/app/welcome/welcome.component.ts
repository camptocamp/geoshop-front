import { IIdentity } from '@app/models/IIdentity';
import { MapService } from '@app/services/map.service';
import { AppState, getUser } from '@app/store';
import { CatalogComponent } from '@app/welcome/catalog/catalog.component';
import { MapComponent } from '@app/welcome/map/map.component';

import { MediaMatcher } from '@angular/cdk/layout';
import { Component, ChangeDetectorRef, OnDestroy, HostBinding } from '@angular/core';
import { Store } from '@ngrx/store';
import { AngularSplitModule, SplitGutterInteractionEvent } from 'angular-split';
import { BehaviorSubject } from 'rxjs';


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

  dragEnd(event: SplitGutterInteractionEvent) {
    this.mapService.resizeMap();
    this.leftPositionForButtons = event.sizes[0] as number;
  }

  transitionEnd(event: number) {
    this.mapService.resizeMap();
    this.leftPositionForButtons = 10;
  }
}
