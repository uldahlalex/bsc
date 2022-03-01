import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IonicModule} from "@ionic/angular";
import {MyPopoverComponent, TreeComponent} from "./tree.component";


@NgModule({
  declarations: [MyPopoverComponent, TreeComponent],
  imports: [
    IonicModule,
    CommonModule,
  ]
})
export class TreeModule { }
