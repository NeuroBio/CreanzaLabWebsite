import { Injectable }         from '@angular/core';
import { AngularFireAuth }    from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/Classes/user'; 
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  redirectUrl: string;  
  
  user: Observable<User>;

  constructor(private authorize: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router){ 

    this.user = this.authorize.authState.pipe(
      switchMap(user => {
        if (user) {
          this.afs.doc<User>(`Users/${user.uid}`).valueChanges().subscribe(x => console.log(x))
          return this.afs.doc<User>(`Users/${user.uid}`).valueChanges()
        } else {
          return of (null)
        }
      })
    )
  }

  googleLogin() {
    const provider = new auth.GoogleAuthProvider()
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.authorize.auth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential.user)
      })
  }

  private updateUserData(user) {
    const data: User = {
      name: user.name,
      roles: user.roles
    }

    return data
  }

  logout() {
    this.authorize.auth.signOut();
  }

}