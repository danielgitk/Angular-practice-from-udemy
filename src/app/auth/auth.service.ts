import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { ThrowStmt } from '@angular/compiler';
import { Router } from '@angular/router';

@Injectable({providedIn: "root"})
export class AuthService{

    private token: string;
    private isAuthenticated = false;
    private tokenTimer : any;
    private userId: string;
   
    private authStatusListener = new Subject<boolean>();
    
    
    constructor (private http: HttpClient, private router:Router ){}

    getToken(){
        return this.token;
    }
    getUserId(){
        return this.userId;
    }
    getAuthStatusListener(){
        return this.authStatusListener.asObservable();
    }
    getIsAuth(){
        return this.isAuthenticated;
    }

    createUser(email:string , password:string){
        const authData: AuthData = {email: email, password: password};
        this.http.post("http://localhost:3000/api/user/signup",authData)
        .subscribe(response => {
            console.log(response);
        });
    }

    logout(){
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
        
    }

    login(email:string, password: string){
        const authData: AuthData = {email: email, password: password};
        this.http.post<{token: string, expiresIn: number, userId: string}>("http://localhost:3000/api/user/login", authData).subscribe(response =>{
            console.log(response);  
            const token = response.token;
            this.token = token;
            if(token){
                const expiresIn = response.expiresIn;
                this.setAuthTimer(expiresIn) 
                console.log(expiresIn);
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + expiresIn*1000);
                this.saveAuthData(token,expirationDate,this.userId);
                console.log(expirationDate);
                this.router.navigate(['/']);
                
            }
            
        } )
    }
    private setAuthTimer(duration: number){
        console.log("setting timer" + duration);
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token:string, expirationDate: Date, userId: string){
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem("userId", userId);
    }
    private clearAuthData(){
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    autoAuthUser(){
        const authInformation =  this.getAuthData();
        if (!authInformation){
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        const userId = authInformation.userId;
        if(expiresIn > 0){
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.setAuthTimer(expiresIn/1000);
            this.authStatusListener.next(true);

        }
    }

    private getAuthData(){
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const expirationDate = localStorage.getItem("expiration");
        if(!token || !expirationDate){
            return;
        }
        return{
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }
    
}