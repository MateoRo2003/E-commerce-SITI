import { Component } from '@angular/core';
import { DeleteSlidersComponent } from '../delete-sliders/delete-sliders.component';
import { SlidersService } from '../service/sliders.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-list-sliders',
  templateUrl: './list-sliders.component.html',
  styleUrls: ['./list-sliders.component.scss']
})
export class ListSlidersComponent {
  sliders: any = [];
  search: string = '';
  totalPages: number = 0;
  currentPage: number = 1;
searchSubject = new Subject<string>();
  isLoading$: any;
  constructor(
    public sliderService: SlidersService,
    public modalService: NgbModal,
  ) {

  }

ngOnInit(): void {
  this.listSliders();
  this.isLoading$ = this.sliderService.isLoading$;

  this.searchSubject.pipe(debounceTime(300)).subscribe(value => {
    this.currentPage = 1;
    this.listSliders(1, value);
  });
}

onSearchChange(value: string) {
  this.searchSubject.next(value.trim());
}
  listSliders(page = 1, search: string = '') {
    this.sliderService.listSliders(page, search).subscribe((resp: any) => {
      this.sliders = resp.sliders;
      this.totalPages = resp.total;
      this.currentPage = page;
    });
  }


  searchTo() {
    const query = this.search?.trim() ?? '';
    this.currentPage = 1; // reinicia la paginación
    this.listSliders(this.currentPage, query);
  }




  loadPage(page: number) {
    const query = this.search?.trim() ?? '';
    this.currentPage = page;
    this.listSliders(page, query);
  }


  isColorDark(hex: string): boolean {
    if (!hex) return true; // por defecto texto blanco

    // Quitar el # si existe
    hex = hex.replace('#', '');

    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Fórmula de luminosidad percibida
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    return luminance < 186; // si es oscuro retorna true
  }
  deleteSlider(slider: any) {
    const modalRef = this.modalService.open(DeleteSlidersComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.slider = slider;

    modalRef.componentInstance.SliderD.subscribe((resp: any) => {
      let INDEX = this.sliders.findIndex((item: any) => item.id == slider.id);
      if (INDEX != -1) {
        this.sliders.splice(INDEX, 1);
      }
    })
  }
}
