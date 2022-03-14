import { Component } from '@angular/core';
import {Activity, ActivityService} from "../helpers/activity.service";
import jwt_decode from "jwt-decode";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  userActivity: Activity[];
  token: Token;
  results = new FormControl(50);

  constructor(private activityService: ActivityService) {
    this.token = jwt_decode(localStorage.getItem('id_token'));

    this.activityService.getUserActivity(this.token.user_id, this.results.value).subscribe(sub => {
      this.userActivity = sub;
    })
    /*this.activityService.getOrganizationActivity(this.token.organization, this.results.value).subscribe(sub => {
      this.organizationActivity = sub;
    })*/
  }

  showUser = true;
  toggleUser() {
    this.showUser = !this.showUser;
  }

  filterReads = false;
  toggleFilterReads() {
    this.filterReads = !this.filterReads;
  }

}
export class Token {
  exp: number;
  user_id: string;
  organization: number;
}
