import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello World!')
})


// Define Reminder type
type Reminder = {
  id: string
  title: string
  description: string
  dueDate: string
  isCompleted: boolean
}

// Example input for POST /reminders
// {
//   "id": "1",
//   "title": "Buy groceries",
//   "description": "Milk, Bread, Eggs",
//   "dueDate": "2023-10-10",
//   "isCompleted": false
// }

// Example input for PATCH /reminders/:id
// {
//   "title": "Buy groceries and fruits",
//   "description": "Milk, Bread, Eggs, Apples",
//   "dueDate": "2023-10-11",
//   "isCompleted": true
// }

// Example input for POST /reminders/:id/mark-completed
// No body required

// Example input for POST /reminders/:id/unmark-completed
// No body required

const reminders: Reminder[] = []

app.post('/reminders', async (c) => {
  const body = await c.req.json()
  const { id, title, description, dueDate, isCompleted } = body

  if (!id || !title || !description || !dueDate || typeof isCompleted !== 'boolean') {
    return c.json({ error: 'Invalid input' }, 400)
  }

  reminders.push({ id, title, description, dueDate, isCompleted })
  return c.json({ message: 'Reminder created' }, 201)
})

app.get('/reminders/:id', (c) => {
  const { id } = c.req.param()
  const reminder = reminders.find(r => r.id === id)

  if (!reminder) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  return c.json(reminder, 200)
})

app.get('/reminders', (c) => {
  if (reminders.length === 0) {
    return c.json({ error: 'No reminders found' }, 404)
  }

  return c.json(reminders, 200)
})

app.patch('/reminders/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()
  const reminder = reminders.find(r => r.id === id)

  if (!reminder) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  const { title, description, dueDate, isCompleted } = body

  if (title) reminder.title = title
  if (description) reminder.description = description
  if (dueDate) reminder.dueDate = dueDate
  if (typeof isCompleted === 'boolean') reminder.isCompleted = isCompleted

  return c.json({ message: 'Reminder updated' }, 200)
})

app.delete('/reminders/:id', (c) => {
  const { id } = c.req.param()
  const index = reminders.findIndex(r => r.id === id)

  if (index === -1) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  reminders.splice(index, 1)
  return c.json({ message: 'Reminder deleted' }, 200)
})

app.post('/reminders/:id/mark-completed', (c) => {
  const { id } = c.req.param()
  const reminder = reminders.find(r => r.id === id)

  if (!reminder) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  reminder.isCompleted = true
  return c.json({ message: 'Reminder marked as completed' }, 200)
})

app.post('/reminders/:id/unmark-completed', (c) => {
  const { id } = c.req.param()
  const reminder = reminders.find(r => r.id === id)

  if (!reminder) {
    return c.json({ error: 'Reminder not found' }, 404)
  }

  reminder.isCompleted = false
  return c.json({ message: 'Reminder unmarked as completed' }, 200)
})

app.get('/reminders/completed', (c) => {
  const completedReminders = reminders.filter(r => r.isCompleted)

  if (completedReminders.length === 0) {
    return c.json({ error: 'No completed reminders found' }, 404)
  }

  return c.json(completedReminders, 200)
})

app.get('/reminders/not-completed', (c) => {
  const notCompletedReminders = reminders.filter(r => !r.isCompleted)

  if (notCompletedReminders.length === 0) {
    return c.json({ error: 'No uncompleted reminders found' }, 404)
  }

  return c.json(notCompletedReminders, 200)
})

app.get('/reminders/due-today', (c) => {
  const today = new Date().toISOString().split('T')[0]
  const dueTodayReminders = reminders.filter(r => r.dueDate === today)

  if (dueTodayReminders.length === 0) {
    return c.json({ error: 'No reminders due today' }, 404)
  }

  return c.json(dueTodayReminders, 200)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
