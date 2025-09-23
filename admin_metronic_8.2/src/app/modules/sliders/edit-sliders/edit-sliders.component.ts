import { Component, ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SlidersService } from '../service/sliders.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-edit-sliders',
  templateUrl: './edit-sliders.component.html',
  styleUrls: ['./edit-sliders.component.scss']
})
export class EditSlidersComponent {

  title: string = '';
  label: string = '';
  subtitle: string = '';
  link: string = '';
  status: number = 1;
  slider_id: string = '';
  color: string = '#115061';       // valor visual inicial
  colorSelected: boolean = false;  // flag para confirmar si el usuario lo eligió
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  image_previsualize: any;
  file_image: any = null;

  isLoading$: any;
  colorType: 'solid' | 'gradient' = 'solid';
  gradient = { start: '#7cafde', end: '#0e5c6b', direction: 'to right' };
  constructor(
    public sliderService: SlidersService,
    public activatedRoute: ActivatedRoute,
  ) { }




  ngOnInit(): void {
    this.isLoading$ = this.sliderService.isLoading$;
    this.activatedRoute.params.subscribe((resp: any) => {
      this.slider_id = resp.id;
    })

    this.sliderService.showSliders(this.slider_id).subscribe((resp: any) => {
      console.log(resp);

      this.title = resp.slider.title;
      this.label = resp.slider.label;
      this.subtitle = resp.slider.subtitle;
      this.link = resp.slider.link;
      this.setSliderColors(resp.slider.color);
      this.status = resp.slider.status;
      this.image_previsualize = resp.slider.image;
    })
  }
  // gradient: { start: string; end: string; direction: string; type: string }
  setSliderColors(colorString: string) {
    if (!colorString) return;

    colorString = colorString.trim();

    // Caso degradado
    const gradientRegex = /linear-gradient\(([^,]+),\s*(#[0-9a-fA-F]{3,6}),\s*(#[0-9a-fA-F]{3,6})\)/;
    const radialRegex = /radial-gradient\(\s*(#[0-9a-fA-F]{3,6}),\s*(#[0-9a-fA-F]{3,6})\)/;

    if (gradientRegex.test(colorString)) {
      const matches = colorString.match(gradientRegex);
      if (matches) {
        this.gradient.start = matches[2];
        this.gradient.end = matches[3];
        this.gradient.direction = matches[1].trim(); // to right, to bottom, etc.
        this.colorType = 'gradient';
      }
    } else if (radialRegex.test(colorString)) {
      const matches = colorString.match(radialRegex);
      if (matches) {
        this.gradient.start = matches[1];
        this.gradient.end = matches[2];
        this.gradient.direction = 'circle';
        this.colorType = 'gradient';
      }
    } else {
      // Caso color sólido
      this.gradient.start = colorString;
      this.gradient.end = colorString;
      this.colorType = 'solid';
    }
  }

  // Retorna el color principal (para decidir si el texto va blanco o negro)
  getMainColor(): string {
    if (this.colorType === 'solid') return this.color;
    // Para degradado tomamos el color de inicio como referencia
    return this.gradient.start;
  }

  // Retorna el background completo según tipo
  getBackground(): string {
    if (this.colorType === 'solid') return this.color;

    if (this.gradient.direction === 'circle') {
      return `radial-gradient(circle, ${this.gradient.start}, ${this.gradient.end})`;
    }

    return `linear-gradient(${this.gradient.direction}, ${this.gradient.start}, ${this.gradient.end})`;
  }



  processFile($event: any, inputRef: any) {
    const file = $event.target.files[0];
    if (!file) return;

    if (file.type.indexOf("image") < 0) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'El archivo no es una imagen' });
      inputRef.value = null;
      this.image_previsualize = "/assets/media/slider/slider-img-1.png";
      this.file_image = null;
      return;
    }

    this.file_image = file;
    let reader = new FileReader();
    reader.readAsDataURL(this.file_image);
    reader.onloadend = () => this.image_previsualize = reader.result;

    this.isLoadingView();
  }

  onColorChange(event: any) {
    const val = event.target.value;
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (hexRegex.test(val)) {
      this.color = val;
      this.colorSelected = true;
    } else {
      this.colorSelected = false;
    }
  }

  onGradientChange(position: 'start' | 'end', event: any) {
    const val = event.target.value;
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(val)) {
      this.gradient[position] = val;
    }
  }


  removeImage(inputRef?: HTMLInputElement) {
    this.file_image = null;
    this.image_previsualize = "/assets/media/svg/files/blank-image.svg";
    if (inputRef) inputRef.value = '';
  }

  isLoadingView() {
    this.sliderService.isLoadingSubject.next(true);
    setTimeout(() => this.sliderService.isLoadingSubject.next(false), 50);
  }
  // Retorna true si el color es oscuro, false si es claro
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


  save() {
    // Validar campos obligatorios
    if (!this.title.trim()) {
      Swal.fire({ icon: 'error', title: 'Título obligatorio', text: 'Debes ingresar un título' });
      return;
    }

    if (!this.subtitle.trim()) {
      Swal.fire({ icon: 'error', title: 'Subtítulo obligatorio', text: 'Debes ingresar un subtítulo' });
      return;
    }

    // Validar color obligatorio
    let finalColor = '';
    if (this.colorType === 'solid') {
      if (!this.color || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.color)) {
        Swal.fire({ icon: 'error', title: 'Color obligatorio', text: 'Debes seleccionar un color sólido válido' });
        return;
      }
      finalColor = this.color;
    } else if (this.colorType === 'gradient') {
      if (
        !this.gradient.start || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.gradient.start) ||
        !this.gradient.end || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.gradient.end)
      ) {
        Swal.fire({ icon: 'error', title: 'Degradado obligatorio', text: 'Debes seleccionar ambos colores para el degradado' });
        return;
      }
      finalColor = `linear-gradient(${this.gradient.direction || 'to right'}, ${this.gradient.start}, ${this.gradient.end})`;
    }

    // Validar link si se ingresó
    if (this.link && !/^https?:\/\/[^\s]+$/.test(this.link)) {
      Swal.fire({ icon: 'error', title: 'Link inválido', text: 'El link debe empezar con http:// o https://' });
      return;
    }

    // Preparar FormData
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('subtitle', this.subtitle.trim());
    if (this.label) formData.append('label', this.label.trim());
    if (this.link) formData.append('link', this.link.trim());
    formData.append('color', finalColor);
    formData.append('status', String(this.status));

    // Imagen solo si el usuario subió una nueva
    if (this.file_image) {
      formData.append('image', this.file_image);
    }

    // Enviar solicitud UPDATE
    this.sliderService.isLoadingSubject.next(true);
    this.sliderService.uptdateSliders(this.slider_id, formData).subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Slider actualizado con éxito' });
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error en la comunicación con el servidor' });
        console.error(err);
      },
      complete: () => this.sliderService.isLoadingSubject.next(false),
    });
  }


  private resetForm() {
    this.title = '';
    this.label = '';
    this.subtitle = '';
    this.link = '';
    this.colorSelected = false;
    this.file_image = null;
    this.image_previsualize = "/assets/media/slider/slider-img-1.png";
    this.imageInput.nativeElement.value = '';
  }
}
