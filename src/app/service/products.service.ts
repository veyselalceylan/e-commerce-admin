import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getDatabase, onValue, ref, set, push, update, get, remove, query as dbQuery,
  orderByKey, startAt, endAt, limitToFirst, orderByChild, equalTo
} from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, listAll, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  db = getDatabase(initializeApp(environment.firebaseConfig));
  private storage = getStorage(initializeApp(environment.firebaseConfig));
  constructor() { }

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private productsSubjectForCat: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  getProducts(): any {
    const listRef = dbQuery(ref(this.db, 'products'));
    onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.productsSubject.next(data);
      } else {
        this.productsSubject.next([]);
      }
    });
  }
  getproductsObservable(): Observable<any[]> {
    return this.productsSubject.asObservable();
  }

  async addProduct(product: any, images: Blob[]): Promise<void> {
    try {
      product.lastEditedDate = Date.now();
      product.imageValid =false;
      product.mainDescription = 'Main description goes here';
      product.secondDescription = 'Second description goes here';
      product.quantity = 999;
      product.createdDate = Date.now();
      const productRef = ref(this.db, `products/${product.mainCategory}/${product.secondCategory}`);
      const newProductRef = push(productRef); 
      const newProductKey = newProductRef.key;
      product.key = newProductKey;
      product.code = newProductKey;
      await set(newProductRef, product);
      if (!newProductKey) {
        throw new Error("Failed to generate product ID");
      }
      const imageUrls = await this.uploadPhotos(images, 'categories', product.mainCategory, product.secondCategory, newProductKey);
      product.imageUrl = imageUrls[0];
      product.key = newProductKey;
      await update(newProductRef, product);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(product: any, images: Blob[]): Promise<void> {
    try {
      product.lastEditedDate = Date.now();
      const productRef = ref(this.db, `products/${product.mainCategory}/${product.secondCategory}/${product.key}`);
      if (product.oldFileUrl) {
        await this.deleteFile(product.oldFileUrl);
      }
      const imageUrls = await this.uploadPhotos(images, 'categories', product.mainCategory, product.secondCategory, product.key);
      product.imageUrl = imageUrls[0];
      await update(productRef, product);

    } catch (error) {
      console.error('Error updating product:', error);
      const productRef = ref(this.db, `products/${product.mainCategory}/${product.secondCategory}/${product.key}`);
      await remove(productRef).catch(removeError => {
        console.error('Error removing product:', removeError);
      });

      throw error;
    }
  }


  deleteFile(filePath: string): Promise<void> {
    const fileRef = storageRef(this.storage, filePath);

    return getMetadata(fileRef).then((metadata: any) => {
      console.log('File exists, proceeding with delete');
      return deleteObject(fileRef);
    }).catch((error: any) => {
      if (error.code === 'storage/object-not-found') {
        console.log('File not found, skipping delete');
      } else {
        console.error('Error getting file metadata:', error);
        throw error;
      }
    });
  }

  async uploadPhotos(blobImages: Blob[], categories: string, main: string, second: string, id: string): Promise<any[]> {
    if (!id) {
      throw new Error('Invalid product ID');
    }

    const uploadPromises: Promise<any>[] = [];
    const path = `${categories}/${main}/${second}/`;

    blobImages.forEach((blobImage, index) => {
      const mimeType = blobImage instanceof File ? blobImage.type : 'image/jpeg';
      const fileExtension = mimeType.split('/')[1];
      const fileName = `${id}.${fileExtension || 'jpg'}`;

      const filePath = `${path}${fileName}`;
      const fileRef = storageRef(this.storage, filePath);

      uploadPromises.push(
        uploadBytes(fileRef, blobImage).then((result) => {
          console.log(result);
          return getDownloadURL(fileRef);
        }).then(downloadURL => {
          return downloadURL;
        }).catch(error => {
          console.error("Error uploading file:", error);
          throw error;
        })
      );
    });

    return Promise.all(uploadPromises);
  }

  async deleteProduct(product: any) {
    const productRef = ref(this.db, `products/${product.mainCategory}/${product.secondCategory}/${product.key}`);
    await remove(productRef)
      .then(() => {
        console.log("Product successfully deleted");
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  }

}
