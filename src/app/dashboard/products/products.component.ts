import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductsService } from '../../service/products.service';
import { PriceService } from '../../service/price.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  providers: [MessageService, ConfirmationService],
  styles: [
    `:host ::ng-deep .p-dialog .product-image {
          width: 150px;
          margin: 0 auto 2rem auto;
          display: block;
      }`
  ]
})
export class ProductsComponent {
  productDialog: boolean = false;
  homeDialog: boolean = false;
  store: any[] = [];
  home: Home = {
    color: '',
    navbarTitle: '',
    title1: '',
    title2: '',
    title3: '',
    title4: '',
    image: ''
  };

  homeImages: any[] = [];

  products: any[] = [];

  product!: any;

  priceDialog: boolean = false;

  searchValue: string = '';

  selectedProducts!: any[] | null;

  submitted: boolean = false;

  images: Blob[] = [];

  price: Price = {
    percentage: 0
  };
  prices: any[] = [];
  statuses = [
    { label: 'INSTOCK', value: 'INSTOCK' },
    { label: 'LOWSTOCK', value: 'LOWSTOCK' },
    { label: 'OUTOFSTOCK', value: 'OUTOFSTOCK' }
  ];
  kidsSubCategories = [
    { label: 'Boys', value: 'boys' },
    { label: 'Girls', value: 'girls' },
    { label: 'Baby', value: 'baby' }
  ];

  manSubCategories = [
    { label: 'Business', value: 'business' },
    { label: 'Casual', value: 'casual' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Hero', value: 'hero' },
    { label: 'Music', value: 'music' },
    { label: 'Soldier', value: 'soldier' },
    { label: 'Sport', value: 'sport' }
  ];

  womanSubCategories = [
    { label: 'Business', value: 'business' },
    { label: 'Casual', value: 'casual' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Hero', value: 'hero' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Music', value: 'music' },
    { label: 'Soldier', value: 'soldier' },
    { label: 'Sport', value: 'sport' }

  ];

  otherSubCategories = [
    { label: 'Family', value: 'family' },
    { label: 'Lover', value: 'lover' },
    { label: 'Married', value: 'married' },
    { label: 'School', value: 'school' }
  ];
  originalStoreSuggestions: string[] = [];
  storeSuggestions: string[] = [];


  constructor(private productService: ProductsService, private messageService: MessageService, private confirmationService: ConfirmationService,
    private priceService: PriceService
  ) {
  
    this.productService.getproductsObservable().subscribe((result: any) => {
      this.products = Object.keys(result).flatMap((categoryKey) =>
        Object.entries(result[categoryKey]).flatMap(([id, product]: [string, any]) => {
          if (typeof product === 'object' && product !== null) {
            return Object.entries(product).map(([prodId, prod]: [string, any]) => {
              if (typeof prod === 'object' && prod !== null) {
                return {
                  key: prodId,
                  ...prod,
                  imageValid: true
                };
              }
              return null;
            }).filter(prod => prod !== null);
          }
          return null;
        })
      ).filter(product => product !== null).flat();
      this.shuffleArray(this.products);
    })
    this.productService.getProducts()
    this.priceService.getPricing().then((result) => {
      this.preData(result);
    });
    this.priceService.getStores().subscribe((stores) => {
      console.log(stores)
      this.originalStoreSuggestions = stores;
      this.storeSuggestions = stores;
    });
  }
  searchRugSupplier(event: any) {
    this.storeSuggestions = this.originalStoreSuggestions.filter((s) =>
      s.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  columns: number[] = [1, 2, 3, 4, 5, 6];
  preData(array: any) {
    this.prices = Object.entries(array).map(([key, price]) => {
      if (Array.isArray(price)) {
        const prices = price
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
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter((val) => !this.selectedProducts?.includes(val));
        this.selectedProducts = null;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
      }
    });
  }

  editProduct(product: any) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(product).then((result) => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
        }).catch((err: any) => {
          this.product = {};
          this.messageService.add({ severity: 'warning', summary: 'Rejected', detail: 'Product Not Deleted', life: 3000 });
        })
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.priceDialog = false;
    this.homeDialog = false;
    this.submitted = false;
  }
  onUpload(event: any) {
    const uploadedFile = event.files[0];
    const fileUrl = uploadedFile.objectURL;
    if (this.product.imageUrl) {
      this.product = { oldFileUrl: this.product.imageUrl, ...this.product };
    }
    this.images.push(uploadedFile);
    this.product.imageUrl = fileUrl.changingThisBreaksApplicationSecurity;
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }
  saveProduct() {
    this.submitted = true;

    if (this.product.name?.trim()) {
      if (this.product.key) {
        this.products[this.findIndexById(this.product.id)] = this.product;
        this.productService.updateProduct(this.product, this.images).then((result) => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        }).catch((error) => {
          this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'Product Not Updated', life: 3000 });
        })

      } else {
        console.log(this.product as Product)
        this.productService.addProduct(this.product as Product, this.images).then((result) => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }).catch((error) => {
          this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'Product Not Created', life: 3000 });
        })
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {};
    }
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }


  openPrice() {
    this.submitted = false;
    this.priceDialog = true;
  }

  onPercentageChange($event: any) {
    const factor = $event.value / 100;
    this.prices.forEach(item => {
      item.prices.forEach((priceItem: any) => {
        if (priceItem.oldPrice && !isNaN(priceItem.oldPrice)) {
          priceItem.price = parseFloat((priceItem.oldPrice - (priceItem.oldPrice * factor)).toFixed(2));
        }
      });
    });
    console.clear();
    return this.prices;
  }
  savePrice() {
    this.submitted = true;
    this.priceService.updatePrice(this.prices).then((res: any) => {
      this.priceDialog = false;
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Prices Have Been Updated', life: 3000 });
    })
  }

  openHome() {
    this.priceService.getHomePageDetails().then((result) => {
      this.home = result;
    })
    this.submitted = false;
    this.homeDialog = true;
  }

  onUploadHome(event: any) {
    const uploadedFile = event.files[0];
    this.homeImages.push(uploadedFile)
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded with Basic Mode' });
  }

  saveHomeDetails() {
    this.submitted = true;
    this.priceService.updateTextAndImage(this.home, this.homeImages).then((res) => {
      this.homeDialog = false;
      this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Home Page Details Has Benn Updated' });
    }).catch((err) => {
      this.messageService.add({ severity: 'warning', summary: 'Error', detail: 'There is a Problem On Database' });
    })
  }

}
interface Product {
  key: string;
  code: string;
  countOfPhotos: number;
  createdDate: number;
  inStock: string;
  lastEditedDate: number;
  mainCategory: string;
  mainDescription: string;
  name: string;
  quantity: number;
  secondCategory: string;
  secondDescription: string;
  imageValid: boolean;
  imageUrl: string;
}

interface Price {
  percentage: number
}

interface Home {
  color: string;
  navbarTitle: string;
  title1: string;
  title2: string;
  title3: string;
  title4: string;
  image: string;
}

interface Promotion {
  discount: number;
  store: string;
}