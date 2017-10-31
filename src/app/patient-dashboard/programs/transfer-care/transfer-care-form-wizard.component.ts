import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { PatientService } from '../../services/patient.service';
import { ProgramEnrollment } from '../../models/program-enrollment.model';
import { Program } from '../../models/program.model';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ProgramsTransferCareService } from './transfer-care.service';
import { EncounterResourceService } from '../../../openmrs-api/encounter-resource.service';
import { Observable } from 'rxjs/Observable';
import { FormListService } from '../../common/forms/form-list.service';
import { Subject } from 'rxjs/Subject';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'transfer-care-form-wizard',
  templateUrl: './transfer-care-form-wizard.component.html',
  styleUrls: ['./transfer-care-form-wizard.component.css']
})
export class ProgramsTransferCareFormWizardComponent implements OnInit, OnDestroy {
  public patient: Patient;
  public transferCarePrograms: any[] = [];
  public transferType: string;
  public todaysEncounters: any[] = [];
  public isBusy: boolean = false;
  public allFormsFilled: boolean = false;
  private subscription: Subscription;

  constructor(private transferCareService: ProgramsTransferCareService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private encounterResourceService: EncounterResourceService,
              private patientService: PatientService,
              private formListService: FormListService) {
  }

  public ngOnInit() {
    this._init();
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public fillForm(form) {
    if (form) {
      this.router.navigate(['../../formentry', form.uuid], {
        relativeTo: this.route,
        queryParams: {
          transferCareEncounter: form.encounterType.uuid
        }
      });
    }
  }

  private _init() {
    this.subscription = this.transferCareService.getPayload().subscribe((payload) => {
      if (!payload) {
        let path = this.location.path();
        this.router.navigateByUrl(path.substring(0, path.length - 13));
      } else {
        this.transferType = payload.transferType;
        this._filterTransferCareForms(payload);
      }
    }, (err) => {
      console.log(err);
    }, () => {
      this.subscription.unsubscribe();
    });
  }

  private _getPatientEncounters(): Observable<any> {
    this.isBusy = true;
    return Observable.create((observer: Subject<any>) => {
      this.patientService.currentlyLoadedPatient.subscribe((patient) => {
        if (patient !== null) {
          this.patient = patient;
          this.encounterResourceService.getEncountersByPatientUuid(patient.uuid, false, null)
            .subscribe((resp) => {
              observer.next(resp.reverse());
            });
        }
      });
    });
  }

  private _pickTodaysEncounters(patientEncounters: any[]) {
    let encounters = _.map(_.filter(patientEncounters, (encounter: any) => {
      let encounterDate = moment(encounter.encounterDatetime).format('DD-MM-YYYY');
      let today = moment().format('DD-MM-YYYY');
      return encounterDate === today;
    }), (encounter: any) => {
      return  encounter.encounterType.uuid;
    });
    this.todaysEncounters = _.uniq(encounters);
  }

  private _filterTransferCareForms(payload: any) {
    this.transferCareService.fetchAllProgramTransferConfigs().subscribe((configs) => {
      this._loadProgramBatch(payload.programs, configs).subscribe((programs) => {
        this.formListService.getFormList().subscribe((forms) => {
          this._getPatientEncounters().subscribe((encounters) => {
            let encounterTypeUuids = _.map(forms, (form) => {
              return form.encounterType.uuid;
            });
            // pick today's encounters to remove already filled forms
            this._pickTodaysEncounters(encounters);
            _.each(programs, (program) => {
              _.extend(program, {
                location: payload.location ? payload.location : {},
                hasForms: (_.xor(program.encounterForms, this.todaysEncounters)).length > 0,
                excludedForms: _.xor(_.xor(program.encounterForms, this.todaysEncounters),
                  encounterTypeUuids)
              });
            });
            this.isBusy = false;
            this.transferCarePrograms = programs;
            // transfer patient if all forms have been filled
            // or if intra-ampath (don't need to fill any form)
            if (this.transferType === 'AMPATH' ||
              (_.filter(programs, 'hasForms')).length === 0) {
              this.allFormsFilled = true;
              this.transferCareService.transferPatient(this.patient, programs).subscribe(() => {
                this.allFormsFilled = false;
                this.transferCareService.setTransferStatus(true);
                this.router.navigate(['..'], { relativeTo: this.route });
              });
            }
          });
        });
      }, (err) => {
        this.isBusy = false;
        console.log(err);
      });
    }, (err) => {
      this.isBusy = false;
      console.error(err);
    });
  }

  private _loadProgramBatch(programs: any[], configs: any[]): Observable<any[]> {
    let programBatch: Array<Observable<any>> = [];
    _.each(programs, (program: any) => {
      programBatch.push(this.transferCareService.attachEncounterForms(program, configs));
    });
    return Observable.forkJoin(programBatch);
  }
}
