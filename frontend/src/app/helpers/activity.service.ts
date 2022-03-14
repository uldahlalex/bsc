import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  activityUrl = 'http://localhost:3003/';

  getUserActivity(userId, numberOfRecords) {
    return this.http.get(this.activityUrl+'users/'+userId+'/recentActivity/'+numberOfRecords).pipe(
      map(((clients: Activity[]) => clients.map(client => {
        client.eventtime = new Date(client.eventtime)
        return client;
      }))))
  }

  getOrganizationActivity(organizationId, numberOfRecords) {
    return this.http.get<any[]>(this.activityUrl+'organizations/'+organizationId+'/recentActivity/'+numberOfRecords);
  }
}

export interface Activity {
  actiontype: string;
  bodyitems: string;
  endpoint: string;
  eventtime: Date;
  organizationid: number;
  service: string;
  userid: string;
}
