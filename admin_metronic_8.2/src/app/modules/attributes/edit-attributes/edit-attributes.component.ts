import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AttributesService } from '../service/attributes.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-attributes',
  templateUrl: './edit-attributes.component.html',
  styleUrls: ['./edit-attributes.component.scss']
})
export class EditAttributesComponent {
  @Output() AttributeE: EventEmitter<any> = new EventEmitter()
  @Input() attribute: any

  name: any = '';
  type_attribute: number = 1;
  isLoading$: any;

  constructor(
    public attributesService: AttributesService,
    public modal: NgbActiveModal,

  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.attributesService.isLoading$;
    this.name = this.attribute.name;
    this.type_attribute = this.attribute.type_attribute;
  }

  store() {
    // Validación campos vacíos
    if (!this.name?.trim() || !this.type_attribute) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Todos los campos son obligatorios',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Validación: evitar guardar si no hubo cambios
    if (
      this.name.trim() === this.attribute.name &&
      this.type_attribute == this.attribute.type_attribute
    ) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No has modificado ningún dato del atributo',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    let data = {
      name: this.name.trim(),
      type_attribute: this.type_attribute,
      status: 1,
    };

    this.attributesService.uptdateAttributes(this.attribute.id, data).subscribe({
      next: (resp: any) => {
        if (resp.message == 403) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este atributo ya existe',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Editado',
            text: 'Atributo editado correctamente',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          this.AttributeE.emit(resp.attributes);
          this.modal.close(true);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar el atributo',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
        console.error(err);
      }
    });
  }

}
