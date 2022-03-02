import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  baseUrl = 'http://localhost:3001/'

  getProjects() {
    return this.http.get<any[]>(this.baseUrl+'projects');
  }

  getTasksForProject(projectId): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl+'projects/'+projectId);
  }

  markTaskAsDone(taskId) {
    return this.http.post<any>(this.baseUrl+'markTaskAsDone/'+taskId, {});
  }

  markTaskAsUnDone(taskId) {
    return this.http.post<any>(this.baseUrl+'markTaskAsUnDone/'+taskId, {});
  }

  createNewTask(task, projectId) {
    return this.http.post<any>(this.baseUrl+'projects/'+projectId+'/task',task);
  }

  createNewSubtask(task, supertaskId, projectId) {
    return this.http.post<any>(this.baseUrl+'projects/'+projectId+'/'+supertaskId+'/subtask', task);
  }

  createNewOrganization(org) {
    return this.http.post<any>(this.baseUrl+'organization', org);
  }
}
