import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
    selector: '[gs2WidgetHost]',
    standalone: false
})
export class WidgetHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
