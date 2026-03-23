import {IOrder, IOrderItem, Order} from "@app/models/IOrder";

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";

import { DataFormatStepComponent } from './data-format-step.component';

describe('DataFormatStepComponent', () => {
  let component: DataFormatStepComponent;
  let fixture: ComponentFixture<DataFormatStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataFormatStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataFormatStepComponent);
    component = fixture.componentInstance;
    component.orderItemFormGroup = new UntypedFormGroup({
      formatsForAll:new UntypedFormControl(null)
    });
    component.order = new Order({
      items: [] as IOrderItem[]
    } as IOrder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
