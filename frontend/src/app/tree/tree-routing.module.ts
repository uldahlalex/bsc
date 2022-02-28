import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TreeComponent} from "./tree.component";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";

const routes: Routes = [
  {
    path: '',
    component: TreeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), BrowserModule, CommonModule],
  exports: [RouterModule]
})
export class TreeRoutingModule { }
