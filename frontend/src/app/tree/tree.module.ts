import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from "@ionic/angular";
import { TreeComponent} from "./tree.component";
import {EditTaskStatusComponent} from "./minicomponents/editTaskStatus.component";
import {NewTaskComponent} from "./minicomponents/newTask.component";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [EditTaskStatusComponent, NewTaskComponent],
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class TreeModule { }
