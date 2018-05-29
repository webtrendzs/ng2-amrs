import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MdCheckboxChange } from '@angular/material';

import * as _ from 'lodash';
import * as moment from 'moment';

import { UserService } from '../../../openmrs-api/user.service';
import { UserDefaultPropertiesService
} from '../../../user-default-properties/user-default-properties.service';
import { User } from '../../../models/user.model';
import { ProviderResourceService } from '../../../openmrs-api/provider-resource.service';
import { LocalStorageService } from '../../../utils/local-storage.service';
import { RetrospectiveDataEntryService } from '../../services/retrospective-data-entry.service';

@Component({
  selector: 'retrospective-data-entry-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Input() public modalMode: boolean;
  @Input() public bannerMode: boolean;
  @Output() public onSettingsChange: EventEmitter<boolean> = new EventEmitter();
  public user: User;
  public providers: Array<any> = [];
  public currentLocation: any;
  public enableRetro: boolean = false;
  public visitDate: string;
  public maxDate: string;
  public provider: any;
  public location: any;
  public locations: Array<any> = [];
  public error: any;
  constructor(
              private propertyLocationService: UserDefaultPropertiesService,
              private providerResourceService: ProviderResourceService,
              private localStorageService: LocalStorageService,
              private retrospectiveDataEntryService: RetrospectiveDataEntryService,
              private userService: UserService
  ) {
    this.user = this.userService.getLoggedInUser();
    this.maxDate = moment().format('YYYY-MM-DD');
    this.visitDate = moment().format('YYYY-MM-DD');

  }

  public ngOnInit() {
    this.enableRetro = this.localStorageService.getItem('enableRetro') === 'true';
    this.currentLocation = this.propertyLocationService.getCurrentUserDefaultLocationObject();
    this._init();
  }

  public fetchLocationOptions() {
    this.propertyLocationService.getLocations().map((response: Response) => {
      return response.json();
    }).subscribe((locations: any) => {
      this.locations = locations.results.map((location: any) => {
        if (!_.isNil(location.display)) {
          return this.retrospectiveDataEntryService.mappedLocation(location);
        }
      });
    });
  }

  public fetchProviderOptions() {
    let findProvider = this.providerResourceService.searchProvider('', false);
    findProvider.subscribe(
      (provider) => {
        let filtered = _.filter(provider, (p: any) => {
          return !_.isUndefined(p.person);
        });
        this.providers = filtered.map((p: any) => {
          if (!_.isNil(p.display)) {
            return {
              value: p.uuid,
              label: p.display,
              providerUuid: p.uuid
            };
          }
        });
      },
      (error) => {
        console.error(error); // test case that returns error
      }
    );
  }

  public saveRetroState(state: MdCheckboxChange) {
    this.enableRetro = state.checked;
    this.retrospectiveDataEntryService.updateProperty('enableRetro', state.checked);
  }

  public onDateChanged(date: Date) {
    this.retrospectiveDataEntryService.updateProperty('retroVisitDate',
      date);
  }

  public changeSettings(state: boolean) {
    this.onSettingsChange.emit(state);
  }

  public saveProvider(provider) {
    this.retrospectiveDataEntryService.updateProperty('retroProvider',
      JSON.stringify(provider));
  }

  public select(item) {
    this.retrospectiveDataEntryService.updateProperty('retroLocation',
      JSON.stringify(item.locations));
  }

  private _init() {
    this.propertyLocationService.locationSubject.subscribe((item: any) => {
      if (item) {
        if (this.enableRetro) {
          let retroLocation = this.retrospectiveDataEntryService
            .mappedLocation(this.currentLocation);
          this.retrospectiveDataEntryService.updateProperty('retroLocation',
            JSON.stringify(retroLocation));
          this.location = retroLocation;
        }
        this.currentLocation = JSON.parse(item);
      }
    });
    this.retrospectiveDataEntryService.retroSettings.subscribe((retroSettings) => {
      if (retroSettings && retroSettings.enabled) {
        if (!_.isNull(retroSettings.error)) {
          this.error = JSON.parse(retroSettings.error);
        }
        this.location = retroSettings.location;
        this.provider = retroSettings.provider;
        this.visitDate = retroSettings.visitDate;

        this.localStorageService.setItem('retroVisitDate',
          this.visitDate);
        let retroLocation = this.retrospectiveDataEntryService
          .mappedLocation(this.currentLocation);
        if (!_.isNull(this.location) && !_.isEmpty(this.location)) {
          retroLocation = this.location;
        }
        this.localStorageService.setItem('retroLocation',
          JSON.stringify(retroLocation));
      }
      this.fetchProviderOptions();
      this.fetchLocationOptions();
    });
  }

}
