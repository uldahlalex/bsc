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
      <ion-button expand="block" fill="outline" (click)="newTask()">Add new task</ion-button>
    </ion-list>
  `
})
export class NewTaskComponent {
  @Input('projectId') projectId;

  taskName = new FormControl('')

  constructor(private taskService: TaskService,
              private popoverController: PopoverController) {}


  newTask() {
    let task = {
      name: this.taskName.value
    }
    console.log(task);
    this.taskService.createNewTask(task, this.projectId).subscribe(result => {
      if (result) {

      }
    })
  }
}
