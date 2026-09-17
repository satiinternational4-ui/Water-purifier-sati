import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

const PRODUCTS_COLLECTION = 'products';

// Test connection to Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client appears offline.');
      return false;
    }
    // Connection test document may not exist, but network reachability succeeded
    return true;
  }
}

// Subscribe to real-time products updates from Firestore
export function subscribeToProducts(
  onProducts: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onProducts([]);
        return;
      }
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Product);
      });
      onProducts(items);
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

// Fetch all products directly from Firestore
export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const items: Product[] = [];
    snap.forEach((d) => {
      items.push(d.data() as Product);
    });
    return items;
  } catch (err) {
    console.warn('Failed to fetch from Firestore:', err);
    return null;
  }
}

// Save or update a product in Firestore
export async function saveProductToFirestore(product: Product): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
  // Clean product payload before write
  const payload = {
    ...product,
    rating: product.rating ?? 5.0,
    reviewCount: product.reviewCount ?? 1,
    badge: product.badge || '',
  };
  await setDoc(docRef, payload, { merge: true });
}

// Save an entire catalog batch to Firestore
export async function saveCatalogToFirestore(products: Product[]): Promise<void> {
  const promises = products.map((prod) => saveProductToFirestore(prod));
  await Promise.all(promises);
}

// Delete a product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(docRef);
}
