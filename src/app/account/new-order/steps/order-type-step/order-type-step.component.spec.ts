import {createOrderForm} from "@app/account/new-order/order-form.model";

import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ReactiveFormsModule } from "@angular/forms";

import { OrderTypeStepComponent } from './order-type-step.component';

describe('OrderTypeStepComponent', () => {
  let component: OrderTypeStepComponent;
  let fixture: ComponentFixture<OrderTypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
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
});
