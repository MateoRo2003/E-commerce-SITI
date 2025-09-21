import { Component } from '@angular/core';
import { DeleteAttributesComponent } from '../delete-attributes/delete-attributes.component';
import { AttributesService } from '../service/attributes.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateAttributesComponent } from '../create-attributes/create-attributes.component';
import { EditAttributesComponent } from '../edit-attributes/edit-attributes.component';
import { SubAttributeCreateComponent } from '../sub-attribute-create/sub-attribute-create.component';


@Component({
  selector: 'app-list-attributes',
  templateUrl: './list-attributes.component.html',
  styleUrls: ['./list-attributes.component.scss']
})
export class ListAttributesComponent {

  attributes: any = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  isLoading$: any
  private searchSubject: Subject<string> = new Subject();

  constructor(
    public attributesService: AttributesService,
    public modalService: NgbModal,

  ) { }

  ngOnInit(): void {
    this.listAttributes();  // Cargar todas al inicio
    this.isLoading$ = this.attributesService.isLoading$;

    // Configurar debounce para búsqueda en tiempo real
    this.searchSubject.pipe(
      debounceTime(300) // espera 300ms después de dejar de escribir
    ).subscribe(value => {
      if (value.trim() === '') {
        // Si está vacío, mostrar todas las categorías
        this.listAttributes(1);
      } else {
        // Si hay texto, filtrar
        this.listAttributes(1);
      }
    });
  }

  openModalCreateAttribute() {
    const modalRef = this.modalService.open(CreateAttributesComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.AttributeC.subscribe((attributes: any) => {
      this.attributes.unshift(attributes); // Agregar el nuevo atributo al principio();
    });
  }

  getNameAttribute(type_attribute: number) {
    var name_attribute = "";
    switch (type_attribute) {
      case 1:
        name_attribute = "Texto";
        break;
      case 2:
        name_attribute = "Numero";
        break;
      case 3:
        name_attribute = "Seleccionable";
        break;
      case 4:
        name_attribute = "Seleccionable Multiple";
        break;
      default:
        break;
    }
    return name_attribute;
  }



  openModalEditAttribute(attribute: any) {
    const modalRef = this.modalService.open(EditAttributesComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.attribute = attribute;

    modalRef.componentInstance.AttributeE.subscribe((attributes: any) => {
      // this.attributes.unshift(attributes); // Agregar el nuevo atributo al principio();
      let INDEX = this.attributes.findIndex((item: any) => item.id == attributes.id);
      if (INDEX != -1) {
        this.attributes[INDEX] = attributes;
      }
    });
  }

  listAttributes(page = 1) {
    this.attributesService.listAttributes(page, this.search).subscribe((resp: any) => {
      console.log(resp);
      this.attributes = resp.attributes;
      this.totalPages = resp.total;
      this.currentPage = page;
    })
  }

  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage($event: any) {
    this.listAttributes($event);
  }



  deleteAttribute(attribute: any) {
    const modalRef = this.modalService.open(DeleteAttributesComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.attribute = attribute;

    // Suscribirse al evento del modal cuando confirme eliminación
    modalRef.componentInstance.AttributeD.subscribe((attribute: any) => {
      let INDEX = this.attributes.findIndex((item: any) => item.id == attribute.id);
      if (INDEX != -1) {
        this.attributes.splice(INDEX, 1);
      }
    });
  }


openModalRegisterProperties(attribute: any) {
  const modalRef = this.modalService.open(SubAttributeCreateComponent, { centered: true, size: 'md' });
  modalRef.componentInstance.attribute = attribute;
}

}

