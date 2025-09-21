import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AttributesService } from '../service/attributes.service';

@Component({
  selector: 'app-delete-attributes',
  templateUrl: './delete-attributes.component.html',
  styleUrls: ['./delete-attributes.component.scss']
})
export class DeleteAttributesComponent {

  @Input() attribute: any;
  @Output() AttributeD: EventEmitter<any> = new EventEmitter();

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
    this.deleteMessage = `¿Estás seguro de eliminar el atributo "${this.attribute?.name}"? Esta acción no se puede deshacer.`;
  }

  delete(): void {
    this.attributesService.deleteAttributes(this.attribute.id.toString()).subscribe(() => {
      this.AttributeD.emit({ message: 200 });
      this.modal.close();
    });
  }
}
