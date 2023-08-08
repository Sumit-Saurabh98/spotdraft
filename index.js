const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const { Asana } = require('asana');

const asanaToken = '1/1205222159498417:32b76fe957dca8fdf1598c0ad97cfecc';
const airtableAccessToken = 'patWkbLDA1rXameWo';
const airtableBaseId = 'appYk2JxgtCyKOjPZ';

// Middleware
app.use(bodyParser.json());

// Asana Webhook route
app.post('/asana-webhook', (req, res) => {
  const payload = req.body;

  // Check if the request contains a "challenge" property
  if (payload.challenge) {
    // Respond with the handshake secret to verify the webhook setup
    res.json({ challenge: payload.challenge });
  } else {
    // Handle the incoming webhook notification
    // Process the payload here and copy the task to Airtable

    const asanaClient = Asana.Client.create().useAccessToken(asanaToken);

    asanaClient.tasks.findById(req.body.data.id)
      .then((task) => {
        const { id, name, assignee, due_on, notes } = task;

        const airtableData = {
          fields: {
            'Task ID': id,
            Name: name,
            Assignee: assignee.name,
            'Due Date': due_on,
            Description: notes,
          }
        };

        const airtableEndpoint = `https://api.airtable.com/v0/${airtableBaseId}/Asana%20Tasks`;

        axios.post(airtableEndpoint, airtableData, {
          headers: {
            Authorization: `Bearer ${airtableApiKey}`,
          }
        })
        .then(() => {
          console.log(`Task with ID ${id} has been copied to Airtable.`);
        })
        .catch((error) => {
          console.error('Error copying task to Airtable:', error);
        });
      })
      .catch((error) => {
        console.error('Error fetching task from Asana:', error);
      });

    // Send a response back to Asana (should be done to acknowledge the webhook)
    res.sendStatus(200);
  }
});
app.get("/task", (req, res) => {
  res.json({task:"task"});
})

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
