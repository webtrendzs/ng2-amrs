import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { ProgramEnrollment } from '../../models/program-enrollment.model';
import { Program } from '../../models/program.model';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ProgramsTransferCareService } from './transfer-care.service';
import { PatientProgramService } from '../patient-programs.service';
import { ProgramsTransferCareComponent } from './transfer-care.component';
import { NgamrsSharedModule } from '../../../shared/ngamrs-shared.module';
import { ProgramService } from '../program.service';
import { RouterTestingModule } from '@angular/router/testing';

class MockRouter {
  public navigate = jasmine.createSpy('navigate');
}

fdescribe('Component: ProgramsTransferCareComponent', () => {
  let fixture, component;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientService,
        ProgramService,
        Location,
        {
          provide: Http,
          useFactory: (backendInstance: MockBackend,
                       defaultOptions: BaseRequestOptions) => {
            return new Http(backendInstance, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        ProgramsTransferCareService,
        PatientProgramService,
        MockBackend,
        BaseRequestOptions
      ],
      declarations: [ProgramsTransferCareComponent],
      imports: [FormsModule, NgamrsSharedModule, RouterTestingModule ]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProgramsTransferCareComponent);
      component = fixture.componentInstance;
    });
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance', () => {
    expect(component).toBeDefined();
  });
});
