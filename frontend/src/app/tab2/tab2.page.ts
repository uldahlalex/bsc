import {Component, } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from '@angular/common';
/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-projects',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {

  list;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location) {}

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
}

