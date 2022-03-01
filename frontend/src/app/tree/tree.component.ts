import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TaskService} from "../helpers/task.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent {

  projectMetaData;
  list;

  constructor(private taskService: TaskService,
              private route: ActivatedRoute) {
    let id = this.route.snapshot.paramMap.get('id');
    this.taskService.getTasksForProject(id).subscribe(sub => {
      console.log(sub);
      this.projectMetaData = sub[0]._fields[0];
      this.list = sub[0]._fields[0].children;
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


  markAsDone(task: any) {
    
  }
}
