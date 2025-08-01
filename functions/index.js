import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();

export const sendPushNotification = onDocumentCreated(
  "notifications/{notificationId}", 
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.error("No data associated with the event");
      return;
    }
    const notificationId = event.params.notificationId;
    const notification = snapshot.data();

    if (notification.read || !notification.receiver_id) {
      logger.log(`Notificación ${notificationId} ya leída, omitiendo push`);
      return;
    }

    try {
      const userDoc = await admin.firestore()
        .collection("users")
        .doc(notification.receiver_id)
        .get();
      
      if (!userDoc.exists) {
        logger.log(`Usuario ${notification.receiver_id} no encontrado`);
        return;
      }

      const userData = userDoc.data();
      const fcmToken = userDoc.data()?.fcmToken;

      if (!fcmToken) {
        logger.log(`Usuario ${notification.receiver_id} sin token FCM`);
        return;
      }

      const message = {
        notification: {
          title: notification.title || "Nueva notificación",
          body: notification.message || "",
          image: notification.vehiclePhoto || notification.senderPhoto || ""
        },
        data: {
          notificationId: notificationId,
          type: notification.type || "general",
          link: notification.link || "",
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        token: fcmToken,
      };

      await admin.messaging().send(message);
      logger.log(`Push enviada para ${notificationId}`);

    } catch (error) {
      logger.error("Error enviando push:", error);
      
      if (["messaging/invalid-registration-token", "messaging/registration-token-not-registered"].includes(error.code)) {
        await admin.firestore()
          .collection("users")
          .doc(notification.receiver_id)
          .update({
            fcmToken: admin.firestore.FieldValue.delete()
          });
      }
    }
  }
);

export const helloWorld = onRequest((req, res) => {
  res.send("¡Funciones funcionando con ES Modules!");
});