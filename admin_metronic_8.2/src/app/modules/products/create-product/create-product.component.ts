import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProductService } from '../service/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {



  title: string = '';
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  image_previsualize: any = "/assets/media/slider/slider-img-1.png";
  file_image: any = null;
  isLoading$: any;
  sku: string = '';
  price_ars: number = 0;
  price_usd: number = 0;
  description: any ="<p>Hello, world!</p>"


  constructor(public productService: ProductService) { }




  ngOnInit(): void {
    this.isLoading$ = this.productService.isLoading$;
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


  removeImage(inputRef?: HTMLInputElement) {
    this.file_image = null;
    this.image_previsualize = "/assets/media/svg/files/blank-image.svg";
    if (inputRef) inputRef.value = '';
  }

  isLoadingView() {
    this.productService.isLoadingSubject.next(true);
    setTimeout(() => this.productService.isLoadingSubject.next(false), 50);
  }
  // Retorna true si el color es oscuro, false si es claro


  save() {
    // Validar campos obligatorios
    if (!this.title.trim()) {
      Swal.fire({ icon: 'error', title: 'Título obligatorio', text: 'Debes ingresar un título' });
      return;
    }

    if (!this.file_image) {
      Swal.fire({ icon: 'error', title: 'Imagen obligatoria', text: 'Debes subir una imagen para el slider' });
      return;
    }

    // Preparar FormData
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('image', this.file_image);

    // Enviar solicitud
    this.productService.isLoadingSubject.next(true);
    this.productService.createProducts(formData).subscribe({

      next: (res: any) => {
        if (res.message === 200) {
          Swal.fire({ icon: 'success', title: 'Éxito', text: 'Producto creado con éxito' });
          this.resetForm();
        } else {
          Swal.fire({ icon: 'warning', title: 'Atención', text: 'Respuesta inesperada del servidor' });
        }
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error en la comunicación con el servidor' });
        console.error(err);
      },
      complete: () => this.productService.isLoadingSubject.next(false),
    });
  }


  private resetForm() {
    this.title = '';
    this.file_image = null;
    this.image_previsualize = "/assets/media/slider/slider-img-1.png";
    this.imageInput.nativeElement.value = '';
  }
}
