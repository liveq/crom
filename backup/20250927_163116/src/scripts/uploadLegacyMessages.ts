import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import legacyMessages from '../data/memorialMessages.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface LegacyMessage {
  author: string;
  content: string;
  date: string;
  source: string;
}

async function uploadLegacyMessages() {
  const uniqueMessages = new Map<string, LegacyMessage>();

  legacyMessages.forEach((msg: LegacyMessage) => {
    const key = `${msg.author}|${msg.content}`;
    if (!uniqueMessages.has(key)) {
      uniqueMessages.set(key, msg);
    }
  });

  console.log(`Total messages in JSON: ${legacyMessages.length}`);
  console.log(`Unique messages to upload: ${uniqueMessages.size}`);

  let uploaded = 0;
  let failed = 0;

  for (const [, message] of uniqueMessages) {
    try {
      await addDoc(collection(db, 'memorialMessages'), {
        author: message.author || '익명',
        message: message.content,
        userId: 'legacy-import',
        isAnonymous: true,
        isLegacy: true,
        approved: true,
        createdAt: serverTimestamp(),
        likes: 0,
        reports: 0
      });
      uploaded++;
      console.log(`Uploaded ${uploaded}/${uniqueMessages.size}: ${message.content.substring(0, 50)}...`);
    } catch (error) {
      failed++;
      console.error(`Failed to upload message: ${error}`);
    }
  }

  console.log(`\nUpload complete!`);
  console.log(`Successfully uploaded: ${uploaded}`);
  console.log(`Failed: ${failed}`);
  process.exit(0);
}

uploadLegacyMessages().catch(console.error);