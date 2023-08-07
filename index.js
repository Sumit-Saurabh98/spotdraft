const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');

const app = express();
const PORT = 8000;

app.use(bodyParser.json());

const apiKey = 'patWkbLDA1rXameWo.7d8e8db8c4354a740f053b7d519af926791a8d001f3ef13823c1d58f8f4bd5d7';
const baseId = 'appuewWpo1LEKwKRM';
const tableName = 'Asana Tasks';

const base = new Airtable({ apiKey }).base(baseId);

app.post('/asana-webhook', (req, res) => {
  const eventData = req.body.events[0];
  if (eventData.action === 'added') {
    const taskData = eventData.resource;
    console.log('New task added:');
    console.log(taskData);
    base(tableName).create([
      {
        fields: {
          'Task ID': taskData.gid,
          Name: taskData.name,
          Assignee: taskData.assignee ? taskData.assignee.name : null,
          'Due Date': taskData.due_on,
          Description: taskData.notes,
        },
      },
    ], (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Record added to Airtable:', records[0].getId());
    });
  }
  res.sendStatus(200);
});

app.get('/task', (req, res) => {
  res.json({ task: "task" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
