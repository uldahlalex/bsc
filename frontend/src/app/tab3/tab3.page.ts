import { Component } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService, Token} from "../helpers/auth.service";
import {TaskService} from "../helpers/task.service";
import {FormControl} from "@angular/forms";


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  organizationName = new FormControl('');
  decoded_token: Token;
  user_org;
  organizations;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private taskService: TaskService) {
    this.authService.login('alex@uldahl.dk', '1234');
    this.decoded_token = JSON.parse(localStorage.getItem('decoded_token'));
    taskService.getOrganizations().subscribe(sub => {
      this.organizations = sub;
      console.log(sub);
      sub.forEach(each => {
        if(each._fields[0]._id.low == this.decoded_token.organization) {
          console.log("Match")
          this.user_org = each._fields[0];

        }
      })
    console.log(this.user_org);
    })
  }

  newOrganization() {
    let org = {
      name: this.organizationName.value
    };
    this.taskService.createNewOrganization(org).subscribe(sub => {
      if (this.organizations != null) {
        this.organizations.push(sub)
      } else {
        this.organizations = [];
        this.organizations.push(sub);
      }
      }
    )
  }

  joinOrganization(orgId) {
    this.taskService.joinOrganization(orgId).subscribe(sub => {
      console.log(sub);
    })
  }

  logout() {
    this.authService.logout();
  }
}

