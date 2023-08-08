const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');

const base = new Airtable({apiKey: 'patWkbLDA1rXameWo.7d8e8db8c4354a740f053b7d519af926791a8d001f3ef13823c1d58f8f4bd5d7'}).base('appYk2JxgtCyKOjPZ');

const app = express();
app.use(bodyParser.json());

app.post('/asana-webhook', (req, res) => {
    const eventData = req.body.events[0];
    if (eventData.action === 'added') {
        const taskData = eventData.resource;

        base('Asana Tasks').create([
            {
                "fields": {
                    "Task ID": taskData.gid,
                    "Name": taskData.name,
                    "Assignee": taskData.assignee ? taskData.assignee.name : null,
                    "Due Date": taskData.due_on,
                    "Description": taskData.notes
                }
            }
        ], (err, record) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Record added to Airtable:', record.getId());
        });
    }
    res.sendStatus(200);
});

const PORT = 9090

app.listen(PORT, () => console.log('Server is running on port '+PORT));
