import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdCheckboxModule } from '@angular/material';

import { SharedModule, DialogModule } from 'primeng/primeng';

import { NgSelectModule } from '@ng-select/ng-select';
import { DataCacheService } from '../shared/services/data-cache.service';
import { SettingsComponent, RetrospectiveBannerComponent,
  EditRetroVisitProviderComponent } from './components';
import { RetrospectiveDataEntryService } from './services/retrospective-data-entry.service';
import { UserDefaultPropertiesService
} from '../user-default-properties/user-default-properties.service';
import { BusyComponent } from '../shared/busy-loader/busy.component';
@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    NgSelectModule,
    MdCheckboxModule,
    SharedModule,
    DialogModule
  ],
  exports: [MdCheckboxModule, NgSelectModule, SettingsComponent, BusyComponent,
    RetrospectiveBannerComponent, EditRetroVisitProviderComponent],
  declarations: [BusyComponent, SettingsComponent, RetrospectiveBannerComponent,
    EditRetroVisitProviderComponent],
  providers: [ DataCacheService, RetrospectiveDataEntryService,
    UserDefaultPropertiesService],
})
export class RetrospectiveDataEntryModule { }
