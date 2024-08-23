require('dotenv').config()

// Mailgun configuration
const formData = require('form-data')
const Mailgun  = require('mailgun.js')

const { compile }  = require("handlebars")
const { readFileSync }  = require("fs")

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger }  = require("firebase-functions")
// const {onRequest} = require("firebase-functions/v2/https");
const { onDocumentCreated }  = require("firebase-functions/v2/firestore")
// The Firebase Admin SDK to access Firestore.
const { initializeApp }  = require("firebase-admin/app")
// const {getFirestore} = require("firebase-admin/firestore");
initializeApp();

const APP = {
  NAME: 'Squared Finance',
  URL: 'https://squaredfinance.com',
}
const mailgun = new Mailgun(formData);
const client = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

exports.welcomeEmail = onDocumentCreated({
  timeoutSeconds: 15,
  maxInstances: 10,
  document:"/users/{userId}"
}, (event) => {
  // Access the parameter `{userId}` with `event.params`
  logger.log("Welcome", event.params.userId, event.data.data());

  // You must return a Promise when performing
  // asynchronous tasks inside a function
  // such as sending an email with SendGrid.
  // Sending an email returns a Promise.
  return sendWelcomeEmail(event.data.data());
})

// Send a welcome email to the user
function sendWelcomeEmail(user) {
  const emailTemplateSource = readFileSync("./template.hbs", "utf8");
  const template = compile(emailTemplateSource);
  const v_data = {
    title: `<h1>Welcome to ${APP.NAME}</h1>`,
    contents: `
      <h2>Hello ${user?.firstname || 'there'}, Thank you for your registration on our site.</h2>

      <br /><br />

      <h3>Your Information:</h3>
      <p>Username: ${user?.username || ''}</p>
      <p>Email: ${user?.email || ''}</p>
      <p>Password: ${user.password || ''}</p>

      <br /><br />

      <p>Contact us immediately, if you did not authorize this registration. Thank You.</p>
      <a href="${APP.URL}">Contact Us</a>
    `,
  };
  const htmlToSend = template(v_data);

  const messageData = {
    from: 'bartholomewfavour1995@gmail.com',
    to: user?.email,
    subject: `Welcome to ${APP.NAME}`,
    html: htmlToSend,
  };


  client.messages.create(process.env.MAILGUN_DOMAIN, messageData)
  .then((res) => {
    // console.log({res});
  })
  .catch((err) => {
    logger.error("Error sending welcome email", err);
  });
}