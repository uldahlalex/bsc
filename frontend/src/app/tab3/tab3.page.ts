import { Component } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService, Token} from "../helpers/auth.service";
import {TaskService} from "../helpers/task.service";
import {FormControl} from "@angular/forms";
import {PopoverController} from "@ionic/angular";
import {EditTaskStatusComponent} from "../tree/minicomponents/editTaskStatus.component";
import {AboutComponent} from "../tree/minicomponents/about.component";


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
              private taskService: TaskService,
              private popoverController: PopoverController) {
    this.authService.login('alex@uldahl.dk', '1234');
    this.decoded_token = JSON.parse(localStorage.getItem('decoded_token'));
    taskService.getOrganizations().subscribe(sub => {
      this.organizations = sub;
      sub.forEach(each => {
        if(each._fields[0]._id.low == this.decoded_token.organization) {
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
    this.authService.joinOrganization(orgId).subscribe(sub => {
      //also revoke and place new token at this step
      this.organizations.forEach(each => {
        if(each._fields[0]._id.low == sub.organizationId) {
          this.user_org = each._fields[0];

        }
      })
      console.log(this.user_org);
    })
  }

  logout() {
    this.authService.logout();
  }

  async openAbout() {
    const popover = await this.popoverController.create({
      component: AboutComponent,
    });
    await popover.present();
  }
}

