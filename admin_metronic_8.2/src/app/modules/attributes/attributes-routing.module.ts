import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttributesComponent } from './attributes.component';
import { components } from 'src/app/_metronic/kt';
import { ListAttributesComponent } from './list-attributes/list-attributes.component';

const routes: Routes = [

  {
    path: '',
    component: AttributesComponent,
    children: [

      {
        path: 'list',
        component: ListAttributesComponent
      }

    ]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttributesRoutingModule { }
