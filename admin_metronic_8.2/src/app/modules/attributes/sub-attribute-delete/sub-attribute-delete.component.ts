import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-sub-attribute-delete',
  templateUrl: './sub-attribute-delete.component.html',
  styleUrls: ['./sub-attribute-delete.component.scss']
})
export class SubAttributeDeleteComponent {

  @Input() propertie: any;
  @Output() PropertieD: EventEmitter<any> = new EventEmitter();

  isLoading: any;
  deleteMessage: string = '';

  constructor(
    public attributesService: AttributesService,
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.isLoading = this.attributesService.isLoading$;
    this.setDeleteMessage();
  }

  setDeleteMessage() {
    this.deleteMessage = `¿Estás seguro de eliminar el atributo "${this.propertie?.name}"? Esta acción no se puede deshacer.`;
  }

  delete(): void {
    this.attributesService.deleteProperties(this.propertie.id.toString()).subscribe(() => {
      this.PropertieD.emit({ message: 200 });
      this.modal.close();
    });
  }
}
