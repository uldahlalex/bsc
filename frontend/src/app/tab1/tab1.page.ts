import { Component } from '@angular/core';
import {ActivityService} from "../helpers/activity.service";
import {AuthService} from "../helpers/auth.service";
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  activity;

  constructor(private activityService: ActivityService, private authService: AuthService) {
    this.getActivities();
  }

  getActivities() {
    this.activityService.getAcitivity(this.authService.decodedToken.user_id).subscribe(sub => {
      this.activity = sub;
      console.log(sub);
    })
  }

}
