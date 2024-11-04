import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderComponent } from './new-order.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/_store';
import { EMPTY, of } from 'rxjs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ApiOrderService } from 'src/app/_services/api-order.service';
import { ConfigService } from 'src/app/_services/config.service';
import { IConfig } from 'src/app/_models/IConfig';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

class StoreMock {
  select =  jasmine.createSpy().and.returnValue(EMPTY);
  dispatch = jasmine.createSpy();
  pipe =  jasmine.createSpy().and.returnValue(EMPTY);
}

class MockConfig {
  config = {
    apiUrl: "http://some/api/url"
  } as IConfig;
}

describe('NewOrderComponent', () => {
  let component: NewOrderComponent;
  let fixture: ComponentFixture<NewOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
          MatStepperModule,
          MatFormFieldModule,
          MatSelectModule,
          MatRadioModule,
          MatTableModule,
          ReactiveFormsModule,
          MatInputModule,
          MatAutocompleteModule,
          MatIconModule,
          NoopAnimationsModule,
      ],
      declarations: [ NewOrderComponent ],
      providers: [
        ApiOrderService,
        {provide: ConfigService, useClass: MockConfig},
        HttpClient,
        HttpHandler,
        {provide: Store<AppState>, useClass: StoreMock}
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
