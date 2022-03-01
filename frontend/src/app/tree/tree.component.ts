import {Component, Input, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TaskService} from "../helpers/task.service";
import {ActivatedRoute} from "@angular/router";
import {PopoverController} from "@ionic/angular";

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

  addTask() {

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

}

@Component({
  selector: "app-my-popover",
  template: `
    <ion-list>
      <ion-button *ngIf="task.done != true" (click)="markAsDone()" expand="block" fill="clear">
        <ion-icon name="checkmark-done-outline"></ion-icon>&nbsp;Mark as done
      </ion-button>
      <ion-button *ngIf="task.done == true" (click)="markAsUndone()" expand="block" fill="clear">
        <ion-icon name="hourglass-outline"></ion-icon>&nbsp;Mark as undone
      </ion-button>
    </ion-list>
  `
})
export class EditTaskStatusComponent {
  @Input('task') task;

  constructor(private taskService: TaskService,
              private popoverController: PopoverController) {}

  markAsDone() {
    this.taskService.markTaskAsDone(this.task._id.low).subscribe(sub => {
      if (sub==true) {
        this.task.done = true;
        this.popoverController.dismiss({task:this.task});
      }
    })

  }

  markAsUndone() {
    this.taskService.markTaskAsUnDone(this.task._id.low).subscribe(sub => {
      if (sub==true) {
        this.task.done = false;
        this.popoverController.dismiss({task:this.task});
      }
    })
  }
}
