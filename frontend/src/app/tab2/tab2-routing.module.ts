import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';
import {TreeComponent} from "../tree/tree.component";

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
    children: [
      {path: ':id', component: TreeComponent}
    ],loadChildren: () => import('../tree/tree.module').then(m => m.TreeModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab2PageRoutingModule {}
