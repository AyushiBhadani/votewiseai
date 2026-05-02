import { db, auth } from './firebase';
import {
  collection, addDoc, updateDoc, doc,
  getDocs, deleteDoc, query, where,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string; // story mode illustration
  intent?: string;
  registrationUrl?: { url: string; label: string } | null;
}

export interface Conversation {
  id: string;
  title: string;
  country: string;
  language: string;
  messages: Message[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  uid?: string;
}

export interface DownloadedFile {
  id: string;
  name: string;
  country: string;
  size: string;
  downloadedAt: Timestamp | null;
  uid?: string;
}

export interface CommunityPost {
  id: string;
  name: string;
  avatar: string;
  country: string;
  message: string;
  likes: number;
  createdAt: Timestamp | null;
  uid?: string;
}

const CONVERSATIONS = 'conversations';
const DOWNLOADS = 'downloads';
const COMMUNITY_POSTS = 'communityPosts';

// Helper — get current anonymous user's UID
const getUid = (): string | null => auth.currentUser?.uid || null;

// ── CONVERSATIONS ──────────────────────────────────────────

export async function createConversation(
  firstMessage: string,
  country: string,
  language: string,
  messages: Message[]
): Promise<string> {
  const title = firstMessage.length > 50
    ? firstMessage.substring(0, 50) + '...'
    : firstMessage;

  const docRef = await addDoc(collection(db, CONVERSATIONS), {
    title, country, language, messages,
    uid: getUid(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateConversation(id: string, messages: Message[]): Promise<void> {
  await updateDoc(doc(db, CONVERSATIONS, id), {
    messages, updatedAt: serverTimestamp(),
  });
}

// Only fetch conversations belonging to this anonymous user — sorted client-side to avoid composite index
export async function getAllConversations(): Promise<Conversation[]> {
  const uid = getUid();
  const q = uid
    ? query(collection(db, CONVERSATIONS), where('uid', '==', uid))
    : query(collection(db, CONVERSATIONS));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Conversation[];
  return docs.sort((a, b) => {
    const aT = (a.updatedAt as any)?.toMillis?.() ?? 0;
    const bT = (b.updatedAt as any)?.toMillis?.() ?? 0;
    return bT - aT;
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await deleteDoc(doc(db, CONVERSATIONS, id));
}

// ── DOWNLOADS ──────────────────────────────────────────────

export async function saveDownload(name: string, country: string, size: string): Promise<void> {
  await addDoc(collection(db, DOWNLOADS), {
    name, country, size,
    uid: getUid(),
    downloadedAt: serverTimestamp(),
  });
}

export async function getMyDownloads(): Promise<DownloadedFile[]> {
  const uid = getUid();
  const q = uid
    ? query(collection(db, DOWNLOADS), where('uid', '==', uid))
    : query(collection(db, DOWNLOADS));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DownloadedFile[];
  return docs.sort((a, b) => {
    const aT = (a.downloadedAt as any)?.toMillis?.() ?? 0;
    const bT = (b.downloadedAt as any)?.toMillis?.() ?? 0;
    return bT - aT;
  });
}

export async function deleteDownload(id: string): Promise<void> {
  await deleteDoc(doc(db, DOWNLOADS, id));
}

// ── COMMUNITY POSTS ────────────────────────────────────────

export async function createCommunityPost(
  name: string,
  avatar: string,
  country: string,
  message: string
): Promise<void> {
  await addDoc(collection(db, COMMUNITY_POSTS), {
    name, avatar, country, message,
    likes: 0,
    uid: getUid(),
    createdAt: serverTimestamp(),
  });
}

export async function getCommunityPosts(country: string): Promise<CommunityPost[]> {
  const q = query(collection(db, COMMUNITY_POSTS), where('country', '==', country));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as CommunityPost[];
  return docs.sort((a, b) => {
    const aT = (a.createdAt as any)?.toMillis?.() ?? 0;
    const bT = (b.createdAt as any)?.toMillis?.() ?? 0;
    return bT - aT;
  });
}
