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
    // resp.categories.data viene plano, construimos jerarquía
    const flatCategories = resp.categories.data;

    // Creamos un mapa para buscar categorías por id
    const map = new Map<number, any>();
    flatCategories.forEach((cat: any) => map.set(cat.id, { ...cat, children: [] }));


    const hierarchy: any[] = [];

    map.forEach(cat => {
      if (cat.categorie_second_id && map.has(cat.categorie_second_id)) {
        // Es hijo, lo agregamos al padre
        map.get(cat.categorie_second_id).children.push(cat);
      } else {
        // Es abuelo
        hierarchy.push(cat);
      }
    });

    this.categories = hierarchy;
    this.totalPages = resp.total;
    this.currentPage = page;
  });
}


  searchTo() {
    this.searchSubject.next(this.search);
  }

  loadPage($event: any) {
    this.listCategories($event);
  }



deleteCategorie(categorie: any) {
  const modalRef = this.modalService.open(DeleteCategorieComponent, { centered: true, size: 'md' });
  modalRef.componentInstance.categorie = categorie;

  modalRef.componentInstance.CategorieD.subscribe(() => {
    // 1. Obtener todos los IDs del nodo seleccionado y sus hijos
    const idsToDelete = this.getAllChildrenIds(categorie);
    idsToDelete.push(categorie.id); // incluir el propio nodo

    // 2. Llamar al servicio deleteCategorie para cada ID
    idsToDelete.forEach(id => {
      this.categorieService.deleteCategorie(id.toString()).subscribe(() => {
        // Opcional: podés mostrar un toastr por cada uno, o uno solo al final
      });
    });

    // 3. Actualizar el front eliminando los nodos
    this.removeCategoriesFromFront(idsToDelete, this.categories);
    this.toastr.success('Categorías eliminadas correctamente');
  });
}

/**
 * Función recursiva que devuelve un array con todos los IDs de los hijos
 */
getAllChildrenIds(node: any): number[] {
  let ids: number[] = [];
  if (node.children && node.children.length) {
    node.children.forEach((child: any) => {
      ids.push(child.id);
      ids = ids.concat(this.getAllChildrenIds(child));
    });
  }
  return ids;
}

/**
 * Función recursiva para eliminar nodos del front
 */
removeCategoriesFromFront(ids: number[], list: any[]) {
  for (let i = list.length - 1; i >= 0; i--) {
    const node = list[i];
    if (ids.includes(node.id)) {
      list.splice(i, 1);
    } else if (node.children && node.children.length) {
      this.removeCategoriesFromFront(ids, node.children);
    }
  }
}


}
