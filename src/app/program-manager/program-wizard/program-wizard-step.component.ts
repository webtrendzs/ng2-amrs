import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'program-wizard-step',
  template:
    `
    <div [hidden]="!isActive">
      <ng-content></ng-content>
    </div>
  `
})
export class ProgramWizardStepComponent {
  @Input() public name: string;
  @Input() public hidden: boolean = false;
  @Input() public showNext: boolean = true;
  @Input() public showPrev: boolean = true;

  @Output() public onNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() public onPrev: EventEmitter<any> = new EventEmitter<any>();

  private _isActive: boolean = false;

  constructor() { }

  @Input('isActive')
  set isActive(isActive: boolean) {
    this._isActive = isActive;
  }

  get isActive(): boolean {
    return this._isActive;
  }

}
