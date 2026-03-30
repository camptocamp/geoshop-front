import { createContactForm, createOrderForm } from "@app/account/new-order/order-form.model";
import {IApiResponse} from "@app/models/IApi";
import {IContact} from "@app/models/IContact";
import {ApiService} from "@app/services/api.service";

import {HarnessLoader} from "@angular/cdk/testing";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatAutocompleteHarness} from "@angular/material/autocomplete/testing";
import {MatInputModule} from "@angular/material/input";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {of} from "rxjs";

import { ContactPricingStepComponent } from './contact-pricing-step.component';

class MockApiService {
  apiUrl = "";
  find = () => {
    return of({
      count: 0, next: "", previous: "",
      results: [
        {company_name: "Company name",  first_name: "First name",  last_name: "Last name",  email: "valid@email.com"},
        {company_name: "Another",  first_name: "Hello",  last_name: "World",  email: "hello@world.com"},
      ]
    } as IApiResponse<IContact>);
  }
}

describe('ContactPricingStepComponent', () => {
  let component: ContactPricingStepComponent;
  let fixture: ComponentFixture<ContactPricingStepComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactPricingStepComponent,
        MatAutocompleteModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useClass: MockApiService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactPricingStepComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.contactFormGroup = TestBed.runInInjectionContext(() =>createContactForm());
    component.orderFormGroup = TestBed.runInInjectionContext(() => createOrderForm());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "customer" input if order type is not private (id 2)', () => {
    component.orderFormGroup.get('orderType')?.setValue({id: 2, name: 'public'});
    fixture.detectChanges();
    const customerInput = fixture.nativeElement.querySelector('input[formControlName="customer"]');
    expect(customerInput).toBeTruthy();
  });

  it('should hide "customer" input if order type is private (id 1) and addressChoice is "1"', () => {
    component.orderFormGroup.get('orderType')?.setValue({id: 1, name: 'private'});
    component.contactFormGroup.get('addressChoice')?.setValue('1');
    fixture.detectChanges();
    const customerInput = fixture.nativeElement.querySelector('input[formControlName="customer"]');
    expect(customerInput).toBeFalsy();
  });

  it('should show "customer" input if order type is private (id 1) and addressChoice is "2"', () => {
    component.orderFormGroup.get('orderType')?.setValue({id: 1, name: 'private'});
    component.contactFormGroup.get('addressChoice')?.setValue('2');
    fixture.detectChanges();
    const customerInput = fixture.nativeElement.querySelector('input[formControlName="customer"]');
    expect(customerInput).toBeTruthy();
  });

  it('should perform search when customer is typed', fakeAsync(async () => {
    const apiService = TestBed.inject(ApiService);
    const findSpy = vi.spyOn(apiService, 'find');

    component.orderFormGroup.get('orderType')?.setValue({id: 1, name: 'private'});
    component.contactFormGroup.get('addressChoice')?.setValue('2');
    fixture.detectChanges();

    const harness = await loader.getHarness(MatAutocompleteHarness);
    await harness.focus();
    await harness.enterText('comp');
    tick(500); // debounceTime(500)
    fixture.detectChanges();
    tick(); // allow microtasks
    fixture.detectChanges();

    expect(findSpy).toHaveBeenCalledWith('comp', 'contact');

    expect(await harness.isOpen()).toBe(true);
    expect(document.querySelectorAll("mat-option").length).toBe(2);
  }));
});
