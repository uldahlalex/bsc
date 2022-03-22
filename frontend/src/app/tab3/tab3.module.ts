import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Tab3Page } from './tab3.page';
import { Tab3PageRoutingModule } from './tab3-routing.module';
import {AboutComponent} from "../tree/minicomponents/about.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        Tab3PageRoutingModule,
        ReactiveFormsModule,
    ],
  declarations: [Tab3Page, AboutComponent]
})
export class Tab3PageModule {}
