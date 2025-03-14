import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getDatabase, onValue, ref, set, push, update, get, remove, query as dbQuery,
  orderByKey, startAt, endAt, limitToFirst, orderByChild, equalTo
} from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, listAll, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroments';
import { AngularFireDatabase } from '@angular/fire/compat/database';
@Injectable({
  providedIn: 'root'
})
export class PriceService {

  constructor(private dbForList: AngularFireDatabase) { }
  private storage = getStorage(initializeApp(environment.firebaseConfig));
  db = getDatabase(initializeApp(environment.firebaseConfig));

  private promotionsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  getPromotions(): any {
    const listRef = dbQuery(ref(this.db, 'promotions'));
    onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.promotionsSubject.next(data);
      } else {
        this.promotionsSubject.next([]);
      }
    });
  }
  getPromotionsObservable(): Observable<any[]> {
    return this.promotionsSubject.asObservable();
  }

  getPricing(): Promise<any> {
    let listRef = ref(this.db, 'price');
    return get(listRef).then((snapshot) => {
      const data = snapshot.val();
      return data;
    }).catch((error) => {
      console.error('Firebase error: ', error);
      return [];
    });
  }

  async updatePrice(prices: any): Promise<void> {
    await Promise.all(
      prices.map(async (category: any) => {
        await Promise.all(
          category.prices.map(async (price: any, index: number) => {
            const key = 'price';
            if (price.hasOwnProperty(key)) {
              let listRef = ref(this.db, `price/${category.name}/${index}`);
              const cost = {
                new: price.price,
                old: price.oldPrice,
              };

              await set(listRef, cost);
            } else {
              console.log('Key not found in price object');
            }
          })
        );
      })
    );
  }

  getHomePageDetails(): Promise<any> {
    let listRef = ref(this.db, 'title');
    return get(listRef).then((snapshot) => {
      const data = snapshot.val();
      return data;
    }).catch((error) => {
      console.error('Firebase error: ', error);
      return [];
    });
  }
  async updateTextAndImage(home: any, images: Blob[]): Promise<void> {
    try {
      const productRef = ref(this.db, `title`);
      if (images.length){
        if (home.image) {
          await this.deleteFile(home.image);
        }
        const imageUrls = await this.uploadPhotos(images);

        home.image = imageUrls[0];
      }
      await update(productRef, home);

    } catch (error) {
      console.error('Error updating product:', error);
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



  async uploadPhotos(blobImages: Blob[]): Promise<any[]> {
    const uploadPromises: Promise<any>[] = [];
    const path = `title/`;

    blobImages.forEach((blobImage, index) => {
      const mimeType = blobImage instanceof File ? blobImage.type : 'image/jpeg';
      const fileExtension = mimeType.split('/')[1];
      const fileName = `image.${fileExtension || 'jpg'}`;

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


  getStores(): Observable<any> {
    return this.dbForList
      .list<any>('promotions')
      .valueChanges()
      .pipe(map((promotions: any) => [...new Set(promotions.map((promotion: any) => promotion.store))]));
  }

  async addPromotion(discount: number, email: string, store: string): Promise<void> {
    try {
      const productRef = ref(this.db, `promotions`);
      const newProductRef = push(productRef);
      const newProductKey = newProductRef.key; 
      
      const promotionCode = this.generatePromotionCode();
  
      const item = {
        key: newProductKey,
        store: store,
        email: email,
        discount: discount,
        promotionCode: promotionCode, 
      };
  
      await set(newProductRef, item);
    } catch (error) {
      console.error('Error adding promotion:', error);
      throw error;
    }
  }
  
  generatePromotionCode(): string {
    const randomCode = Math.floor(10000000 + Math.random() * 90000000); 
    return randomCode.toString();
  }

  async deletePromotions(selectedPromotions:any): Promise<any>{
    selectedPromotions.forEach(async (element:any) => {
      const productRef = ref(this.db, `promotions/${element.key}`);
      await remove(productRef)
        .then(() => {
          console.log("Promotions successfully deleted");
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
        });
    });
  }
  

}
