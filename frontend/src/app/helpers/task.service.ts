import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }


  getProjects() {
    return this.http.get<any[]>('http://localhost:3001/projects');
  }

  getTasksForProject(projectId): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3001/projects/'+projectId);
  }

}
