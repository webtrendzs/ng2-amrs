import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as moment from  'moment';

import { UserDefaultPropertiesService } from
  '../../../../user-default-properties/index';
import { PatientProgramResourceService } from
  '../../../../etl-api/patient-program-resource.service';
import { VisitResourceService } from '../../../../openmrs-api/visit-resource.service';
import { TodayVisitService } from '../today-visit.service';
import { RetrospectiveDataEntryService
} from '../../../../retrospective-data-entry/services/retrospective-data-entry.service';

@Component({
  selector: 'app-visit-starter',
  templateUrl: './visit-starter.component.html',
  styleUrls: ['./visit-starter.component.css']
})
export class VisitStarterComponent implements OnInit {

  public programVisitsConfig: any = {};

  @Output()
  public visitStarted = new EventEmitter<any>();

  public isBusy: boolean = false;
  public startedVisit: boolean = false;
  public error: string = '';
  public infoMessage: any  = [];

  private _patientUuid: string;
  @Input()
  public get patientUuid(): string {
    return this._patientUuid;
  }
  public set patientUuid(v: string) {
    this._patientUuid = v;
  }

  private _programUuid: string;
  @Input()
  public get programUuid(): string {
    return this._programUuid;
  }
  public set programUuid(v: string) {
    this._programUuid = v;
  }

  private _programEnrollmentUuid: string;
  @Input()
  public get programEnrollmentUuid(): string {
    return this._programEnrollmentUuid;
  }
  public set programEnrollmentUuid(v: string) {
    this._programEnrollmentUuid = v;
  }

  private _selectedLocations: Array<any> = [];
  public get selectedLocations(): Array<any> {
    return this._selectedLocations;
  }
  public set selectedLocations(v: Array<any>) {
    this._selectedLocations = v;
    this.getCurrentProgramEnrollmentConfig();
  }

  public get selectedLocation(): any {
    return this._selectedLocations.length > 0 ? this._selectedLocations[0] : {};
  }
  public set selectedLocation(v: any) {
    if (this.selectedLocation.value && v.uuid !== this.selectedLocation.value) {
      this.selectedLocations = [v];
    }
  }

  public get visitTypes(): Array<any> {
    if (this.programVisitsConfig &&
      this.programVisitsConfig.visitTypes &&
      this.programVisitsConfig.visitTypes.allowed) {
        return this.programVisitsConfig.visitTypes.allowed;
    }
    return [];
  }

  public get disallowedVisitTypes(): Array<any> {
    if (this.programVisitsConfig &&
      this.programVisitsConfig.visitTypes &&
      this.programVisitsConfig.visitTypes.disallowed) {
      return this.programVisitsConfig.visitTypes.disallowed;
    }
    return [];
  }

  constructor(
    private userDefaultPropertiesService: UserDefaultPropertiesService,
    private patientProgramResourceService: PatientProgramResourceService,
    private retrospectiveDataEntryService: RetrospectiveDataEntryService,
    private visitResourceService: VisitResourceService,
    private todayVisitService: TodayVisitService
  ) { }

  public ngOnInit() {
    this.setUserDefaultLocation();
    // this.getCurrentProgramEnrollmentConfig();
  }

  public setUserDefaultLocation() {
    let location: any = this.userDefaultPropertiesService.getCurrentUserDefaultLocationObject();
    let retroSettings = this.retrospectiveDataEntryService.retroSettings.value;
    if (location && location.uuid) {
      if (retroSettings && retroSettings.enabled) {
        this._selectedLocations.push(retroSettings.location);
      } else {
        this._selectedLocations.push({value: location.uuid, label: location.display});
      }
    }
  }

  public getCurrentProgramEnrollmentConfig() {
    if (this.programEnrollmentUuid === '') {
      return;
    }
    this.isBusy = true;
    this.programVisitsConfig = {};
    this.error = '';
    this.patientProgramResourceService
      .getPatientProgramVisitTypes(this.patientUuid,
      this.programUuid, this.programEnrollmentUuid, this.selectedLocation.value)
      .subscribe(
      (progConfig) => {
        this.isBusy = false;
        this.programVisitsConfig = progConfig;
      },
      (error) => {
        this.isBusy = false;
        this.error = 'Error loading the program visit configs. Please refresh page and retry.';
        console.error('Error loading the program visit configs', error);
      });
  }

  public startVisit(visitTypeUuid) {
    let retroSettings = this.retrospectiveDataEntryService.retroSettings.value;
    this.startedVisit = true;
    this.isBusy = true;
    this.error = '';
    let payload = {
      patient: this.patientUuid,
      location: this.selectedLocation.value,
      startDatetime: new Date(),
      visitType: visitTypeUuid
    };

    if (retroSettings && retroSettings.enabled) {
      payload.location = retroSettings.location.value;
      payload.startDatetime = this.setRetroDateTime(retroSettings.visitDate);
      /*payload['attributes'] = [
        {
          attributeType: '271d8a8d-e18a-43a8-8ad5-7a3cf7b926c3',
          value: retroSettings.provider.label
        }
      ]*/
    }

    this.visitResourceService.saveVisit(payload).subscribe(
      (savedVisit) => {
         this.isBusy = false;
         this.startedVisit = false;
         this.todayVisitService.activateVisitStartedMsg();
         this.visitStarted.emit(savedVisit);
      },
      (error) => {
        setTimeout( () => {
          this.isBusy = false;
          this.error = 'Error starting visit';
          this.startedVisit = false;
          this.todayVisitService.hideVisitStartedMessage();
          console.error('Error starting visit', error);

        }, 3000);
      }
    );

  }

  public onLocationChanged(locations) {
    this.selectedLocation = locations.locations;
  }

  public setRetroDateTime(date) {
    let time = moment().format('hh:mm:ss A');
    let _date = date.split(',')[0];
    return new Date(_date + ', ' + time);
  }

}
