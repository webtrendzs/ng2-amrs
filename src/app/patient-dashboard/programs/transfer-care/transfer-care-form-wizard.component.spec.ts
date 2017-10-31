import { TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';

import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { ProgramEnrollment } from '../../models/program-enrollment.model';
import { Program } from '../../models/program.model';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ProgramsTransferCareService } from './transfer-care.service';
import { ProgramsTransferCareFormWizardComponent } from './transfer-care-form-wizard.component';
import { EncounterResourceService } from '../../../openmrs-api/encounter-resource.service';
import { FormListService } from '../../common/forms/form-list.service';
import { NgamrsSharedModule } from '../../../shared/ngamrs-shared.module';
import { FormListComponent } from '../../common/forms/form-list.component';
import { ProgramService } from '../program.service';
import { PatientProgramService } from '../patient-programs.service';
import { FormsResourceService } from '../../../openmrs-api/forms-resource.service';
import { LocalStorageService } from '../../../utils/local-storage.service';
import { FormOrderMetaDataService } from '../../common/forms/form-order-metadata.service';

class MockRouter {
  public navigate = jasmine.createSpy('navigate');
}
class MockActivatedRoute {
  public params = Observable.of([{ 'id': 1 }]);
}

fdescribe('Component: ProgramsTransferCareFormWizardComponent', () => {
  let fixture, component;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgramsTransferCareService,
        PatientProgramService,
        FormsResourceService,
        LocalStorageService,
        FormOrderMetaDataService,
        ProgramService,
        { provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute
        },
        {
          provide: Http,
          useFactory: (backendInstance: MockBackend,
                       defaultOptions: BaseRequestOptions) => {
            return new Http(backendInstance, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        Location,
        EncounterResourceService,
        PatientService,
        FormListService,
        MockBackend,
        BaseRequestOptions,
      ],
      declarations: [FormListComponent, ProgramsTransferCareFormWizardComponent],
      imports: [FormsModule, RouterTestingModule, NgamrsSharedModule]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProgramsTransferCareFormWizardComponent);
      component = fixture.componentInstance;
    });
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance', () => {
    expect(component).toBeDefined();
  });

  it('should return NO forms when program is not in the configs', inject([], fakeAsync(() => {

  })));
});
