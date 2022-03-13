import {Component, } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from '@angular/common';
import {TaskService} from "../helpers/task.service";
import {AuthService, Token} from "../helpers/auth.service";


/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-projects',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {

  projects;
  decoded_token: Token;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private taskService: TaskService) {
    this.decoded_token = JSON.parse(localStorage.getItem('decoded_token'))
    this.taskService.getProjects(this.decoded_token.organization).subscribe(res => {
      this.projects = res
    })
  }

  navigateToProject(id) {
    this.router.navigate([id], { relativeTo: this.route})}

  goBack() {
    this.location.back();
  }

  expand(child) {
    if(child.expanded != true){
      child.expanded = true
    }
    else {
      child.expanded = false;
    }
  }

  showProjects = true;
  toggleShowProjects() {
      this.showProjects = this.showProjects != true;
  }

  newProject() {
    let organizationId = this.decoded_token.organization;
    let project = {
      name: "New project",
      description: "My desc"
    }
    this.taskService.newProject(organizationId,project).subscribe(sub => {
      if(this.projects==undefined) {
        this.projects = [];
        this.projects.push(sub);
      } else {
        this.projects.push(sub);
      }
    })
  }
}

