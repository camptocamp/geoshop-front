import { ViewContainerRef } from '@angular/core';
import { WidgetHostDirective } from './widget-host.directive';

describe('WidgetHostDirective', () => {
  it('should create an instance', () => {
    const directive = new WidgetHostDirective({} as ViewContainerRef);
    expect(directive).toBeTruthy();
  });
});
