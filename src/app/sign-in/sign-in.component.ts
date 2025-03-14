import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
  providers: [MessageService]
})
export class SignInComponent {
  email: string = '';
  password: string = '';
  constructor(private authService: AuthService,private messageService: MessageService, private router: Router){

  }

  async signIn(email: string, password: string) {
    const error = await this.authService.signIn(email, password);
    if (error) {
      this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Invalid Mail or Password, Please Try Again', life: 3000 });
    } else {
      this.router.navigate(['dashboard/orders']);
    }
  }

}
