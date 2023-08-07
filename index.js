const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');

const app = express();
app.use(bodyParser.json());

app.post('/asana-webhook', (req, res) => {
    const eventData = req.body.events[0];
    if (eventData.action === 'added') {
        const taskData = eventData.resource;

        const base = new Airtable({accessToken: process.env.API_KEY}).base(process.env.BASE);
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

app.listen(3000, () => console.log('Server is running on port 3000'));