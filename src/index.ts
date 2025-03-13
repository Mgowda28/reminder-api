import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

type Reminder = {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
};

const reminders: Reminder[] = [];

app.get('/', (c) => c.text("Hello world"));

app.post('/reminders', async (c) => {
    const body = await c.req.json();
    const { id, title, description, dueDate, isCompleted } = body;
    if (!id || !title || !description || !dueDate || typeof isCompleted !== 'boolean') {
        return c.json({ error: 'Invalid input' }, 400);
    }
    reminders.push({ id, title, description, dueDate, isCompleted });
    return c.json({ message: 'Reminder created' }, 201);
});

app.get('/reminders/:id', (c) => {
    const id = c.req.param('id');
    const reminder = reminders.find(r => r.id === id);
    return reminder ? c.json(reminder, 200) : c.json({ error: 'Reminder not found' }, 404);
});

app.get('/reminders', (c) => {
    return reminders.length ? c.json(reminders, 200) : c.json({ error: 'No reminders found' }, 404);
});

app.patch('/reminders/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return c.json({ error: 'Reminder not found' }, 404);
    Object.assign(reminder, body);
    return c.json({ message: 'Reminder updated' }, 200);
});

app.delete('/reminders/:id', (c) => {
    const id = c.req.param('id');
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return c.json({ error: 'Reminder not found' }, 404);
    reminders.splice(index, 1);
    return c.json({ message: 'Reminder deleted' }, 200);
});

app.post('/reminders/:id/mark-completed', (c) => {
    const id = c.req.param('id');
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return c.json({ error: 'Reminder not found' }, 404);
    reminder.isCompleted = true;
    return c.json({ message: 'Reminder marked as completed' }, 200);
});

app.post('/reminders/:id/unmark-completed', (c) => {
    const id = c.req.param('id');
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return c.json({ error: 'Reminder not found' }, 404);
    reminder.isCompleted = false;
    return c.json({ message: 'Reminder unmarked as completed' }, 200);
});

app.get('/reminders/completed', (c) => {
    const completed = reminders.filter(r => r.isCompleted);
    return completed.length ? c.json(completed, 200) : c.json({ error: 'No completed reminders found' }, 404);
});

app.get('/reminders/not-completed', (c) => {
    const notCompleted = reminders.filter(r => !r.isCompleted);
    return notCompleted.length ? c.json(notCompleted, 200) : c.json({ error: 'No uncompleted reminders found' }, 404);
});

app.get('/reminders/due-today', (c) => {
    const today = new Date().toISOString().split('T')[0];
    const dueToday = reminders.filter(r => r.dueDate === today);
    return dueToday.length ? c.json(dueToday, 200) : c.json({ error: 'No reminders due today' }, 404);
});

serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
