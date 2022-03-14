import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import jwt_decode from "jwt-decode";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  decodedToken: Token;

  login(email:string, password:string ) {
    return this.http.post<any>('http://localhost:3002/login', {email, password})
      .subscribe(res => {
        console.log(res);
        this.decodedToken = jwt_decode(res.token);
        console.log(this.decodedToken);
        localStorage.setItem('id_token', res.token);
        localStorage.setItem('expires_at', String(this.decodedToken.exp))
        localStorage.setItem('decoded_token', JSON.stringify(this.decodedToken))
      });
  }

  logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
    var x: number = Number(localStorage.getItem('expires_at'));
    var d = new Date();
    var seconds = d.getTime() / 1000;
    return seconds<x;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }


  joinOrganization(organizationId) {
    return this.http.put<any>('http://localhost:3002/joinOrganization/', {organizationId: organizationId, token: localStorage.getItem('id_token')});
  }

}

export class Token {
  exp: number;
  user_id: string;
  organization: number;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem("id_token");
    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set("x-access-token",
         idToken)
      });
      return next.handle(cloned);
    }
    else {
      return next.handle(req);
    }
  }
}
