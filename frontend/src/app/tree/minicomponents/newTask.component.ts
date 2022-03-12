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
  @Input('organizationId') organizationId;

  taskName = new FormControl('')

  constructor(private taskService: TaskService,
              private popoverController: PopoverController) {}

  newTask() {
    let task = {
      name: this.taskName.value
    }
    this.taskService.createNewTask(this.organizationId, this.projectId, task).subscribe(result => {
      if (result) {
        console.log(result);
        this.popoverController.dismiss(result);
      }
    })
  }

  newSubtask() {
    let task = {
      name: this.taskName.value
    }
    this.taskService.createNewSubtask(this.organizationId, this.projectId, this.supertask._id.low, task).subscribe(result => {
      if (result) {
        this.popoverController.dismiss(result);
      }
    })
  }
}
