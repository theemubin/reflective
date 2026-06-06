import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

// --- SEED OR GET MOCK USER ---
// Helper for MVP: Auto-create a mock user and plan if none exist
async function ensureMockData() {
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'associate@reflectieve.com',
        fullName: 'Alice Chen',
        role: 'associate',
        growthIndex: 84.2,
      }
    })
    
    await prisma.plan.create({
      data: {
        title: 'Inclusive Design Workshop',
        category: 'Design',
        status: 'approved',
        executions: 1,
        authorId: user.id
      }
    })
  }
  return user
}

// --- ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Get user data
app.get('/api/users/me', async (req, res) => {
  try {
    const user = await ensureMockData()
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        plans: true,
        reflections: {
          include: { plan: true }
        }
      }
    })
    res.json(userData)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get a specific plan
app.get('/api/plans/:id', async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: req.params.id },
      include: { reflection: true }
    })
    if (!plan) return res.status(404).json({ error: 'Plan not found' })
    res.json(plan)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all executed plans for reflection prompt
app.get('/api/plans/executed/pending-reflection', async (req, res) => {
  try {
    const user = await ensureMockData()
    const plans = await prisma.plan.findMany({
      where: {
        authorId: user.id,
        executions: { gt: 0 },
        reflection: null
      }
    })
    res.json(plans)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Submit a new reflection
app.post('/api/reflections', async (req, res) => {
  try {
    const { planId, assumptions, blindSpots, futureAdapt } = req.body
    const user = await ensureMockData()

    // Verify plan exists and belongs to user
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan || plan.authorId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized or Plan not found' })
    }

    // AI Mock Grading Logic
    // In a real app, we would send the answers to Gemini/Grok API here.
    const textLength = (assumptions + blindSpots + futureAdapt).length
    const reflectionDepth = Math.min(10, Math.max(1, textLength / 50))

    const reflection = await prisma.reflection.create({
      data: {
        planId,
        authorId: user.id,
        assumptions,
        blindSpots,
        futureAdapt,
        reflectionDepth
      }
    })

    // Update User's Growth Index based on reflection depth
    const updatedGrowthIndex = user.growthIndex + (reflectionDepth * 0.1)
    await prisma.user.update({
      where: { id: user.id },
      data: { growthIndex: updatedGrowthIndex }
    })

    res.status(201).json(reflection)
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error submitting reflection' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
