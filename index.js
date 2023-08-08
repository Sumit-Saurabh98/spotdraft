const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const { Asana } = require('asana');

const asanaToken = '1/1205222159498417:32b76fe957dca8fdf1598c0ad97cfecc';
const airtableAccessToken = 'patWkbLDA1rXameWo';
const airtableBaseId = 'appYk2JxgtCyKOjPZ';

app.use(bodyParser.json());

app.post('/asana-webhook', (req, res) => {
  const { resource, action } = req.body;

  if (resource === 'task' && action === 'added') {
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
            Authorization: `Bearer ${airtableAccessToken}`,
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
  }

  res.sendStatus(200);
});

app.get("/task", (req, res) => {
  res.json({task:"task"});
})

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
