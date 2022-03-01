import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from "@ionic/angular";
import {EditTaskStatusComponent, TreeComponent} from "./tree.component";


@NgModule({
  declarations: [EditTaskStatusComponent],
  imports: [
    IonicModule,
    CommonModule,
  ]
})
export class TreeModule { }
