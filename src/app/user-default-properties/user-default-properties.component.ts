import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Response } from '@angular/http';
import { Router, ActivatedRoute, Params }    from '@angular/router';

import * as _ from 'lodash';

import { UserDefaultPropertiesService } from './user-default-properties.service';
import { RetrospectiveDataEntryService
} from '../retrospective-data-entry/services/retrospective-data-entry.service';

@Component({
  selector: 'user-default-properties',
  templateUrl: './user-default-properties.component.html',
  styleUrls: ['./user-default-properties.component.css']
})
export class UserDefaultPropertiesComponent implements OnInit {

  public isBusy: boolean = false;
  public location: any;
  public confirming: boolean = false;
  public isLoading: boolean = false;
  public locations: Array<any> = [];
  public currentLocation: any;
  private retroSettings: any;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private retrospectiveDataEntryService: RetrospectiveDataEntryService,
              private propertyLocationService: UserDefaultPropertiesService
  ) {

  }

  public ngOnInit() {

    this.isBusy = true;
    this.currentLocation = this.propertyLocationService.getCurrentUserDefaultLocationObject();
    // if the user is confirming, prefill the current location
    this.route.params.subscribe((params: Params) => {
      if (params['confirm'] !== undefined) {
        this.location = this.retrospectiveDataEntryService.mappedLocation(this.currentLocation);
        this.propertyLocationService.setUserProperty('retroLocation',
          JSON.stringify(this.location));
      }
    });

    this.propertyLocationService.getLocations().subscribe((response: Response) => {
      this.locations = response.json().results.map((location: any) => {
        if (!_.isNil(location.display)) {
          return this.retrospectiveDataEntryService.mappedLocation(location);
        }
      });
      this.isBusy = false;
    });

    this.retrospectiveDataEntryService.retroSettings.subscribe((retroSettings) => {
          this.retroSettings = retroSettings;
    });

  }

  public goToPatientSearch() {
    if (this.retroSettings && this.retroSettings.enabled) {
      this.validateSettings();
    } else {
      this.isLoading = true;
      this.router.navigate(['patient-dashboard/patient-search']);
    }

  }

  public validateSettings() {
    let error = {};
    if (_.isNil(this.retroSettings.provider)) {
      error['provider'] = true;
    }
    if (_.isNil(this.retroSettings.visitDate)) {
      error['visitDate'] = true;
    }
    if (!_.isEmpty(error)) {
      this.updateErrorState(error);
    } else {
      this.isLoading = true;
      this.router.navigate(['patient-dashboard/patient-search']);
    }
  }

 public select(item) {
    console.log('wait, does it hit here?');
    let location = JSON.stringify({ uuid: item.value, display: item.label });
    this.propertyLocationService.setUserProperty('userDefaultLocation', location);
    this.propertyLocationService.setUserProperty('retroLocation', JSON.stringify(item));
  }

  public updateErrorState(error) {
    this.retrospectiveDataEntryService.updateProperty('errorState',
      JSON.stringify(error));
  }

}
