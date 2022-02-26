import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FlatTreeControl} from "@angular/cdk/tree";
import {ITreeOptions} from "@circlon/angular-tree-component";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  treeNodes = [
    {
      name: 'root1',
      children: [
        { name: 'child1' },
        { name: 'child2' }
      ]
    },
    {
      name: 'root2',
      children: [
        { name: 'child2.1', children: [] },
        {
          name: 'child2.2', children: [
            { name: 'grandchild2.2.1' }
          ]
        }
      ]
    },
    { name: 'root3' },
    { name: 'root4', children: [] },
    { name: 'root5', children: null }
  ];


  treeOptions: ITreeOptions = {
    displayField: 'title',
    nodeClass: (node) => `${node.data.title}Class`
  };

  constructor(private http: HttpClient) {
    this.http.get('http://localhost:3001/tasks/other').subscribe(sub => {
      let treeNodes = JSON.parse(JSON.stringify(sub[0]))
      this.treeNodes = treeNodes._fields;
      console.log(this.treeNodes)
    })
  }

}
