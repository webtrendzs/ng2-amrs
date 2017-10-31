import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { ConfirmationService } from 'primeng/primeng';
import { ProgramsTransferCareFormWizardComponent } from './transfer-care-form-wizard.component';
import { ProgramsTransferCareService } from './transfer-care.service';

@Injectable()
export class ProgramsTransferCareFormWizardGuard implements
  CanDeactivate<ProgramsTransferCareFormWizardComponent> {

  constructor(private transferCareService: ProgramsTransferCareService,
              private confirmationService: ConfirmationService) {
  }

  public canDeactivate(): Observable<boolean> {
    console.log('it has deactivated');
    if (this.transferCareService.transferComplete()) {
      return Observable.of(true);
    }
    // confirm with user
    return Observable.create((observer: Subject<boolean>) => {
      this.confirmationService.confirm({
        header: 'Transfer Care process not finished.',
        message: 'Are you sure you want to proceed?',
        accept: () => {
          observer.next(true);
        },
        reject: () => {
          observer.next(false);
        }
      });
    }).first();
  }
}
