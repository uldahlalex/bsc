import { Component } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService, Token} from "../helpers/auth.service";
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
    let token: Token = JSON.parse(localStorage.getItem('decoded_token'))
    let org = {
      name: "Uldahl",
      userId: token.user_id
    };
    this.taskService.createNewOrganization(org);
  }
}

