import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, finalize } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root'
})
export class AttributesService {

  isLoading$: Observable<boolean>;
    isLoadingSubject: BehaviorSubject<boolean>;
  
    constructor(
      private http: HttpClient,
      public authservice: AuthService,
    ) {
      this.isLoadingSubject = new BehaviorSubject<boolean>(false);
      this.isLoading$ = this.isLoadingSubject.asObservable();
    }
  
    listAttributes(page: number = 1, search:string) {
      this.isLoadingSubject.next(true)
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authservice.token });
      let URL = URL_SERVICIOS + "/admin/attributes?page="+page+"&search="+search;
      return this.http.get(URL, { headers: headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false))
      );
  
    }
  
    createAttributes(data: any) {
      this.isLoadingSubject.next(true);
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authservice.token });
      let URL = URL_SERVICIOS + "/admin/attributes";
      return this.http.post(URL, data, { headers: headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false))
      );
  
    }
  
    uptdateAttributes(categorie_id: string, data: any) {
      this.isLoadingSubject.next(true);
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authservice.token });
      let URL = URL_SERVICIOS + "/admin/attributes/" + categorie_id;
      return this.http.post(URL, data, { headers: headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false))
      );
  
    }
  
    deleteAttributes(categorie_id: string) {
      this.isLoadingSubject.next(true)
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authservice.token });
      let URL = URL_SERVICIOS + "/admin/attributes/" + categorie_id;
      return this.http.delete(URL, { headers: headers }).pipe(
        finalize(() => this.isLoadingSubject.next(false))
      );
  
    }
}
