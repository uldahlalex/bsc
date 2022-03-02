import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TaskService} from "../helpers/task.service";
import {ActivatedRoute} from "@angular/router";
import {PopoverController} from "@ionic/angular";
import {EditTaskStatusComponent} from "./minicomponents/editTaskStatus.component";
import {NewTaskComponent} from "./minicomponents/newTask.component";

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent {

  projectMetaData;
  list;

  constructor(private taskService: TaskService,
              private route: ActivatedRoute,
              private popoverController: PopoverController) {
    let id = this.route.snapshot.paramMap.get('id');
    this.taskService.getTasksForProject(id).subscribe(sub => {
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

  async openPopover(task) {
    const popover = await this.popoverController.create({
      component: EditTaskStatusComponent,
      componentProps: {task: task}

    });
    await popover.present();
    popover.onDidDismiss().then(
      (data) => {
        task = data;
        console.log(task);
      }
    )
  }

  async openAddTaskPopover(projectId, isSubtask, supertaskId?) {
    const popover = await this.popoverController.create({
      component: NewTaskComponent,
      componentProps: {projectId: projectId, isSubtask: isSubtask, supertaskId: supertaskId}

    });
    await popover.present();
    popover.onDidDismiss().then(
      (data) => {
        console.log(data);
      }
    )
  }
}


