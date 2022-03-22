import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  activityUrl = 'http://localhost:3003/';

  getActivity(userId, numberOfRecords, forUser, organizationId) {
    let query;
    if(forUser==true) {
      query = this.http.get(this.activityUrl+'recentActivity/'+numberOfRecords+'/forUser/'+forUser+'/'+userId);
    } else {
      query = this.http.get(this.activityUrl+'recentActivity/'+numberOfRecords+'/forUser/'+forUser+'/'+organizationId);
    }
    return query.pipe(
      map((clients: Activity[]) => clients.map(client => {
        client.eventtime = new Date(client.eventtime)
        return client;
      })))
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
