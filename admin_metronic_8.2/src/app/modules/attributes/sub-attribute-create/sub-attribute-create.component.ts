import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AttributesService } from '../service/attributes.service';
import { DeleteAttributesComponent } from '../delete-attributes/delete-attributes.component';
import { SubAttributeDeleteComponent } from '../sub-attribute-delete/sub-attribute-delete.component';

@Component({
  selector: 'app-sub-attribute-create',
  templateUrl: './sub-attribute-create.component.html',
  styleUrls: ['./sub-attribute-create.component.scss']
})
export class SubAttributeCreateComponent {
  @Input() attribute: any;
  @Input() properties: any = [];

  color: string = '#ffffff'; // default
  type_action: number = 1;
  colorType: string = 'solid';
  name: string = '';
  isLoading$: any;
  multiColors: string[] = ['#000000'];
  gradient = { start: '#000000', end: '#ffffff', direction: 'to right' };
  preview: string | ArrayBuffer | null = null;
  file: File | null = null;

  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  constructor(
    public attributesService: AttributesService,
    public modal: NgbActiveModal,
    public modalService: NgbModal
  ) { }


  // Normaliza y valida un hex; devuelve '#rrggbb' o null si inválido
  private normalizeHex(input: string): string | null {
    if (!input) return null;
    let v = input.trim().toLowerCase();

    // eliminar espacios y caracteres extra
    v = v.replace(/\s+/g, '');

    // si vino sin '#', agregrarlo
    if (!v.startsWith('#')) v = '#' + v;

    // aceptar 3 o 6 hex digits
    const re3 = /^#([0-9a-f]{3})$/i;
    const re6 = /^#([0-9a-f]{6})$/i;

    if (re3.test(v)) {
      const m = v.match(re3)![1];
      v = '#' + m[0] + m[0] + m[1] + m[1] + m[2] + m[2]; // expandir #abc -> #aabbcc
    }

    if (!re6.test(v)) return null;
    return v;
  }

  // Solid
  onColorChange(value: string) {
    const v = this.normalizeHex(value);
    if (v) this.color = v;
    // si es null: no actualizamos (evita romper el color picker con valores inválidos)
  }

  // Multicolor (indexado)
  onMultiColorChange(index: number, value: string) {
    const v = this.normalizeHex(value);
    if (v) this.multiColors[index] = v;
  }

  // Gradient
  onGradientChange(which: 'start' | 'end', value: string) {
    const v = this.normalizeHex(value);
    if (v) this.gradient[which] = v;
  }



  // Método para obtener propiedades visibles en la página actual
  get pagedProperties() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.properties.slice(start, end);
  }

  // Cambiar página
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }


  ngOnInit(): void {
    this.isLoading$ = this.attributesService.isLoading$;
    this.properties = this.attribute.properties;
    this.totalPages = Math.ceil(this.properties.length / this.itemsPerPage);
  }
  addColor() {
    this.multiColors.push('#000000');
  }

  removeColor(i: number) {
    this.multiColors.splice(i, 1);
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Tipos válidos
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de archivo inválido',
        text: 'Solo se permiten imágenes JPG, PNG o SVG',
      });
      event.target.value = ''; // Limpia el input
      this.preview = null;
      return;
    }

    // Tamaño máximo (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo demasiado grande',
        text: 'La imagen no puede superar los 2MB',
      });
      event.target.value = '';
      this.preview = null;
      return;
    }

    // Si pasa validaciones, asignar preview
    this.file = file;
    const reader = new FileReader();
    reader.onload = e => this.preview = reader.result;
    reader.readAsDataURL(file);
  }


  isHexColor(code: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(code);
  }

  isMultiColor(code: string): boolean {
    try {
      const arr = JSON.parse(code);
      return Array.isArray(arr);
    } catch {
      return false;
    }
  }

  getMultiColorGradient(code: string): string {
    try {
      const arr = JSON.parse(code);
      return `linear-gradient(45deg, ${arr.join(", ")})`;
    } catch {
      return '';
    }
  }

  isGradient(code: string): boolean {
    try {
      const obj = JSON.parse(code);
      return obj && obj.start && obj.end && obj.direction;
    } catch {
      return false;
    }
  }

  getGradient(code: string): string {
    try {
      const obj = JSON.parse(code);
      if (!obj.start || !obj.end || !obj.direction) return '';

      if (obj.direction === 'circle') {
        return `radial-gradient(circle, ${obj.start}, ${obj.end})`;
      }

      // Para linear
      return `linear-gradient(${obj.direction}, ${obj.start}, ${obj.end})`;
    } catch {
      return '';
    }
  }


  isImage(code: string): boolean {
    return typeof code === 'string' && (
      code.endsWith('.jpg') || code.endsWith('.jpeg') || code.endsWith('.png') || code.endsWith('.svg')
      || code.includes('properties/images')
    );
  }

  getImageUrl(code: string): string {
    return code; // ya es la URL completa desde el backend
  }

  store() {
    // Validación de nombre
    if (!this.name.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El nombre es obligatorio.' });
      return;
    }

    // Validación según tipo
    if (this.type_action == 2) {
      if (!this.colorType) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debes seleccionar un tipo de color.' });
        return;
      }

      if (this.colorType === 'solid' && !this.color) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debes elegir un color sólido.' });
        return;
      }

      if (this.colorType === 'multicolor' && this.multiColors.length === 0) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debes añadir al menos un color.' });
        return;
      }

      if (this.colorType === 'gradient') {
        if (!this.gradient.start || !this.gradient.end) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Debes elegir los dos colores del degradado.' });
          return;
        }
      }

      if (['pattern', 'animal', 'tiedye'].includes(this.colorType) && !this.file) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debes subir una imagen.' });
        return;
      }
    }

    // --- Si pasa validaciones ---
    let formData = new FormData();
    formData.append('name', this.name.trim());
    formData.append('status', '1');
    formData.append('attribute_id', this.attribute.id);

    if (this.type_action == 2) {
      formData.append('colorType', this.colorType);

      if (this.colorType === 'solid') {
        formData.append('code', this.color);
      }
      if (this.colorType === 'multicolor') {
        formData.append('code', JSON.stringify(this.multiColors));
      }
      if (this.colorType === 'gradient') {
        formData.append('code', JSON.stringify(this.gradient));
      }
      if (['pattern', 'animal', 'tiedye'].includes(this.colorType)) {
        if (this.file) formData.append('image', this.file);
      }
    }

    this.attributesService.createProperties(formData).subscribe((resp: any) => {
      if (resp.mesagge == 403) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Esta propiedad ya existe' });
      } else {
        this.properties.unshift(resp.propertie);
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Propiedad creada correctamente' });
        //this.modal.close(true);
      }
    });
  }

  delete(propertie: any) {
    const modalRef = this.modalService.open(SubAttributeDeleteComponent, { centered: true, size: 'md' });
    modalRef.componentInstance.propertie = propertie;

    // Suscribirse al evento del modal cuando confirme eliminación
    modalRef.componentInstance.PropertieD.subscribe((attribute: any) => {
      let INDEX = this.properties.findIndex((item: any) => item.id == propertie.id);
      if (INDEX != -1) {
        this.properties.splice(INDEX, 1);
      }
    });
  }
}

