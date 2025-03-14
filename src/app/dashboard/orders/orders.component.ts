import { Component } from '@angular/core';
import { OrdersService } from '../../service/orders.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  orderDialog: boolean = false;

  searchValue: string = '';

  orders: any[] = [];

  order!: any;

  selectedOrders!: any[] | null;

  submitted: boolean = false;

  expandedRows = {};

  expandAll() {
    this.expandedRows = this.orders.reduce((acc, p) => (acc[p.key] = true) && acc, {});
  }

  collapseAll() {
    this.expandedRows = {};
  }
  statuses = [
    { label: 'INSTOCK', value: 'INSTOCK' },
    { label: 'LOWSTOCK', value: 'LOWSTOCK' },
    { label: 'OUTOFSTOCK', value: 'OUTOFSTOCK' }
  ];

  constructor(private ordersService: OrdersService, private messageService: MessageService, private confirmationService: ConfirmationService,
    private http: HttpClient
  ) {
    this.ordersService.getproductsObservable().subscribe((result: any) => {
      this.orders = Object.entries(result).map(([prodId, prod]: [string, any]) => {
        if (typeof prod === 'object' && prod !== null) {
          return {
            key: prodId,
            ...prod,
            imageValid: true
          };
        }
        return null;
      });
    })
    this.ordersService.getOrders()
  }

  openNew() {
    this.order = {};
    this.submitted = false;
    this.orderDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected orders?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orders = this.orders.filter((val) => !this.selectedOrders?.includes(val));
        this.selectedOrders = null;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
      }
    });
  }

  editOrder(order: any) {
    this.order = { ...order };

    this.orderDialog = true;
  }
  hideDialog() {
    this.orderDialog = false;
    this.submitted = false;
  }
  saveOrder() {
    this.submitted = true;

    if (this.order.key?.trim()) {
      const result = this.order;
      if (this.order.key) {
        this.orders[this.findIndexById(this.order.id)] = this.order;
        this.ordersService.updateOrder(this.order).then((results) => {
        
          console.log(result)
          this.http.post('https://app-r6z5go6nha-uc.a.run.app/order-email', result)
          .subscribe(async (res: any) => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Order Updated', life: 3000 });
          })
        }).catch((error) => {
          this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'Order Not Updated', life: 3000 });
          console.log(this.order)
        })
      } else {

      }

      this.orders = [...this.orders];
      this.orderDialog = false;
      this.order = {};
    }
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.orders.length; i++) {
      if (this.orders[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  downloadPhotos(imageUrls: string[]): void {
    console.log(imageUrls)
    imageUrls.forEach((url, index) => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `image_${index + 1}`;
      anchor.target = '_blank';
      anchor.click();
      anchor.remove();
    });
  }
  async downloadPhoto(url: string, filename: string) {
    try {
      const response = await fetch(url, {
        mode: 'cors'
      });
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('İndirme sırasında hata oluştu:', error);
    }
  }
  getSizeSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'Smallest':
        return 'secondary';
      case '15 CM':
        return 'info';
      case '20 CM':
        return 'warning';
      case '25 CM':
        return 'danger';
      case '30 CM':
        return 'contrast';
      default:
        return 'success';
    }
  }
  getPaymentStatusSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'contrast';
    }
  }
  getCustomerTypeSeverity(status: boolean): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case true:
        return 'contrast';
      case false:
        return 'info';
      default:
        return 'warning';
    }
  }
  getShippingStatusSeverity(status: string): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'warning';
    }
  }
  onRowExpand(event: TableRowExpandEvent) {
    this.messageService.add({ severity: 'info', summary: 'Order Expanded', detail: event.data.key, life: 3000 });
  }

  onRowCollapse(event: TableRowCollapseEvent) {
    this.messageService.add({ severity: 'success', summary: 'Order Collapsed', detail: event.data.key, life: 3000 });
  }
  downloadCSV(){

  }


}
