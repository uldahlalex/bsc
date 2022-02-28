import {Injectable} from '@angular/core';
import * as moment from "moment";
import {HttpClient} from "@angular/common/http";
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(private http: HttpClient) {

  }


  login(email:string, password:string ) {
    return this.http.post<any>('http://localhost:3002/login', {email, password})
      .subscribe(res => {
        let token: Token = jwt_decode(res.token);
        localStorage.setItem('id_token', res.token);
        localStorage.setItem('expires_at', String(token.exp))
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
}

class Token {
  exp: number;
}
