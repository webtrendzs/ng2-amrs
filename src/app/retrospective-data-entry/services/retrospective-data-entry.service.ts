import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { isNil, isEmpty } from 'lodash';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserDefaultPropertiesService
} from '../../user-default-properties/user-default-properties.service';

@Injectable()
export class RetrospectiveDataEntryService {
  public retroSettings: BehaviorSubject<any> = new BehaviorSubject(null);
  public enableRetro: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public errorState: BehaviorSubject<any> = new BehaviorSubject(null);
  public retroProvider: any;
  public retroVisitDate: string;
  public retroLocation: any;

  public constructor(private userDefaultPropertiesService: UserDefaultPropertiesService) {
    this.updateRetroSettings();
  }

  public updateProperty(propertyKey: string, value: any) {
    if (propertyKey === 'enableRetro') {
      this.enableRetro.next(value);
    } else if (propertyKey === 'errorState') {
      this.errorState.next(value);
    } else {
      this[propertyKey] = value;
    }
    this.userDefaultPropertiesService.setUserProperty(propertyKey, value);
    this.updateRetroSettings();
  }

  public getProperty(name: string): any {
    return this.userDefaultPropertiesService.getUserProperty(name);
  }

  public updateRetroSettings() {
    // get the defaults
    let enabled = this.userDefaultPropertiesService.getUserProperty('enableRetro');
    let provider = this.userDefaultPropertiesService.getUserProperty('retroProvider');
    let visitDate = this.userDefaultPropertiesService.getUserProperty('retroVisitDate');
    let location = this.userDefaultPropertiesService.getUserProperty('retroLocation');
    if (enabled) {
      this.retroSettings.next({
        enabled: enabled,
        error: this.errorState.value,
        location: (!isNil(this.retroLocation) && !isEmpty(JSON.parse(this.retroLocation))) ?
          JSON.parse(this.retroLocation) : JSON.parse(location),
        provider: this.retroProvider !== undefined ? JSON.parse(this.retroProvider)
          : JSON.parse(provider),
        visitDate: this.retroVisitDate ||
        (visitDate ? visitDate : moment().format('YYYY-MM-DD'))
      });
    }
  }

  public mappedLocation(location): any {
    return {
      value: location.uuid,
      label: location.display
    };
  }
}
