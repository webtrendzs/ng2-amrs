import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientService } from '../services/patient.service';
import { ProgramService } from './program.service';
import { Patient } from '../../models/patient.model';
import { ProgramEnrollment } from '../../models/program-enrollment.model';
import { Program } from '../../models/program.model';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { LocationResourceService } from '../../openmrs-api/location-resource.service';

@Component({
  selector: 'programs-container',
  templateUrl: './programs-container.component.html',
  styleUrls: ['./programs-container.component.css']
})
export class ProgramsContainerComponent implements OnInit, OnDestroy {
  public patient: Patient = new Patient({});
  public enrolledProgrames: ProgramEnrollment[] = [];
  public availablePrograms: Program[] = [];
  public selectedProgram: string = '';
  public errors: any[] = [];
  public notEnrolled: boolean = false;
  public loadingPatientPrograms: boolean = false;
  public programsBusy: boolean = false;
  public enrollmentUuid: string = '';
  public program: string = '';
  public dateCompleted: any;
  public dateEnrolled: any;
  public selectedLocation: string;
  public displayDialog: boolean = false;
  public hasError: boolean = false;
  public errorMessage: string = '';
  public locations: any[] = [];
  public subscription: Subscription;
  private _datePipe: DatePipe;

  constructor(private patientService: PatientService,
              private programService: ProgramService,
              private locationResourceService: LocationResourceService
  ) {
    this._datePipe = new DatePipe('en-US');
  }

  public ngOnInit() {
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
