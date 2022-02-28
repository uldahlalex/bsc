import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent {

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
