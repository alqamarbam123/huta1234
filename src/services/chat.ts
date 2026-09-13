import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ChatConversation, ChatMessage, Listing } from '../types';

/**
 * Listen to real-time conversations where the user is either buyer or seller.
 */
export function subscribeUserConversations(
  userId: string,
  onUpdate: (conversations: ChatConversation[]) => void,
  onError?: (err: unknown) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  let buyerConvs: ChatConversation[] = [];
  let sellerConvs: ChatConversation[] = [];

  const mergeAndEmit = () => {
    const map = new Map<string, ChatConversation>();
    buyerConvs.forEach((c) => map.set(c.id, c));
    sellerConvs.forEach((c) => map.set(c.id, c));
    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
    onUpdate(combined);
  };

  const buyerQuery = query(
    collection(db, 'conversations'),
    where('buyerId', '==', userId)
  );

  const sellerQuery = query(
    collection(db, 'conversations'),
    where('sellerId', '==', userId)
  );

  const unsubBuyer = onSnapshot(
    buyerQuery,
    (snapshot) => {
      buyerConvs = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatConversation, 'id'>),
      }));
      mergeAndEmit();
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'conversations');
      if (onError) onError(err);
    }
  );

  const unsubSeller = onSnapshot(
    sellerQuery,
    (snapshot) => {
      sellerConvs = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatConversation, 'id'>),
      }));
      mergeAndEmit();
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'conversations');
      if (onError) onError(err);
    }
  );

  return () => {
    unsubBuyer();
    unsubSeller();
  };
}

/**
 * Listen to real-time messages within a specific conversation.
 */
export function subscribeMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
) {
  if (!conversationId) {
    onUpdate([]);
    return () => {};
  }

  const messagesPath = `conversations/${conversationId}/messages`;
  const messagesQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, 'id'>),
      }));
      onUpdate(messages);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, messagesPath);
      if (onError) onError(err);
    }
  );
}

/**
 * Start or retrieve an existing conversation between a buyer and seller regarding a listing.
 */
export async function startOrGetConversation(
  listing: Listing,
  buyerUser: { id: string; name: string }
): Promise<string> {
  const convId = `${listing.id}_${buyerUser.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const convRef = doc(db, 'conversations', convId);

  try {
    const existingSnap = await getDoc(convRef);
    if (existingSnap.exists()) {
      return convId;
    }

    const newConversation: Omit<ChatConversation, 'id'> = {
      listingId: String(listing.id),
      listingTitle: String(listing.title).slice(0, 200),
      listingPrice: Number(listing.price) || 0,
      listingImage: String(listing.image || '').slice(0, 1000),
      buyerId: buyerUser.id,
      buyerName: buyerUser.name.slice(0, 100),
      sellerId: listing.userId || 'seller_system',
      sellerName: `Seller (${listing.phone || 'HUTA'})`,
      lastMessage: 'Conversation initiated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(convRef, newConversation);
    return convId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `conversations/${convId}`);
    throw err;
  }
}

/**
 * Send a message and update conversation's lastMessage and updatedAt.
 */
export async function sendChatMessage(
  conversationId: string,
  sender: { id: string; name: string },
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const now = new Date().toISOString();
  const messagesPath = `conversations/${conversationId}/messages`;

  try {
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      conversationId,
      senderId: sender.id,
      senderName: sender.name.slice(0, 100),
      text: trimmed.slice(0, 2000),
      createdAt: now,
    });

    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: trimmed.slice(0, 500),
      updatedAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, messagesPath);
    throw err;
  }
}
