import { Component, EventEmitter, Output } from '@angular/core';
import { AttributesService } from '../service/attributes.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-attributes',
  templateUrl: './create-attributes.component.html',
  styleUrls: ['./create-attributes.component.scss']
})
export class CreateAttributesComponent {

 @Output() AttributeC: EventEmitter<any> = new EventEmitter()
 
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

  store() {
    if (!this.name || !this.type_attribute) {

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Todos los campos son necesarios',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    let data = {
      name: this.name,
      type_attribute: this.type_attribute,
      status: 1,
    }
    this.attributesService.createAttributes(data).subscribe((resp: any) => {
      if (resp.message == 403) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Este Atributo ya existe',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
      }else{
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Atributo creado correctamente',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
        this.AttributeC.emit(resp.attributes);
        this.modal.close(true);
      }

    })
  }



}
