import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Moh731ReportComponent } from './moh-731/moh-731-report.component';
import {
    HivSummaryIndicatorComponent
} from './hiv-summary-indicators/hiv-summary-indicator.component';
import {
    HivSummaryIndicatorsPatientListComponent
} from '../../hiv-care-lib/hiv-summary-indicators/patient-list.component';
import {
    PatientsRequiringVLComponent
} from './patients-requiring-vl/patients-requiring-vl.component';
import { HivCareComparativeComponent
} from '../../hiv-care-lib/hiv-visualization/hiv-care-overview.component';
import {
  VisualizationPatientListComponent
} from '../../hiv-care-lib/hiv-visualization/visualization-patient-list.component';
import { ClinicVisualizationContainerComponent
} from '../../hiv-care-lib/hiv-visualization/hiv-visualization-container';

const routes: Routes = [
  {
    path: 'landing-page',
    component: Moh731ReportComponent // replace with landing page for module
  },
  {
    path: 'moh-731-report',
    component: Moh731ReportComponent // replace with landing page for module
  },
  {
    path: 'hiv-summary-indicator-report',
    children: [
      {
        path: '',
        component: HivSummaryIndicatorComponent
      },
      {
        path: 'patient-list/:indicator/:period/:gender/:age/:locationUuids',
        component: HivSummaryIndicatorsPatientListComponent,
      }
    ]
  },
  {
    path: 'patients-requiring-vl',
    component: PatientsRequiringVLComponent,
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
    path: 'hiv-comparative-chart',
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
];

export const clinicDashboardHivRouting: ModuleWithProviders =
    RouterModule.forChild(routes);
