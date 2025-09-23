import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlidersService } from '../service/sliders.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-delete-sliders',
  templateUrl: './delete-sliders.component.html',
  styleUrls: ['./delete-sliders.component.scss']
})
export class DeleteSlidersComponent {

  @Input() slider: any;
  @Output() SliderD: EventEmitter<any> = new EventEmitter();

  isLoading: any;
  deleteMessage: string = '';

  constructor(
    public sliderService: SlidersService,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.isLoading = this.sliderService.isLoading$;
    this.setDeleteMessage();
  }

  setDeleteMessage() {
    this.deleteMessage = `¿Estás seguro de eliminar el Slider "${this.slider?.title}"? Esta acción no se puede deshacer.`;
  }

  delete(): void {
    this.sliderService.deleteSliders(this.slider.id.toString()).subscribe(() => {
      this.SliderD.emit({ message: 200 });
      this.modal.close();
    });
  }
}
