import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  HivSummaryIndicatorComponent
} from './hiv-summary-indicators/hiv-summary-indicator.component';
import {
  HivSummaryIndicatorsPatientListComponent
} from '../../hiv-care-lib/hiv-summary-indicators/patient-list.component';
import {
  VisualizationPatientListComponent
} from '../../hiv-care-lib/hiv-visualization/visualization-patient-list.component';
import { AdminDashboardClinicFlowComponent
} from './clinic-flow/admin-dashboard-clinic-flow';
import { HivSummaryIndicatorsComponent
} from './hiv-summary-indicators/hiv-summary-indicators';
import { DataAnalyticsDashboardComponent } from '../data-analytics.component';
import { DataAnalyticsDashboardGuard } from '../data-analytics-guard';
import {
  HivSummaryMonthlyIndicatorsComponent
} from './hiv-summary-monthly-indicators/hiv-summary-monthly-indicators';
import {
  HivMonthlySummaryIndicatorsPatientListComponent
} from '../../hiv-care-lib/hiv-monthly-summary-indicators/patient-list.component';
import { ClinicVisualizationContainerComponent
} from '../../hiv-care-lib/hiv-visualization/hiv-visualization-container';
import { HivCareComparativeComponent
} from '../../hiv-care-lib/hiv-visualization/hiv-care-overview.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '', component: DataAnalyticsDashboardComponent,
        canActivate: [
          DataAnalyticsDashboardGuard
        ],
        canDeactivate: [
          DataAnalyticsDashboardGuard
        ],
        children: [
          {
            path: '', redirectTo: 'clinic-visualization', pathMatch: 'full'
          },
          {
            path: 'clinic-flow', component: AdminDashboardClinicFlowComponent
          },
          {
            path: 'clinic-visualization',
            children: [
              {
                path: '',
                component: ClinicVisualizationContainerComponent,
                children: [
                  {
                    path: 'patient-status'
                  },
                  {
                    path: 'patients-in-care'
                  },
                  {
                    path: 'hiv-care-comparative',
                    component: HivCareComparativeComponent
                  }
                ]
              },
              {
                path: 'patient-list/:report/:indicator/:period',
                component: VisualizationPatientListComponent
              }
            ]
          },
          {
            path: 'hiv-comparative-chart-analytics',
            children: [
              {
                path: '',
                component: HivCareComparativeComponent
              },
              {
                path: 'patient-list/:report/:indicator/:period',
                component: VisualizationPatientListComponent
              }
            ]
          },
          {
            path: 'hiv-summary-indicator-report',
            children: [
              {
                path: '',
                component: HivSummaryIndicatorsComponent
              },
              {
                path: 'patient-list/:indicator/:period/:gender/:age/:locationUuids',
                component: HivSummaryIndicatorsPatientListComponent,
              }
            ]
          },
          {
            path: 'hiv-summary-monthly-indicator-report',
            children: [
              {
                path: '',
                component: HivSummaryMonthlyIndicatorsComponent
              },
              {
                path: 'patient-list/:indicator/:period/:gender/:age/:locationUuids',
                component: HivMonthlySummaryIndicatorsPatientListComponent,
              }
            ]
          }
        ]
      }
    ]
  }
];

export const dataAnalyticsDashboardHivRouting: ModuleWithProviders =
  RouterModule.forChild(routes);
