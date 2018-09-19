import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { Patient } from '../../models/patient.model';
import { ProgramManagerService } from '../program-manager.service';

@Component({
  selector: 'stop-program',
  templateUrl: './stop-program.component.html',
  styleUrls: []
})
export class StopProgramComponent implements OnInit {
  @Input() public programs: any[] = [];
  @Input() public editedProgram: any;
  @Input() public patient: Patient;
  @Input() public complete: boolean = false;
  @Input() public set formsFilled(val: boolean) {
    if (val) {
      this.completeStopProgram();
    }
  }
  @Output() public stopProgramComplete: EventEmitter<any> = new EventEmitter(null);
  @Output() public onBack: EventEmitter<any> = new EventEmitter(null);
  public completing: boolean = false;
  public showForms: boolean = false;
  public exitEncounters: string[] = [];
  constructor(private programManagerService: ProgramManagerService,
              private router: Router) {
  }

  public ngOnInit() {

  }

  public showExitForms() {
    _.each(this.programs, (program) => {
      if (program.stateChangeEncounterTypes && program.stateChangeEncounterTypes.discharge) {
        // at the moment we only have one form. Pick the first
        const form: any = _.first(program.stateChangeEncounterTypes.discharge);
        this.exitEncounters.push(form.uuid);
      }
    });
    this.exitEncounters = _.uniq(this.exitEncounters);
    if (this.exitEncounters.length > 0) {
      this.showForms = true;
    } else {
      this.completeStopProgram();
    }

  }

  public completeStopProgram() {
    this.completing = true;
    this.programs = _.map(this.programs, (program) => {
      _.merge(program, {
        dateCompleted: new Date()
      });
      return program;
    });
    this.programManagerService.editProgramEnrollments('stop', this.patient,
      this.programs, null).subscribe((programs) => {
      if (programs) {
        this.completing = false;
        this.stopProgramComplete.next(_.first(programs));
      }
    });

  }

  public fillEnrollmentForm(form) {
    let _route = '/patient-dashboard/patient/' + this.patient.uuid
      + '/general/general/formentry';
    let routeOptions = {
      queryParams: {
        step: 3,
        parentComponent: 'programManager:edit'
      }
    };
    this.router.navigate([_route, form.uuid], routeOptions);
  }

  public goBack() {
    this.onBack.emit(true);
  }

  public updateProgramsToEdit(event) {
    _.remove(this.programs, (_program) => {
      return _program.uuid === event.target.value;
    });
  }

}
