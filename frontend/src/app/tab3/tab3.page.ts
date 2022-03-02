import { Component } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../helpers/auth.service";
import {TaskService} from "../helpers/task.service";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {


  constructor(private http: HttpClient,
              private authService: AuthService,
              private taskService: TaskService) {
    this.authService.login('alex@uldahl.dk', '1234');
  }

  newOrganization() {
    let org = {
      name: "Uldahl"
    };
    this.taskService.createNewOrganization(org);
  }
}
