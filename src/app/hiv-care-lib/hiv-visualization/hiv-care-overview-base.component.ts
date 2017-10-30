import { Component, OnInit, ViewChild } from '@angular/core';

import * as Moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { ClinicalSummaryVisualizationResourceService
} from '../../etl-api/clinical-summary-visualization-resource.service';

@Component({
  selector: 'hiv-care-visualization-report-base',
  template: './hiv-care-overview-base.component.html',
  styleUrls: ['hiv-care-overview-base.component.css'],
})
export class HivCareComparativeOverviewBaseComponent implements OnInit {

  public data = [];
  public hivComparativeChartOptions: any;
  public isLoadingReport: boolean = false;
  public encounteredError: boolean = false;
  public errorMessage: string = '';
  public dates: any;
  public enabledControls = 'datesControl';
  public subscription: Subscription;
  public loadingHivCare: boolean = false;
  private _startDate: Date = Moment().subtract(1, 'year').toDate();
  public get startDate(): Date {
    return this._startDate;
  }

  public set startDate(v: Date) {
    this._startDate = v;
  }
  private _endDate: Date = new Date();
  public get endDate(): Date {
    return this._endDate;
  }

  public set endDate(v: Date) {
    this._endDate = v;
  }

  private _locationUuids: Array<string>;
  public get locationUuids(): Array<string> {
    return this._locationUuids;
  }

  public set locationUuids(v: Array<string>) {
    this._locationUuids = v;
  }

  constructor(public visualizationResourceService: ClinicalSummaryVisualizationResourceService) {
  }

  public ngOnInit() {
  }

  public generateReport() {
    this.loadingHivCare = true;
    this.dates = {
      startDate: this._startDate,
      endDate: this._endDate
    };
    let _options = {};
    this.encounteredError = false;
    this.errorMessage = '';
    this.isLoadingReport = true;
    this.data = [];
    this.visualizationResourceService.getHivComparativeOverviewReport({
      endDate: this.toDateString(this.endDate),
      gender: 'M,F',
      indicators: '',
      groupBy: 'groupByEndDate',
      locationUuids: this.getSelectedLocations(this.locationUuids),
      order: 'encounter_datetime|asc',
      report: 'clinical-hiv-comparative-overview-report',
      startDate: this.toDateString(this.startDate)
    }).subscribe((data) => {
        _.merge(_options,
          { data: data.result },
          { indicatorDefinitions: data.indicatorDefinitions });
        this.hivComparativeChartOptions = _options;
        this.loadingHivCare = false;
        this.isLoadingReport = false;
      }, (error) => {
        this.loadingHivCare = false;
        this.errorMessage = error;
        this.encounteredError = true;
        this.isLoadingReport = false;
      });
  }

  private getSelectedLocations(locationUuids: Array<string>): string {
    if (!locationUuids || locationUuids.length === 0) {
      return '';
    }

    let selectedLocations = '';

    for (let i = 0; i < locationUuids.length; i++) {
      if (i === 0) {
        selectedLocations = selectedLocations + locationUuids[0];
      } else {
        selectedLocations = selectedLocations + ',' + locationUuids[i];
      }
    }
    return selectedLocations;
  }

  private toDateString(date: Date): string {
    return Moment(date).utcOffset('+03:00').format();
  }
}
