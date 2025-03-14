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
export class OrdersService {
  db = getDatabase(initializeApp(environment.firebaseConfig));
  private storage = getStorage(initializeApp(environment.firebaseConfig));
  constructor() { }

  private productsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private productsSubjectForCat: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  getOrders(): any {
    const listRef = dbQuery(ref(this.db, 'orders'));
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

  async updateProduct(order: any): Promise<void> {
    try {
      order.lastEditedDate = Date.now();
      const productRef = ref(this.db, `orders/${order.key}`);
      await update(productRef, order);

    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async updateOrder(order: any): Promise<void> {
    try {
      console.log(order)
      order.lastEditedDate = Date.now();
      const orderRef = ref(this.db, `orders/${order.key}`);
      await update(orderRef, order);

    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

}
