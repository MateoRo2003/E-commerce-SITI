import { Component } from '@angular/core';
import { AttributesService } from '../service/attributes.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-attributes',
  templateUrl: './create-attributes.component.html',
  styleUrls: ['./create-attributes.component.scss']
})
export class CreateAttributesComponent {
name: any = '';
type_attribute: number = 1;
isLoading$: any;

constructor(
  public attributesService: AttributesService,
  public modal: NgbActiveModal,
  
) { } 

ngOnInit(): void {

  this.isLoading$ = this.attributesService.isLoading$;
}

store(){
  
}



}
