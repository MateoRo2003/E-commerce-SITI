import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CategoriesService } from '../service/categories.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-edit-categorie',
  templateUrl: './edit-categorie.component.html',
  styleUrls: ['./edit-categorie.component.scss']
})
export class EditCategorieComponent {


  type_categorie: number = 1;
  name: string = '';
  icon: any = null;
  position: number = 1;
  categorie_second_id: string = '';
  categorie_third_id: string = '';
  status: string = '1';
  icon_removed = false;
  image_removed = false;

  image_previsualize: any = "/assets/media/svg/files/blank-image.svg";
  file_image: any = null;
  default_icon: string = "/assets/media/svg/files/blank-image.svg";
  icon_previsualize: any = this.default_icon;

  isLoading$: any;
  categories_first: any = [];
  categories_seconds: any = [];
  CATEGORIE_ID: string = '';
  CATEGORIE: any = null;
  categories_seconds_backsups: any = [];
  // categories_seconds_backups:any = [];
  constructor(
    public categorieService: CategoriesService,
    public activatedRoute: ActivatedRoute

  ) {

  }
  ngOnInit(): void {
    this.isLoading$ = this.categorieService.isLoading$;
    this.config();

    this.activatedRoute.params.subscribe((resp: any) => {
      console.log(resp);
      this.CATEGORIE_ID = resp.id;
    });

    this.categorieService.showCategorie(this.CATEGORIE_ID).subscribe((resp: any) => {
      console.log(resp);
      this.CATEGORIE = resp.categorie;
      this.type_categorie = resp.categorie.type_categorie;
      this.name = resp.categorie.name;
      this.icon = resp.categorie.icon;
      this.position = resp.categorie.position;
      this.categorie_second_id = resp.categorie.categorie_second_id;
      this.categorie_third_id = resp.categorie.categorie_third_id;

      // Validación de imagen y icono
      this.image_previsualize = resp.categorie.image
        ? resp.categorie.image
        : "/assets/media/svg/files/blank-image.svg";

      this.icon_previsualize = resp.categorie.icon
        ? resp.categorie.icon
        : this.default_icon;

      this.status = resp.categorie.status;
      if (this.type_categorie == 3 && this.categorie_third_id) {
        this.changeDepartament();
        this.categorie_second_id = resp.categorie.categorie_second_id;
      }
    });
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
  removeIcon(inputRef?: HTMLInputElement) {
    this.icon = null;
    this.icon_previsualize = this.default_icon;
    this.icon_removed = true; // 🔹 marca que el usuario eliminó el icono
    if (inputRef) inputRef.value = '';
  }

  removeImage(inputRef?: HTMLInputElement) {
    this.file_image = null;
    this.image_previsualize = this.default_icon;
    this.image_removed = true; // 🔹 marca que el usuario eliminó la imagen
    if (inputRef) inputRef.value = '';
  }

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



  isLoadingView() {
    this.categorieService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.categorieService.isLoadingSubject.next(false);
    }, 50);
  }


  changeTypeCategorie(val: number) {
    this.type_categorie = val
    this.categorie_third_id = '';
    this.categorie_second_id = '';
  }

  changeDepartament() {
    // Filtrar categorías (segundo nivel) según el departamento seleccionado (primer nivel)
    this.categories_seconds_backsups = this.categories_seconds.filter(
      (item: any) => item.categorie_second_id == this.categorie_third_id
    );

    // Resetear la categoría de segundo nivel al cambiar de departamento
    this.categorie_second_id = '';
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
      return;
    }

    let formData = new FormData();
    formData.append('type_categorie', this.type_categorie.toString());
    formData.append('name', this.name);
    formData.append('position', this.position.toString());
    formData.append('status', this.status);

    if (this.categorie_second_id) formData.append('categorie_second_id', this.categorie_second_id);
    if (this.categorie_third_id) formData.append('categorie_third_id', this.categorie_third_id);

    if (this.icon) {
      formData.append('icon', this.icon);
    } else if (this.icon_removed) {
      formData.append('icon_delete', 'true'); // 🔹 solo si se eliminó
    }

    if (this.file_image) {
      formData.append('image', this.file_image);
    } else if (this.image_removed) {
      formData.append('image_delete', 'true'); // 🔹 solo si se eliminó
    }

    this.categorieService.isLoadingSubject.next(true);

    this.categorieService.uptdateCategories(this.CATEGORIE_ID, formData).subscribe({
      next: (res: any) => {
        if (res.mesagge === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Categoría actualizada con éxito',
          });
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
      complete: () => this.categorieService.isLoadingSubject.next(false)
    });
  }

}
