import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import moment from 'moment';
import { HivCareComparativeOverviewBaseComponent } from './hiv-care-overview-base.component';
import {
  ClinicalSummaryVisualizationResourceService
} from '../../etl-api/clinical-summary-visualization-resource.service';
import {
  ReportFilterService
} from '../report-filters/report-filter.service';

@Component({
  selector: 'clinical-hiv-visualization-container',
  templateUrl: './hiv-visualization-container.html',
  styles: [`
    .mat-tab-link.active {
      border-bottom: 2px solid #673ab7;
      opacity: 1;
      background-color: rgba(209,196,233,.3);
      font-weight: bold;
    }
    .mat-tab-nav-bar {
      margin-bottom: 12px;
    }
  `
  ]
})
export class ClinicVisualizationContainerComponent extends HivCareComparativeOverviewBaseComponent
  implements OnInit {
  public isLoadingReport: boolean = false;
  private dashboard: string;

  constructor(private location: Location,
              private router: Router,
              public reportFilterService: ReportFilterService,
              public visualizationResourceService: ClinicalSummaryVisualizationResourceService,
              private route: ActivatedRoute) {
    super(visualizationResourceService);
  }

  public ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      let path = this.router.parseUrl(this.location.path());
      this.dashboard = path.root.children.primary.segments[0].path;
      if (this.dashboard === 'data-analytics') {
        this.enabledControls += ', locationControl';
      } else {
        this.route.parent.parent.parent.params.subscribe((_params) => {
          this.reportFilterService.setSelectedLocations({locations: [_params['location_uuid']]});
        });
      }
      if (params['startDate'] && params['endDate']) {
        this.startDate = new Date(params['startDate']);
        this.endDate = new Date(params['endDate']);
      } else {
        this.startDate = moment().subtract(1, 'year').toDate();
        this.endDate = moment().toDate();
      }
    });
  }

  public updateRouteParamsAndGenerateReport() {
    let path = this.router.parseUrl(this.location.path());
    if (this.startDate && this.endDate) {
      let params = {
        'startDate': this.startDate.toUTCString(),
        'endDate': this.endDate.toUTCString(),
      };
      path.queryParams = params;
      this.reportFilterService.setClickGenerateReport(params);
      if (this.dashboard === 'data-analytics') {
        this.reportFilterService.getSelectedLocations().subscribe((data: any) => {
          if (data) {
            this.locationUuids = data.locations;
          }
        });
      }
    }
  }

  public unsubscribeResource() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
