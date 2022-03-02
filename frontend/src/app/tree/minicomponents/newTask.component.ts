import {Component, Input} from "@angular/core";
import {TaskService} from "../../helpers/task.service";
import {PopoverController} from "@ionic/angular";
import {FormControl} from "@angular/forms";

@Component({
  selector: "app-my-popover",
  template: `
    <ion-list class="ion-padding">
      <ion-item>
        <ion-label position="floating">Task title</ion-label>
        <ion-input [formControl]="taskName"></ion-input>
      </ion-item>
      <br>
      <ion-button *ngIf="isSubtask==false" expand="block" fill="outline" (click)="newTask()">Add new task</ion-button>
      <ion-button *ngIf="isSubtask==true" expand="block" fill="outline" (click)="newSubtask()">Add new subtask</ion-button>

    </ion-list>
  `
})
export class NewTaskComponent {
  @Input('projectId') projectId;
  @Input('isSubtask') isSubtask;
  @Input('supertask') supertask;

  taskName = new FormControl('')

  constructor(private taskService: TaskService,
              private popoverController: PopoverController) {}

  newTask() {
    let task = {
      name: this.taskName.value
    }
    this.taskService.createNewTask(task, this.projectId).subscribe(result => {
      if (result) {
        this.popoverController.dismiss({newTask: result[0]._fields});
      }
    })
  }

  newSubtask() {
    let task = {
      name: this.taskName.value
    }
    this.taskService.createNewSubtask(task, this.supertask._id.low, this.projectId).subscribe(result => {
      if (result) {
        this.popoverController.dismiss({subTask: result[0]._fields});
      }
    })
  }
}
