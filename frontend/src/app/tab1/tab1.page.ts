import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor() {
    this.option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'tree',

          data: [{
            name: 'yada',
            children: [
              {name: 'yada',
              children: []}
            ]
          }],

          left: '2%',
          right: '2%',
          top: '8%',
          bottom: '20%',

          symbol: 'emptyCircle',

          orient: 'vertical',

          expandAndCollapse: true,

          label: {
            position: 'top',
            rotate: -90,
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 9
          },

          leaves: {
            label: {
              position: 'bottom',
              rotate: -90,
              verticalAlign: 'middle',
              align: 'left'
            }
          },

          animationDurationUpdate: 750
        }
      ]
    }

  }

  option: EChartsOption;


}
