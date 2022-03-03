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

  constructor(private http: HttpClient,
              private authService: AuthService,
              private taskService: TaskService) {
    this.authService.login('alex@uldahl.dk', '1234');
    this.decoded_token = JSON.parse(localStorage.getItem('decoded_token'))
  }

  newOrganization() {
    let org = {
      name: "Uldahl",
      userId: this.decoded_token.user_id
    };
    this.taskService.createNewOrganization(org);
  }
}

