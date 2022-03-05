import {Component, Input} from "@angular/core";
import {TaskService} from "../../helpers/task.service";
import {PopoverController} from "@ionic/angular";

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
  @Input('projectId') projectId;
  @Input('organizationId') organizationId;

  constructor(private taskService: TaskService,
              private popoverController: PopoverController) {}

  markAsDone() {
    this.taskService.markTaskAsDone(this.organizationId, this.projectId, this.task._id.low).subscribe(sub => {
      if (sub==true) {
        this.task.done = true;
        this.popoverController.dismiss(true);
      } else {
        this.popoverController.dismiss(false);
      }
    })

  }

  markAsUndone() {
    this.taskService.markTaskAsUnDone(this.organizationId, this.projectId, this.task._id.low).subscribe(sub => {
      if (sub==true) {
        this.task.done = false;
        this.popoverController.dismiss(true);
      } else {
        this.popoverController.dismiss(false);
      }
    })
  }
}
