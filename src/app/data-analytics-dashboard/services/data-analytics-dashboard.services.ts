
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject, Subject, ReplaySubject } from 'rxjs/Rx';
import * as Moment from 'moment';
@Injectable()
export class DataAnalyticsDashboardService {
  public dataIsLoading: boolean = true;
  public locations;
  public selectedLocations = new BehaviorSubject(this.locations);
  private cached = {};
  private selectedFilters;
  private dataSubject = new BehaviorSubject(null);
  private reportFilters = new BehaviorSubject(this.selectedFilters);
  private isLoading = new BehaviorSubject(this.dataIsLoading);
  private currentTab = new Subject();

  constructor() {
  }

  public setSelectedReportFilters(filters: any) {
    this.reportFilters.next(filters);
  }

  public getSelectedReportFilters() {
    return this.reportFilters;
  }

  public setSelectedLocations(locations: any) {
    this.locations = locations;
  }

  public getSelectedLocations() {
    return this.selectedLocations;
  }
}
