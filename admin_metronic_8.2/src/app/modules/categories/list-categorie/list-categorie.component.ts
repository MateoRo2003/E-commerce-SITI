import { Component } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DeleteCategorieComponent } from '../delete-categorie/delete-categorie.component';

@Component({
  selector: 'app-list-categorie',
  templateUrl: './list-categorie.component.html',
  styleUrls: ['./list-categorie.component.scss']
})
export class ListCategorieComponent {


  categories: any = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
  isLoading$: any
 private searchSubject: Subject<string> = new Subject();

  constructor(
    public categorieService: CategoriesService,
    public modalService: NgbModal,
    public toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.listCategories();  // Cargar todas al inicio
    this.isLoading$ = this.categorieService.isLoading$;

    // Configurar debounce para búsqueda en tiempo real
    this.searchSubject.pipe(
      debounceTime(300) // espera 300ms después de dejar de escribir
    ).subscribe(value => {
      if (value.trim() === '') {
        // Si está vacío, mostrar todas las categorías
        this.listCategories(1);
      } else {
        // Si hay texto, filtrar
        this.listCategories(1);
      }
    });
  }

  listCategories(page = 1) {
    this.categorieService.listCategories(page, this.search).subscribe((resp: any) => {
      console.log(resp);
      this.categories = resp.categories.data;
      this.totalPages = resp.total;
      this.currentPage = page;
    })
  }

  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage($event: any) {
    this.listCategories($event);
  }



  deleteCategorie(categorie:any){
    const modalRef = this.modalService.open(DeleteCategorieComponent,{centered: true , size: 'md'});
    modalRef.componentInstance.categorie = categorie;
    modalRef.componentInstance.CategorieD.subscribe((resp: any) => {
      console.log(resp);
      let INDEX = this.categories.findIndex((item: any) => item.id == categorie.id);
      if(INDEX != -1){
        this.categories.splice(INDEX, 1);
      }
    })
  }
}
