import { Component } from '@angular/core';
import { DeleteAttributesComponent } from '../delete-attributes/delete-attributes.component';
import { AttributesService } from '../service/attributes.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateAttributesComponent } from '../create-attributes/create-attributes.component';


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
    // this.listAttributes();  // Cargar todas al inicio
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
    modalRef.componentInstance.name = 'world';
    modalRef.result.then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
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
  }



  openModalEditAttribute(attribute:any){

  }

  listAttributes(page = 1) {
    this.attributesService.listAttributes(page, this.search).subscribe((resp: any) => {
      console.log(resp);
      this.attributes = resp.Attribute.data;
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
    modalRef.componentInstance.categorie = attribute;
    // modalRef.componentInstance.CategorieD.subscribe((resp: any) => {
    //   console.log(resp);
    //   let INDEX = this.categories.findIndex((item: any) => item.id == categorie.id);
    //   if (INDEX != -1) {
    //     this.categories.splice(INDEX, 1);
    //   }
    // })
  }
}
