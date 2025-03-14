import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { OrdersComponent } from './dashboard/orders/orders.component';
import { ProductsComponent } from './dashboard/products/products.component';
import { PromotionsComponent } from './dashboard/promotions/promotions.component';

const redirectLoggedInToDashboard = () => redirectLoggedInTo(['home']);
const redirectUnauthorizedTosignIn = () => redirectUnauthorizedTo('signin');

const routes: Routes = [{
  path: 'signin',
  component: SignInComponent,
  canActivate: [AngularFireAuthGuard],
  data: { authGuardPipe: redirectLoggedInToDashboard }
},
{
  path: 'dashboard', component: DashboardComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedTosignIn },
  children: [
    { path: 'orders', component: OrdersComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedTosignIn } },
    { path: 'products', component: ProductsComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedTosignIn } },
    { path: 'promotions', component: PromotionsComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedTosignIn } },
  ]
},
{ path: '**', redirectTo: '/dashboard/orders' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})


export class AppRoutingModule { }
