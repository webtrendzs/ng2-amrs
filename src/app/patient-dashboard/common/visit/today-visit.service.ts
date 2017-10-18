import { Injectable } from '@angular/core';

import * as moment from 'moment';
import *  as _ from 'lodash';
import { Observable, Subject } from 'rxjs';

import { PatientProgramResourceService } from '../../../etl-api/patient-program-resource.service';
import { VisitResourceService } from '../../../openmrs-api/visit-resource.service';
import { PatientService } from '../../services/patient.service';
import { TitleCasePipe } from '../../../shared/pipes/title-case.pipe';

export enum VisitsEvent {
  VisitsLoadingStarted,
  VisitsLoaded,
  ErrorLoading,
  VisitsBecameStale,
}

@Injectable()
export class TodayVisitService {
  public patient: any;

  public allProgramVisitConfigs: any = {};
  public errors: Array<any> = [];

  public allPatientVisits = [];
  public hasFetchedVisits = false;

  public enrolledPrograms: Array<any> = [];

  public needsVisitReload: boolean = true;
  public programVisits = null;
  public visitsByProgramClass = [];

  public visitsEvents: Subject<VisitsEvent> = new Subject<VisitsEvent>();
  private isLoading = false;
  constructor(
    private patientProgramResourceService: PatientProgramResourceService,
    private visitResourceService: VisitResourceService,
    private patientService: PatientService
  ) {
    this.subscribeToPatientChanges();
  }

  public subscribeToPatientChanges() {
    this.patientService.currentlyLoadedPatient.subscribe(
      (patient) => {
        if (patient !== null) {
          this.patient = patient;
          // console.log('this.patient', this.patient);
          if (Array.isArray(patient.enrolledPrograms)) {
            this.enrolledPrograms = this.filterUnenrolledPrograms(patient.enrolledPrograms);
            // this.setEnrollmentUuid();
          }
          this.makeVisitsStale();
        }
      }
      , (err) => {
        this.errors.push({
          id: 'patient',
          message: 'error fetching patient'
        });
        console.error('Error on published patient', err);
      });
  }

  public fetchAllProgramVisitConfigs(): Observable<any> {
    let subject: Subject<any> = new Subject<any>();

    this.allProgramVisitConfigs = {};
    this.patientProgramResourceService.
      getAllProgramVisitConfigs().subscribe(
      (programConfigs) => {
        this.allProgramVisitConfigs = programConfigs;
        subject.next(programConfigs);
      },
      (error) => {
        this.errors.push({
          id: 'program configs',
          message: 'There was an error fetching all the program configs'
        });
        console.error('Error fetching program configs', error);
        subject.error(error);
      });
    return subject;
  }

  public getProgramConfigurationObject(programUuid: string): any {
    return this.allProgramVisitConfigs[programUuid];
  }

  public getPatientVisits(): Observable<any> {
    let subject: Subject<any> = new Subject<any>();
    this.allPatientVisits = [];
    this.hasFetchedVisits = false;

    if (!(this.patient && this.patient.uuid)) {
      setTimeout(() => {
        subject.error('Patient is required');
      }, 0);
    } else {

      this.visitResourceService
        .getPatientVisits({ patientUuid: this.patient.uuid })
        .subscribe((visits) => {
          this.allPatientVisits = visits;
          this.hasFetchedVisits = true;
          subject.next(visits);
        }, (error) => {
          this.errors.push({
            id: 'patient visits',
            message: 'There was an error fetching all the patient visits'
          });
          console.error('An error occured while fetching visits', error);
          subject.error(error);
        });
    }
    return subject.delay(100);
  }

  public filterVisitsByVisitTypes(visits: Array<any>, visitTypes: Array<string>): Array<any> {
    let returnVal = [];
    returnVal = _.filter(visits, (visit) => {
      let inType = _.find(visitTypes, (type) => {
        return type === visit.visitType.uuid;
      });
      if (inType) {
        return true;
      }
      return false;
    });
    return returnVal;
  }

  public filterVisitsByDate(visits: Array<any>, date: Date): Array<any> {
    let returnVal = [];
    returnVal = _.filter(visits, (visit) => {
      let sameDate = moment(visit.startDatetime).isSame(moment(date), 'days');
      if (sameDate) {
        return true;
      }
      return false;
    });
    return returnVal;
  }

  public sortVisitsByVisitStartDateTime(visits: Array<any>) {
    // sorts this in descending order
    return visits.sort((a, b) => {
      return moment(b.startDatetime).diff(moment(a.startDatetime), 'seconds');
    });
  }

  public filterUnenrolledPrograms(programs: Array<any>): Array<any> {
    let returnVal = [];
    returnVal = _.filter(programs, (program) => {
      return !_.isUndefined(program.enrolledProgram) &&
        !_.isNull(program.enrolledProgram) &&
        moment(program.dateEnrolled).isValid();
    });
    return returnVal;
  }

  public buildProgramsObject(programs: Array<any>): any {
    let returnVal = {};
    _.each(programs, (program) => {
      returnVal[program.program.uuid] = {
        enrollment: program,
        visits: [],
        currentVisit: null,
        config: this.getProgramConfigurationObject(program.program.uuid)
      };
    });
    return returnVal;
  }

  public filterVisitsAndCurrentVisits(programVisitObj, visits) {
    // Filter out visits not in the program
    let todaysVisits = this.filterVisitsByDate(visits, moment().toDate());
    let programVisits = this.filterVisitsByVisitTypes(todaysVisits,
      this.getProgramVisitTypesUuid(programVisitObj.config));
    let orderedVisits = this.sortVisitsByVisitStartDateTime(programVisits);

    programVisitObj.visits = orderedVisits;

    if (orderedVisits.length > 0 &&
      moment(orderedVisits[0].startDatetime).isSame(moment(), 'days')) {
      programVisitObj.currentVisit = orderedVisits[0];
    } else {
      programVisitObj.currentVisit = null;
    }
  }

  public processVisitsForPrograms() {
    let programs = this.buildProgramsObject(this.enrolledPrograms);
    for (let o in programs) {
      if (programs[o]) {
        this.filterVisitsAndCurrentVisits(programs[o], this.allPatientVisits);
      }
    }
    this.programVisits = programs;
    this.groupProgramVisitsByClass();
  }

  public groupProgramVisitsByClass() {
    this.visitsByProgramClass = [];
    if (!_.isEmpty(this.programVisits)) {
      let classes: any = {};
      for (let o in this.programVisits) {
        if (this.programVisits[o]) {
          let c: string = this.programVisits[o].enrollment.baseRoute;
          // console.log('class', c);
          if (classes[c] === undefined) {
            classes[c] = {
              class: c,
              display: this.getDepartmentName(c),
              programs: [],
              allVisits: []
            };
            this.visitsByProgramClass.push(classes[c]);
            // console.log('class obj', classes[c]);
          }

          // add program
          classes[c].programs.push(
            {
              uuid: o,
              display: this.programVisits[o].enrollment.program.display,
              programVisits: this.programVisits[o]
            }
          );

          // add visits
          classes[c].allVisits = classes[c].allVisits.concat(this.programVisits[o].visits);
        }
      }

    }
  }

  public loadDataToProcessProgramVisits(): Observable<any> {
    let subject = new Subject();
    if (!(this.allProgramVisitConfigs === null ||
      _.isEmpty(this.allProgramVisitConfigs))) {
      return this.getPatientVisits();
    }
    this.fetchAllProgramVisitConfigs()
      .subscribe(() => {
        this.getPatientVisits()
          .subscribe(() => {
            subject.next({ done: true });
          }, (error) => {
            subject.error(error);
          });
      },
      (err) => {
        subject.error(err);
      });

    return subject;
  }

  public getProgramVisits(): Observable<any> {
    if (this.isLoading) {
      return Observable.of({ loading: true });
    }
    this.isLoading = true;
    // clear errors and visits
    this.errors = [];
    let subject = new Subject();

    // fire events to load visits
    this.visitsEvents.next(VisitsEvent.VisitsLoadingStarted);
    if (!this.needsVisitReload && this.programVisits !== null) {
      setTimeout(() => {
        this.isLoading = false;
        this.visitsEvents.next(VisitsEvent.VisitsLoaded);
        subject.next(this.programVisits);
      }, 0);
    } else {
      this.programVisits = null;
      this.loadDataToProcessProgramVisits()
        .subscribe((data) => {
          this.processVisitsForPrograms();
          this.needsVisitReload = false;
          this.isLoading = false;
          this.visitsEvents.next(VisitsEvent.VisitsLoaded);
          subject.next(this.programVisits);
        }, (error) => {
          this.needsVisitReload = true;
          this.isLoading = false;
          this.visitsEvents.next(VisitsEvent.ErrorLoading);
          subject.error(this.errors);
        });
    }
    return subject;
  }

  public makeVisitsStale() {
    this.needsVisitReload = true;
    this.visitsEvents.next(VisitsEvent.VisitsBecameStale);
  }

  private getProgramVisitTypesUuid(currentProgramConfig): Array<string> {
    if (currentProgramConfig &&
      Array.isArray(currentProgramConfig.visitTypes)) {
      return _.map(currentProgramConfig.visitTypes, (item) => {
        return (item as any).uuid;
      });
    }
    return [];
  }

  private getDepartmentName(departmentRoute): string {
    switch (departmentRoute) {
      case 'hiv':
        return 'HIV';
      case 'cdm':
        return 'CDM';
      case 'oncology':
        return 'Hemato-Oncology';
      default:
        return (new TitleCasePipe()).transform(departmentRoute);
    }

  }

}
