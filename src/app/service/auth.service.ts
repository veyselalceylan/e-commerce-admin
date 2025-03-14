import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { deleteUser, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroments';
import { FirebaseServerApp, initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, child } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private db = getDatabase(initializeApp(environment.firebaseConfig));
  private auth = getAuth(initializeApp(environment.firebaseConfig));
  private userSubject = new BehaviorSubject<any>(null);
  user$: Observable<any>;
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.afAuth.onAuthStateChanged(user => {
      this.userSubject.next(user);
       
    });
    console.log(this.userSubject)
    this.user$ = afAuth.authState;
  }
  
  isUserLoggedIn() {
    return this.user$;
  }
  async signIn(email: string, password: string): Promise<string | null> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      return null;
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        return "Wrong Password";
      }
      return "Failed: " + error.message;
    }
  }

  signOut() {
    return this.afAuth.signOut();
  }
}
