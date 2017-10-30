import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class ReportFilterService {
  public selectedLocations: BehaviorSubject<any> = new BehaviorSubject(null);
  public generateReportClicked: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
  }

  public setSelectedLocations(locations: any) {
    this.selectedLocations.next(locations);
  }

  public setClickGenerateReport(params: any) {
    this.generateReportClicked.next(params);
  }

  public getSelectedLocations() {
    return this.selectedLocations.asObservable();
  }

  public onClickGenerateReport() {
    return this.generateReportClicked.asObservable();
  }
}
