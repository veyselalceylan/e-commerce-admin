import { Component, OnInit } from '@angular/core';
import { PriceService } from '../../service/price.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css',
  providers: [MessageService, ConfirmationService],
})

export class PromotionsComponent implements OnInit {
  promotions: any[] = [];
  selectedPromotions: any[] = [];
  store: any;
  promotionDialog: boolean = false;
  discount: any;
  quantity: any;
  email: any;
  date: Date | undefined;
  originalStoreSuggestions: string[] = [];
  storeSuggestions: string[] = [];
  searchValue: string = '';
  constructor(private priceService: PriceService, private messageService: MessageService, private confirmationService: ConfirmationService,) {
    this.priceService.getPromotionsObservable().subscribe((result) => {
      this.promotions = Object.entries(result).map(([proId, prom]: [string, any]) => {
        if (typeof prom === 'object' && prom !== null) {
          return {
            key: proId,
            ...prom
          };
        }
        return null;
      });
    })
    this.priceService.getPromotions();
  }

  search(event: any) {
    this.storeSuggestions = this.originalStoreSuggestions.filter((s) =>
      s.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  ngOnInit(): void {
    this.priceService.getStores().subscribe((stores) => {
      this.originalStoreSuggestions = stores;
    });
  }

  openDialog() {
    this.promotionDialog = true;
  }

  hideDialog() {
    this.promotionDialog = false;
  }

  createCode(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to create ' + this.quantity + ' promotion code?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this.promotionDialog = false;
        this.priceService.addPromotion(this.discount, this.email, this.store).then((res) => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Promotion Codes Have Been Created', life: 3000 });
          this.discount = 0; this.email = ''; this.store = ''; this.quantity = 0; this.date = undefined;
        }).catch((err) => {
          this.messageService.add({ severity: 'warning', summary: 'Rejected', detail: 'There is Problem on Database', life: 3000 });
        })
      }
    });

  }

  deletePromotions() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to create ' + this.quantity + ' promotion code?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this.priceService.deletePromotions(this.selectedPromotions).then((res) => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Promotion Codes Have Been Deleted', life: 3000 });
        }).catch((err) => {
          this.messageService.add({ severity: 'warning', summary: 'Rejected', detail: 'There is Problem on Database', life: 3000 });
        })
      }
    });


  }

}
