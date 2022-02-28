import { NestedTreeControl} from '@angular/cdk/tree';
import {Component, } from '@angular/core';
import { MatTreeNestedDataSource} from '@angular/material/tree';
import {HttpClient} from "@angular/common/http";

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

  constructor(private http: HttpClient) {
    this.http.get<any[]>('http://localhost:3001/tasks/other').subscribe(sub => {
      console.log(sub);
      this.list = sub[0]._fields;
    })
  }

  expand(child) {
    if(child.expanded != true){
      child.expanded = true
    }
    else {
      child.expanded = false;
    }
  }


}

