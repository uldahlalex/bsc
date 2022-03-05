import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TaskService} from "../helpers/task.service";
import {ActivatedRoute} from "@angular/router";
import {PopoverController} from "@ionic/angular";
import {EditTaskStatusComponent} from "./minicomponents/editTaskStatus.component";
import {NewTaskComponent} from "./minicomponents/newTask.component";
import {Token} from "../helpers/auth.service";

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent {

  decoded_token: Token;
  projectMetaData;
  projectId;
  tasks;

  constructor(private taskService: TaskService,
              private route: ActivatedRoute,
              private popoverController: PopoverController) {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.decoded_token = JSON.parse(localStorage.getItem('decoded_token'))
    this.taskService.getTasks(this.decoded_token.organization, this.projectId).subscribe(sub => {
      //this.projectMetaData = sub[0]._fields[0]; Query the project to get this data
      this.tasks = sub;
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

  async openEditTaskPopover(task) {
    const popover = await this.popoverController.create({
      component: EditTaskStatusComponent,
      componentProps: {task: task, projectId: this.projectId, organizationId: this.decoded_token.organization}

    });
    await popover.present();
    popover.onDidDismiss().then(
      (data) => {
        task = data;
      }
    )
  }

  async openAddTaskPopover(projectId, isSubtask, supertask?) {
    const popover = await this.popoverController.create({
      component: NewTaskComponent,
      componentProps: {organizationId: this.decoded_token.organization, projectId: projectId, isSubtask: isSubtask, supertask: supertask}

    });
    await popover.present();
    popover.onDidDismiss().then(
      (returnedTask) => {
        if (isSubtask) {
          console.log(returnedTask.data);
          console.log(supertask.children);
          if(supertask.children==undefined) {
            supertask.children = []
          }
          supertask.children.push(returnedTask.data);
        } else {
          console.log(returnedTask.data);
          console.log(this.tasks);
          if (this.tasks==undefined) {
            this.tasks = []
          }
          this.tasks.push(returnedTask.data)
        }
      }
    )
  }
}


