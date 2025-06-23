import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase";

const chatsCache = {};


function getCacheKey(senderId, receiverId) {
    return [senderId, receiverId].sort().join('_');
}


function cacheAdd(key, value) {
    chatsCache[key] = value;
}


function cacheRetrieve(key) {
    return chatsCache[key] || null;
}


async function getPrivateChatDocument(senderId, receiverId) {

    const cacheKey = getCacheKey(senderId, receiverId);
    const cacheDoc = cacheRetrieve(cacheKey);

    if(cacheDoc) return cacheDoc;

    const privateChatRef = collection(db, `chats`);

    const privateChatQuery = query(privateChatRef, where('users', '==', {
        [senderId]: true,
        [receiverId]: true,
    }), limit(1));

    const privateChatsSnapshot = await getDocs(privateChatQuery);
    let chatDocument;

    if(privateChatsSnapshot.empty) {
        chatDocument = await addDoc(privateChatRef, {
            users: {
                [senderId]: true,
                [receiverId]: true,
            },
        });
    } else {
        chatDocument = privateChatsSnapshot.docs[0];
    }

    cacheAdd(cacheKey, chatDocument);
    return chatDocument;
}


export async function savePrivateChatMessage(senderId, receiverId, text) {
    const privateChatDoc = await getPrivateChatDocument(senderId, receiverId);

    const messagesRef = collection(db, `chats/${privateChatDoc.id}/messages`);

    await addDoc(messagesRef, {
        user_id: senderId,
        text,
        created_at: serverTimestamp(),
    });
}

export async function subscribeToPrivateChatMessages(senderId, receiverId, callback) {
    const chatDocument = await getPrivateChatDocument(senderId, receiverId);

    const messagesRef = collection(db, `chats/${chatDocument.id}/messages`);

    const messagesQuery = query(messagesRef, orderBy('created_at'));

    return onSnapshot(messagesQuery, snapshot => {
        const messages = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                user_id: doc.data().user_id,
                text: doc.data().text,
                created_at: doc.data().created_at?.toDate(),
            }
        });

        callback(messages);
    });
}