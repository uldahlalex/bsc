import { NestedTreeControl} from '@angular/cdk/tree';
import {Component, } from '@angular/core';
import { MatTreeNestedDataSource} from '@angular/material/tree';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  list;

  constructor(private router: Router, private route: ActivatedRoute) {

  }

  expand(child) {
    if(child.expanded != true){
      child.expanded = true
    }
    else {
      child.expanded = false;
    }
  }


  navigateToProject() {
    this.router.navigate(['app-tree'], {relativeTo: this.route})
  }
}

