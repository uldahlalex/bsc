import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  activityUrl = 'http://localhost:3003/';

  getAcitivity(userId) {
    return this.http.get<any[]>(this.activityUrl+'users/1/recentActivity/1');
  }

}
