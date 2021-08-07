const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin")
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    const original = req.query.text;
    const writeResult = await admin.firestore().collection('messages').add({original: original})

    // Get a database reference to our blog
    const db = admin.database();
    const ref = db.ref('server/saving-data/fireblog');

    const usersRef = ref.child('users');
    await usersRef.set({
        alanisawesome: {
            date_of_birth: 'June 23, 1912',
            full_name: 'Alan Turing'
        },
        gracehop: {
            date_of_birth: 'December 9, 1906',
            full_name: 'Grace Hopper'
        }
    });

    res.json({result: `Message with ID: ${writeResult.id} added.`});
})

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeuppercase = functions.firestore.document('messages/{documentId}').onCreate((snap, context) => {
    const original = snap.data().original
    functions.logger.log('Uppercasing', context.params.documentId, original)
    const uppercase = original.toUpperCase();
    return snap.ref.set({uppercase}, {merge: true});
})