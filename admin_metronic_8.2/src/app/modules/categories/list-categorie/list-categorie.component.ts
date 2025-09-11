import { Component } from '@angular/core';
import { CategoriesService } from '../service/categories.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

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


  constructor(
    public categorieService: CategoriesService,
    public modalService: NgbModal,
    public toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.listCategories();
    this.isLoading$ = this.categorieService.isLoading$;
  }

  listCategories(page = 1) {
    this.categorieService.listCategories(page, this.search).subscribe((resp: any) => {
      console.log(resp);
      this.categories = resp.categories.data;
      this.totalPages = resp.total;
      this.currentPage = page;
    })
  }

}
