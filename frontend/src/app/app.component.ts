import { Component } from '@angular/core';

import {HttpClient, HttpHeaders} from "@angular/common/http";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {


  constructor(private http: HttpClient) {
    this.http.get('http://localhost:5000/identity/openEndpoint').subscribe(sub => {
       console.log(sub);
    })
  }

}
