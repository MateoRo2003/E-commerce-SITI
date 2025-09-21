import { Component } from '@angular/core';
import { CategoriesService } from '../service/categories.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-categorie',
  templateUrl: './create-categorie.component.html',
  styleUrls: ['./create-categorie.component.scss']
})
export class CreateCategorieComponent {


  type_categorie: number = 1
  name: string = ''
  icon: any = null
  position: number = 1
  categorie_second_id: string = ''
  categorie_third_id: string = ''

  image_previsualize: any = "/assets/media/svg/files/blank-image.svg";
  file_image: any = null;
  default_icon: string = "/assets/media/svg/files/blank-image.svg";
  icon_previsualize: any = this.default_icon;

  isLoading$: any;
  categories_first: any = [];
  categories_seconds: any = [];
  categories_seconds_backsups: any = [];
  // categories_seconds_backups:any = [];
  constructor(
    public categorieService: CategoriesService,

  ) {

  }
  ngOnInit(): void {
    this.isLoading$ = this.categorieService.isLoading$;
    this.config();
  }


  config() {
    this.categorieService.configCategories().subscribe((resp: any) => {
      console.log(resp);
      this.categories_first = resp.categories_first;
      console.log(this.categories_first);
      this.categories_seconds = resp.categories_seconds;
      console.log(this.categories_seconds);
    })
  }
  // changeDepartamento(){
  //   this.categories_seconds_backups = this.categories_seconds.filter((item:any) => item.categorie_second_id == this.categorie_third_id)
  //   // console.log(this.categories_seconds_backups,)
  // }


  processFile($event: any, inputRef: any) {
    const file = $event.target.files[0]; // toma el primer archivo
    if (!file) return; // si no hay archivo, salimos

    if (file.type.indexOf("image") < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El archivo no es una imagen',
      });
      inputRef.value = null;
      this.image_previsualize = "assets/media/svg/illustrations/easy/2.svg"; // default
      this.file_image = null;
      return;
    }

    this.file_image = file;
    let reader = new FileReader();
    reader.readAsDataURL(this.file_image);
    reader.onloadend = () => this.image_previsualize = reader.result;

    this.isLoadingView();
  }

  processIcon($event: any, inputRef: any) {
    const file = $event.target.files[0];
    if (!file) return;

    // Revisar que sea una imagen (cualquier tipo de imagen)
    if (file.type.indexOf("image") < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El archivo no es una imagen',
      });

      inputRef.value = null;
      this.icon_previsualize = this.default_icon;
      this.icon = null;
      return;
    }

    this.icon = file; // guardamos para enviar al backend

    // Previsualización
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => this.icon_previsualize = reader.result;

    this.isLoadingView();
  }

removeImage(inputRef?: HTMLInputElement) {
  this.file_image = null;
  this.image_previsualize = "/assets/media/svg/files/blank-image.svg"; // default
  if (inputRef) inputRef.value = '';
}

removeIcon(inputRef?: HTMLInputElement) {
  this.icon = null;
  this.icon_previsualize = this.default_icon;

  if (inputRef) {
    inputRef.value = ''; // limpia el input file
  }
}



  isLoadingView() {
    this.categorieService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.categorieService.isLoadingSubject.next(false);
    }, 50);
  }


  changeTypeCategorie(val: number) {
    this.type_categorie = val;
    this.categorie_third_id = '';
    this.categorie_second_id = '';
  }

changeDepartament(){
  this.categories_seconds_backsups = this.categories_seconds.filter((item:any) => item.categorie_second_id == this.categorie_third_id)
  // console.log(this.categories_seconds_backups,)
}


  save() {
    if (!this.name || !this.position) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: 'Los campos con * son obligatorios',
      });
      return;
    }

    if (this.type_categorie == 2 && !this.categorie_second_id) {
      Swal.fire({
        icon: 'error',
        title: 'Departamento obligatorio',
        text: 'Debes seleccionar un departamento',
      });
      return;
    }

    if (this.type_categorie == 3 && (!this.categorie_second_id || !this.categorie_third_id)) {
      Swal.fire({
        icon: 'error',
        title: 'Campos obligatorios',
        text: 'El departamento y la categoría son obligatorios',
      });
    }


    let formData = new FormData();
    formData.append('type_categorie', this.type_categorie.toString());
    formData.append('name', this.name);
    formData.append('position', this.position.toString());

    if (this.categorie_second_id) {
      formData.append('categorie_second_id', this.categorie_second_id);
    }
    if (this.categorie_third_id) {
      formData.append('categorie_third_id', this.categorie_third_id);
    }
    if (this.icon) {
      formData.append('icon', this.icon);
    }
    if (this.file_image) {
      formData.append('image', this.file_image);
    }

    // 🚀 Activo spinner antes de la petición
    this.categorieService.isLoadingSubject.next(true);

    this.categorieService.createCategories(formData).subscribe({
      next: (res: any) => {
        if (res.mesagge === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Categoría creada con éxito',
          });
          console.log(res);
          this.name = ' ';
          this.position = 1;
          this.categorie_second_id = ' ';
          this.categorie_third_id = ' ';
          this.icon = null;
          this.type_categorie = 1;
          this.file_image = null;
          this.image_previsualize = "/assets/media/svg/files/blank-image.svg";
          this.icon_previsualize = this.default_icon;
          this.config();
        } else if (res.mesagge === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La categoría ya existe',
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Respuesta inesperada del servidor',
          });
          console.log(res);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'Respuesta inesperada del servidor',
        });
        console.error(err);
      },
      complete: () => {
        this.categorieService.isLoadingSubject.next(false);
      }
    });





  }



}

