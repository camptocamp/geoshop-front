import {createOrderForm} from "@app/account/new-order/order-form.model";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import {ReactiveFormsModule } from "@angular/forms";

import { OrderTypeStepComponent } from './order-type-step.component';
import { MatInputModule } from "@angular/material/input";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('OrderTypeStepComponent', () => {
  let component: OrderTypeStepComponent;
  let fixture: ComponentFixture<OrderTypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatInputModule,
        NoopAnimationsModule,
        OrderTypeStepComponent,
        ReactiveFormsModule,
      ],
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTypeStepComponent);
    component = fixture.componentInstance;
    component.orderFormGroup = TestBed.runInInjectionContext(() => createOrderForm());
    component.orderTypes = [{id: 1, name: 'private'},  {id: 2, name: 'public'}];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should show description for public order (id 2)", () => {
    component.orderFormGroup.get('orderType')?.setValue({id: 2, name: 'public'});
    fixture.detectChanges();
    const descriptionField = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
    expect(descriptionField).toBeTruthy();
  });

  it("should hide description for private order (id 1)", () => {
    component.orderFormGroup.get('orderType')?.setValue({id: 1, name: 'private'});
    fixture.detectChanges();
    const descriptionField = fixture.nativeElement.querySelector('textarea[formControlName="description"]');
    expect(descriptionField).toBeFalsy();
  });

  it("description field is required for public order", () => {
    component.orderFormGroup.get('orderType')?.setValue({id: 2, name: 'public'});
    const descriptionControl = component.orderFormGroup.get('description');
    descriptionControl?.setValue('');
    expect(descriptionControl?.valid).toBeFalsy();
    expect(descriptionControl?.hasError('required')).toBeTruthy();
  });

  it("description field is NOT required for private order", () => {
    component.onTypeSelected({id: 1, name: 'private'});
    const descriptionControl = component.orderFormGroup.get('description');
    descriptionControl?.setValue('');
    expect(descriptionControl?.valid).toBeTruthy();
  });

  it("should hide emailDeliver field when emailDeliverChoice is '1'", () => {
    component.onTypeSelected({id: 1, name: 'private'});
    component.orderFormGroup.get('emailDeliverChoice')?.setValue('1');
    fixture.detectChanges();
    const emailField = fixture.nativeElement.querySelector('input[formControlName="emailDeliver"]');
    expect(emailField).toBeFalsy();
  });

  it("should show emailDeliver field when emailDeliverChoice is '2'", () => {
    component.orderFormGroup.get('emailDeliverChoice')?.setValue('2');
    fixture.detectChanges();
    const emailField = fixture.nativeElement.querySelector('input[formControlName="emailDeliver"]');
    expect(emailField).toBeTruthy();

    const emailControl = component.orderFormGroup.get('emailDeliver');
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('pattern')).toBeTruthy();

    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it("should block order type select if no order types loaded", () => {
    component.orderTypes = [];
    fixture.detectChanges();
    expect(component.orderFormGroup.get('orderType')?.disabled).toBeTruthy();

    component.orderTypes = [{id: 1, name: 'private'}];
    fixture.detectChanges();
    expect(component.orderFormGroup.get('orderType')?.disabled).toBeFalsy();
  });

});
