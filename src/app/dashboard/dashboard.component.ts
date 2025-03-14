import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { PriceService } from '../service/price.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    items: MenuItem[] | undefined;
    showPricePopup: boolean = false;
    pricing: any[] = [];
    constructor(private authService: AuthService, private router: Router,
        private priceService: PriceService
    ) {
        this.priceService.getPricing().then((result) => {
            console.log(result)
            this.pricing = Object.entries(result).map(([key, product]) => {
                if (Array.isArray(product)) {
                    const prices = product
                        .filter(item => item !== null)
                        .map(item => {
                            return {
                                price: item.new !== undefined ? item.new : null,
                                oldPrice: item.old !== undefined ? item.old : null
                            };
                        });

                    return { name: key, prices };
                } else {
                    return { key };
                }
            });
            console.log(this.pricing)
        })
    }
    ngOnInit() {
        this.items = [
            {
                label: 'Orders',
                icon: 'pi pi-cart-arrow-down',
                routerLink: '/dashboard/orders'
            },
            {
                label: 'Products',
                icon: 'pi pi-box',
                routerLink: '/dashboard/products'
            },
            {
                label: 'Promotions',
                icon: 'pi pi-gift',
                routerLink: '/dashboard/promotions'
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.authService.signOut();
                    this.router.navigate(['/signin'])
                }
            }
        ]
    }

    hideDialog() {
        this.showPricePopup = false;
    }

    saveOrder() {

    }
}
