import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttributesRoutingModule } from './attributes-routing.module';
import { AttributesComponent } from './attributes.component';
import { CreateAttributesComponent } from './create-attributes/create-attributes.component';
import { EditAttributesComponent } from './edit-attributes/edit-attributes.component';
import { DeleteAttributesComponent } from './delete-attributes/delete-attributes.component';
import { ListAttributesComponent } from './list-attributes/list-attributes.component';
import { SubAttributeCreateComponent } from './sub-attribute-create/sub-attribute-create.component';
import { SubAttributeDeleteComponent } from './sub-attribute-delete/sub-attribute-delete.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg-2';


@NgModule({
  declarations: [
    AttributesComponent,
    CreateAttributesComponent,
    EditAttributesComponent,
    DeleteAttributesComponent,
    ListAttributesComponent,
    SubAttributeCreateComponent,
    SubAttributeDeleteComponent
  ],
  imports: [
    CommonModule,
    AttributesRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    NgbPaginationModule,
  ]
})
export class AttributesModule { }
