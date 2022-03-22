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

  activities: Activity[];
  token: Token;
  results = new FormControl(100);
  filterReads = true;

  constructor(private activityService: ActivityService) {
    this.token = jwt_decode(localStorage.getItem('id_token'));
    this.fetchActivity();
  }

  fetchActivity() {
    this.activityService.getActivity(this.token.user_id, this.results.value, this.showUser, this.token.organization).subscribe(sub => {
      this.activities = sub;
    })
  }

  showUser = false;
  toggleUser() {
    this.showUser = !this.showUser;
  }

}
export class Token {
  exp: number;
  user_id: string;
  organization: number;
}
