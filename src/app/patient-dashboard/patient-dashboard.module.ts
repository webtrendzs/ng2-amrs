import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule, ConfirmDialogModule, DialogModule, MessagesModule,
TabViewModule, PanelModule
} from 'primeng/primeng';
import { MdProgressSpinnerModule, MdProgressBarModule, MdSlideToggleModule
} from '@angular/material';
import { Ng2PaginationModule } from 'ng2-pagination';
import { routes } from './patient-dashboard.routes';
import { PatientDashboardGuard } from './patient-dashboard.guard';
import { PatientDashboardComponent } from './patient-dashboard.component';
import { ProgramService } from './programs/program.service';
import { ProgramsComponent } from './programs/programs.component';
import { PatientSearchService } from '../patient-search/patient-search.service';
import { PatientService } from './services/patient.service';
import { PatientPreviousEncounterService } from './services/patient-previous-encounter.service';
import { LabOrderSearchModule } from '../lab-order-search/lab-order-search.module';
import { GeneralLandingPageComponent } from './general-landing-page/landing-page.component';
import { PatientRoutesFactory } from '../navigation';
import { PatientDashboardCommonModule } from './common/patient-dashboard.common.module';
import { PatientDashboardHivModule } from './hiv/patient-dashboard-hiv.module';
import { PatientSearchModule } from '../patient-search/patient-search.module';
import { PatientProgramService } from './programs/patient-programs.service';
import { NgamrsSharedModule } from '../shared/ngamrs-shared.module';
import { PatientDashboardCdmModule } from './cdm/patient-dashboard-cdm.module';
import { PatientDashboardOncologyModule } from './oncology/patient-dashboard-cdm.module';
import {
  PatientDashboardDermatologyModule } from './dermatology/patient-dashboard-dermatology.module';
import { ProgramsContainerComponent } from './programs/programs-container.component';
import { ProgramsTransferCareComponent } from './programs/transfer-care/transfer-care.component';
import { ProgramsTransferCareService } from './programs/transfer-care/transfer-care.service';
import { ProgramsTransferCareFormWizardComponent
} from './programs/transfer-care/transfer-care-form-wizard.component';
import { ProgramsTransferCareFormWizardGuard } from './programs/transfer-care/transfer-care.guard';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ConfirmDialogModule,
    SharedModule,
    DialogModule,
    MessagesModule,
    TabViewModule,
    PanelModule,
    MdProgressSpinnerModule,
    MdProgressBarModule,
    MdSlideToggleModule,
    LabOrderSearchModule,
    Ng2PaginationModule,
    NgamrsSharedModule,
    PatientDashboardCdmModule,
    PatientDashboardOncologyModule,
    PatientDashboardCommonModule,
    PatientDashboardHivModule,
    PatientDashboardDermatologyModule,
    PatientSearchModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    GeneralLandingPageComponent,
    PatientDashboardComponent,
    ProgramsContainerComponent,
    ProgramsTransferCareFormWizardComponent,
    ProgramsTransferCareComponent,
    ProgramsComponent
  ],
  providers: [
    PatientDashboardGuard,
    ProgramsTransferCareFormWizardGuard,
    PatientSearchService,
    PatientService,
    PatientProgramService,
    PatientPreviousEncounterService,
    ProgramService,
    ProgramsTransferCareService,
    DatePipe,
    PatientRoutesFactory
  ],
  exports: [
    GeneralLandingPageComponent,
    ProgramsContainerComponent,
    ProgramsTransferCareFormWizardComponent,
    ProgramsTransferCareComponent,
    ProgramsComponent
  ]
})
export class PatientDashboardModule {
  public static routes = routes;
}
