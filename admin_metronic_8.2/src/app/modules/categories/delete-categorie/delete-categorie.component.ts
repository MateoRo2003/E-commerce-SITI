import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-categorie',
  templateUrl: './delete-categorie.component.html',
  styleUrls: ['./delete-categorie.component.scss']
})
export class DeleteCategorieComponent {

  @Input() categorie: any;
  @Output() CategorieD: EventEmitter<any> = new EventEmitter();

  isLoading: any;
  deleteMessage: string = '';

  constructor(
    public categorieService: CategoriesService,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.isLoading = this.categorieService.isLoading$;
    this.setDeleteMessage();
  }

  /**
   * Genera el mensaje dinámico según la jerarquía
   */
  setDeleteMessage() {
    const childCount = this.getAllChildren(this.categorie).length;

    if (childCount === 0) {
      this.deleteMessage = `¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.`;
    } else {
      this.deleteMessage = `Esta categoría tiene ${childCount} ${childCount === 1 ? 'subcategoría' : 'subcategorías'} asociada(s). 
      Se eliminarán todas de manera permanente. ¿Deseas continuar?`;
    }
  }

  /**
   * Retorna todos los hijos de manera recursiva
   */
  getAllChildren(node: any): any[] {
    let children: any[] = [];
    if (node.children && node.children.length) {
      node.children.forEach((child: any) => {
        children.push(child);
        children = children.concat(this.getAllChildren(child));
      });
    }
    return children;
  }

  /**
   * Llamada al servicio para eliminar
   */
  delete(): void {
    // Obtener todos los IDs del nodo y sus hijos
    const idsToDelete = this.getAllChildren(this.categorie).map(c => c.id);
    idsToDelete.push(this.categorie.id);

    // Llamamos al servicio para cada ID
    idsToDelete.forEach(id => {
      this.categorieService.deleteCategorie(id.toString()).subscribe();
    });

    this.CategorieD.emit({ message: 200 });
    this.modal.close();
  }
}
