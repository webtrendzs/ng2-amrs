import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import { Subject } from  'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';

import { HivCareComparativeOverviewBaseComponent
} from './hiv-care-overview-base.component';
import { ClinicalSummaryVisualizationResourceService
} from '../../etl-api/clinical-summary-visualization-resource.service';
import { ReportFilterService
} from '../report-filters/report-filter.service';

@Component({
  selector: 'hiv-comparative-chart',
  templateUrl: './hiv-care-overview-base.component.html'
})

export class HivCareComparativeComponent extends HivCareComparativeOverviewBaseComponent
        implements OnInit, OnDestroy {
  public data = [];
  public sectionsDef = [];
  public enabledControls = 'datesControl';
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(public visualizationResourceService: ClinicalSummaryVisualizationResourceService,
              private route: ActivatedRoute, private location: Location,
              private router: Router,
              private reportFilterService: ReportFilterService) {
    super(visualizationResourceService);

  }

  public ngOnInit() {
    this._initComponent();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public loadReportParamsFromUrl() {
    let path = this.router.parseUrl(this.location.path());
    if (this.startDate && this.endDate) {
      path.queryParams = {
        'startDate': this.startDate.toUTCString(),
        'endDate': this.endDate.toUTCString(),
      };
      this.location.replaceState(path.toString());
    }
  }

  private _initComponent() {
    this.reportFilterService.onClickGenerateReport().takeUntil(this.ngUnsubscribe).subscribe(
      (_params: any) => {
        console.log(_params);
        let combinedParams = Observable.combineLatest(
          this.route.parent.parent.parent.parent.queryParams,
          this.route.parent.parent.parent.parent.params,
          (queryParams, params) => ({queryParams, params}));
        combinedParams.subscribe((reportParams) => {
          this.locationUuids = [];
          this.reportFilterService.getSelectedLocations().subscribe((data: any) => {
            if (data) {
              this.locationUuids = data.locations;
            }
          });
          if (reportParams.params.location_uuid) {
            this.locationUuids.push(reportParams.params.location_uuid);
          }
          if (reportParams.queryParams.startDate && reportParams.queryParams.endDate) {
            this.startDate = new Date(reportParams.queryParams.startDate);
            this.endDate = new Date(reportParams.queryParams.endDate);
          } else {
            this.startDate = moment().subtract(1, 'year').toDate();
            this.endDate = moment().toDate();
          }
          if (_params) {
            this.startDate = new Date(_params.startDate);
            this.endDate = new Date(_params.endDate);
          }
          this.loadReportParamsFromUrl();
          if (this.locationUuids.length > 0) {
            this.generateReport();
          }
        });
      });
  }

}
