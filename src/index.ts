import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()


serve(app)
console.log('Server running at http://localhost:3000')

interface Reminder {
  id: string,
  title: string,
  description: string,
  dueDate: string,
  isCompleted: boolean
}

const reminders: Reminder[] = []



app.post("/reminders", async (c) => {
  const body: Reminder = await c.req.json();
  const { id, title, description, dueDate, isCompleted } = body;
  
  if (!id || !title || !description || !dueDate || typeof isCompleted !== "boolean") {
    return c.json({ error: "Invalid input" }, 400);
  }
  
  reminders.push(body);
  return c.json({ message: "Reminder created" }, 201);
});


app.get("/reminders", async (c) => {
  if (reminders.length === 0) {
    return c.json({ error: "No reminders found" }, 404);
  }
  return c.json(reminders, 200);
});



app.get("/reminders/:id", async (c) => {
  const id = c.req.param("id");
  const reminder = reminders.find((r) => r.id === id);
  
  if (!reminder) {
    return c.json({ error: "Reminder not found" }, 404);
  }
  
  return c.json(reminder, 200);
});



app.patch('/reminders/:id', async (c) => {
  const id = c.req.param('id')
  const body: Partial<Reminder> = await c.req.json()
  const reminder = reminders.find(r => r.id === id)
  if (!reminder) return c.json({ error: 'Reminder not found' }, 404)

  Object.assign(reminder, body)
  return c.json({ message: 'Reminder updated successfully' })
})



app.delete("/reminders/:id", async (c) => {
  const id = c.req.param("id");
  const index = reminders.findIndex((r) => r.id === id);
  
  if (index === -1) {
    return c.json({ error: "Reminder not found" }, 404);
  }
  
  reminders.splice(index, 1);
  return c.json({ message: "Reminder deleted" }, 200);
});


app.patch('/reminders/:id/complete', async (c) => {
  const id = c.req.param('id')
  const reminder = reminders.find(r => r.id === id)
  if (!reminder) return c.json({ error: 'Reminder not found' }, 404)

  reminder.isCompleted = true
  return c.json({ message: 'Reminder marked as completed' })
})

 
app.patch('/reminders/:id/not-complete', async (c) => {
  const id = c.req.param('id')
  const reminder = reminders.find(r => r.id === id)
  if (!reminder) return c.json({ error: 'Reminder not found' }, 404)

  reminder.isCompleted = false
  return c.json({ message: 'Reminder marked as incomplete' })
})

 
app.get('/reminders/completed', async (c) => {
  const completedReminders = reminders.filter(r => r.isCompleted === true)
  return c.json(completedReminders)
})


app.get('/reminders/incomplete', async (c) => {
  const incompleteReminders = reminders.filter(r => !r.isCompleted === true)
  return c.json(incompleteReminders)
})


app.get('/reminders/due-today', async (c) => {
  const today = new Date().toISOString().split('T')[0]
  const dueToday = reminders.filter(r => r.dueDate === today)
  return c.json(dueToday)
})