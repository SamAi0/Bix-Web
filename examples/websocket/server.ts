import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length"],
    maxAge: 86400
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface User {
  id: string
  username: string
}

interface Message {
  id: string
  username: string
  content: string
  timestamp: Date
  type: 'user' | 'system'
}

const users = new Map<string, User>()

const generateMessageId = () => Math.random().toString(36).substr(2, 9)

const createSystemMessage = (content: string): Message => ({
  id: generateMessageId(),
  username: 'System',
  content,
  timestamp: new Date(),
  type: 'system'
})

const createUserMessage = (username: string, content: string): Message => ({
  id: generateMessageId(),
  username,
  content,
  timestamp: new Date(),
  type: 'user'
})

io.on('connection', (socket) => {
  // Log user connections for monitoring
  console.debug(`User connected: ${socket.id}`)

  // Add test event handler
  socket.on('test', (data) => {
    // Log test messages for debugging
    console.debug('Received test message:', data)
    socket.emit('test-response', { 
      message: 'Server received test message', 
      data: data,
      timestamp: new Date().toISOString()
    })
  })

  socket.on('join', (data: { username: string }) => {
    const { username } = data
    
    // Create user object
    const user: User = {
      id: socket.id,
      username
    }
    
    // Add to user list
    users.set(socket.id, user)
    
    // Send join message to all users
    const joinMessage = createSystemMessage(`${username} joined the chat room`)
    io.emit('user-joined', { user, message: joinMessage })
    
    // Send current user list to new user
    const usersList = Array.from(users.values())
    socket.emit('users-list', { users: usersList })
    
    // Log user joins for monitoring
    console.debug(`${username} joined the chat room, current online users: ${users.size}`)
  })

  socket.on('message', (data: { content: string; username: string }) => {
    const { content, username } = data
    const user = users.get(socket.id)
    
    if (user && user.username === username) {
      const message = createUserMessage(username, content)
      io.emit('message', message)
      // Log messages for monitoring
      console.debug(`${username}: ${content}`)
    }
  })

  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    
    if (user) {
      // Remove from user list
      users.delete(socket.id)
      
      // Send leave message to all users
      const leaveMessage = createSystemMessage(`${user.username} left the chat room`)
      io.emit('user-left', { user: { id: socket.id, username: user.username }, message: leaveMessage })
      
      // Log user leaves for monitoring
      console.debug(`${user.username} left the chat room, current online users: ${users.size}`)
    } else {
      // Log disconnections for monitoring
      console.debug(`User disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    // Log socket errors for debugging
    // Log socket errors for debugging
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = parseInt(process.env.WEBSOCKET_PORT || '3003', 10)
httpServer.listen(PORT, () => {
  // Log server startup
  console.info(`WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  // Log graceful shutdown
  console.info('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    // Log server closure
        console.info('WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  // Log graceful shutdown
  console.info('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    // Log server closure
        console.info('WebSocket server closed')
    process.exit(0)
  })
})