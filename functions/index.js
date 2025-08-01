const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendPushNotification = onDocumentCreated(
  'notifications/{notificationId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.error('No data associated with the event');
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
        .collection('users')
        .doc(notification.receiver_id)
        .get();

      if (!userDoc.exists) {
        logger.log(`Usuario ${notification.receiver_id} no encontrado`);
        return;
      }

      const fcmToken = userDoc.data().fcmToken;

      if (!fcmToken) {
        logger.log(`Usuario ${notification.receiver_id} sin token FCM`);
        return;
      }

      const message = {
        notification: {
          title: notification.title || 'Nueva notificación',
          body: notification.message || '',
          image: notification.vehiclePhoto || notification.senderPhoto || ''
        },
        data: {
          notificationId: notificationId,
          type: notification.type || 'general',
          link: notification.link || '',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        token: fcmToken
      };

      await admin.messaging().send(message);
      logger.log(`Push enviada para ${notificationId}`);
    } catch (error) {
      logger.error('Error enviando push:', error);

      if ([
        'messaging/invalid-registration-token',
        'messaging/registration-token-not-registered'
      ].includes(error.code)) {
        await admin.firestore()
          .collection('users')
          .doc(notification.receiver_id)
          .update({
            fcmToken: admin.firestore.FieldValue.delete()
          });
      }
    }
  }
);

exports.helloWorld = onRequest((req, res) => {
  res.send('¡Funcionando!');
});
