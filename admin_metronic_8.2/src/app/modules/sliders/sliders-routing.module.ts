import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlidersComponent } from './sliders.component';
import { CreateSlidersComponent } from './create-sliders/create-sliders.component';
import { EditSlidersComponent } from './edit-sliders/edit-sliders.component';
import { ListSlidersComponent } from './list-sliders/list-sliders.component';

const routes: Routes = [

  {
    path: '',
    component: SlidersComponent,
    children: [
      {
        path: 'register',
        component: CreateSlidersComponent
      },
       {
        path: 'list/edit/:id',
        component: EditSlidersComponent
      },
       {
        path: 'list',
        component: ListSlidersComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlidersRoutingModule { }
