import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import Swal from 'sweetalert2';
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

  constructor(
    public categorieService: CategoriesService,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.isLoading = this.categorieService.isLoading$;
  }

  delete():void{
    this.categorieService.deleteCategorie(this.categorie.id).subscribe((resp: any) => {
      this.CategorieD.emit({message:200});
      this.modal.close();
    })
  }

}
