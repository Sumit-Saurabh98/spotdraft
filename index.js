const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const base = new Airtable({ apiKey: process.env.API_KEY }).base(process.env.BASE);

app.post('/asana-webhook', (req, res) => {
  const eventData = req.body.events[0];

  if (eventData.action === 'added') {
    const taskData = eventData.resource;

    base('Asana Tasks').create(
      [
        {
          fields: {
            'Task ID': taskData.gid,
            Name: taskData.name,
            Assignee: taskData.assignee ? taskData.assignee.name : null,
            'Due Date': taskData.due_on,
            Description: taskData.notes,
          },
        },
      ],
      (err, record) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          console.log('Record added to Airtable:', record.getId());
          res.sendStatus(200);
        }
      }
    );
  } else {
    res.sendStatus(200);
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
