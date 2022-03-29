import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  baseUrl = 'http://localhost:5000/task/';

  getOrganizations() {
    return this.http.get<any[]>(this.baseUrl+'organizations');
  }
  getProjects(organizationId) {
    return this.http.get<any[]>(this.baseUrl+'organizations/'+organizationId+'/projects');
  }
  getProjectMetadata(organizationId, projectId) {
    return this.http.get<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId);
  }
  getTasks(organizationId, projectId) {
    return this.http.get<any[]>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasksWithUserData');
  }
  markTaskAsDone(organizationId, projectId, taskId) {
    return this.http.put<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasks/'+taskId+'/markTaskAsDone', {});
  }
  markTaskAsUnDone(organizationId, projectId, taskId) {
    return this.http.put<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasks/'+taskId+'/markTaskAsUnDone', {});
  }
  newProject(organizationId, project) {
    return this.http.post<any>(this.baseUrl+'organizations/'+organizationId+'/projects/', project);
  }
  createNewOrganization(org) {
    return this.http.post<any>(this.baseUrl+'organizations/', org);
  }
  createNewTask(organizationId, projectId, task) {
    return this.http.post<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasks',task);
  }
  createNewSubtask(organizationId, projectId, taskId, task) {
    return this.http.post<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasks/'+taskId+'/subtask',task);
  }
  deleteSubtasks(organizationId, projectId, taskId) {
    return this.http.delete<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasks/'+taskId+'/subtask');
  }
  deleteTasks(organizationId, projectId, taskId) {
    return this.http.delete<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId+'/tasks/'+taskId);
  }
  deleteProject(organizationId, projectId) {
    return this.http.delete<any>(this.baseUrl+'organizations/'+organizationId+'/projects/'+projectId);
  }
  deleteOrganization(organizationId) {
    return this.http.delete<any>(this.baseUrl+'organizations/'+organizationId);
  }


}
