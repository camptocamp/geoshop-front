import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOverlayComponent } from './account-overlay.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(of(jasmine.createSpy()));
  dispatch = jasmine.createSpy();
}

describe('AccountOverlayComponent', () => {
  let component: AccountOverlayComponent;
  let fixture: ComponentFixture<AccountOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        RouterModule.forRoot([]),
      ],
      declarations: [ AccountOverlayComponent ],
      providers: [
        {provide: Store<AppState>, useClass: StoreMock}
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
