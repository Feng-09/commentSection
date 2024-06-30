import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv'
import User from './model/User.js'
import Comment from './model/Comment.js';
import idModel from './model/NextId.js';
import jwt from 'jsonwebtoken'
import cors from 'cors'
import { WebSocketServer } from 'ws'


dotenv.config({path: './server/.env'})
mongoose.connect(process.env.MONGO_URL)
const jwtSecret = process.env.JWT_SECRET_CODE
const bcryptSalt = bcrypt.genSaltSync(10)

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: process.env.VERCEL_URL,
  optionsSuccessStatus: 200,
}))

app.get('/', (req, res) => {
  res.json('test ok')
})

app.get('/profile', (req, res) => {
  const {token} = req.cookies
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err
      res.json(userData)
    })
  }
})

app.get('/comments', async (req, res) => {
  const comments = await Comment.find();
  res.json(comments)
})

app.get('/id', async (req, res) => {
  const document = await idModel.findOne();
  res.json(document.nextId)
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const foundUser = await User.findOne({username})
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password)
    if (passOk) {
      jwt.sign({userId:foundUser._id, username}, jwtSecret, {}, (err, token) => {
        res.cookie('token', token).json({
          id: foundUser._id,
        })
      })
    } else {
      res.status(500).send('error')
    }
  } else {
    res.status(500).send('error')
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body //req.body is what is in the payload
  try {
    const createdUser = await User.create({
      username:username,
      password:bcrypt.hashSync(password, bcryptSalt)
    })
    jwt.sign({userId: createdUser._id, username}, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).status(201).json({
        id: createdUser._id
      })
    })
  } catch (err) {
    if (err) throw err
    res.status(500).json('error')
  }
})

const server = app.listen(3000)

const wss = new WebSocketServer({server})
wss.on('connection', (connection, req) => {
  // read username and id from the cookie for this connection
  const cookies = req.headers.cookie
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token'))
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1]
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err
          const { userId, username } = userData
          connection.userId = userId
          connection.username = username
        })
      }
    }
  }

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString())
    const { content, id, postId, createdTime, score, user, replies, replyingTo, replyingToId, deleted, updated, newId } = messageData
    if (content || deleted) {
      // filter the online connections to return unique connections
      const clients = [...wss.clients].filter(function(item, index) {
        return index === [...wss.clients].findIndex(function(obj) {
          return item.username === obj.username
        })
      });
      clients.forEach(connection => connection.send(JSON.stringify({ content, id, postId, createdTime, score, user, replies, replyingTo, replyingToId, deleted, updated, newId })))
    };
    if (postId && !deleted && !updated) {
      await Comment.create({
        content:content,
        id:id,
        postId:postId,
        createdTime:createdTime,
        score:score,
        user:user,
        replies:replies,
        replyingTo:replyingTo
      })
      const document = await idModel.findOne();
      const useId = document.nextId + 1
      await idModel.findOneAndUpdate(
        {},
        {
          nextId: useId,
        }
      )
    } else if (replyingToId && !deleted && !updated) {
      let commentToBeUpdated;
      await Comment.findOne({ postId: replyingToId }).then(document => commentToBeUpdated = document)
      const query = { postId: replyingToId }
      await Comment.findOneAndUpdate(
        query,
        {
          replies: [...commentToBeUpdated.replies, {
            content:content,
            id:id,
            createdTime:createdTime,
            score:score,
            user:user,
            replies:replies,
            replyingTo:replyingTo,
            replyingToId:replyingToId,
          }]
        },
      )
      const document = await idModel.findOne();
      const useId = document.nextId + 1
      await idModel.findOneAndUpdate(
        {},
        {
          nextId: useId,
        }
      )
    } else if (deleted) {
      if (postId) {
        await Comment.findOneAndDelete({ id: id })
      } else if (replyingToId) {
        let commentToBeUpdated;
        await Comment.findOne({ postId: replyingToId }).then(document => commentToBeUpdated = document)
        const query = { postId: replyingToId }
        await Comment.findOneAndUpdate(
          query,
          {
            replies: commentToBeUpdated.replies.filter((item) => {
              return item.id != id
            })
          },
        )
      }
    } else if (updated) {
      if (postId) {
        const query = { postId: postId }
        await Comment.findOneAndUpdate(
          query,
          {
            content:content,
          }
        )
      } else if (replyingToId) {
        let commentToBeUpdated;
        const query = { postId: replyingToId }
        await Comment.findOne(query).then(document => commentToBeUpdated = document)
        commentToBeUpdated.replies.forEach((item) => {
          if (item.id == id) {
            item.content = content
          }
        })
        await Comment.findOneAndUpdate(
          query,
          {
            replies: commentToBeUpdated.replies
          }
        )
      }
    } else if (score) {
      if (!replyingToId) {
        await Comment.findOneAndUpdate(
          { id: id },
          {
            score: score
          }
        )
      } else if (replyingToId) {
        let commentToBeUpdated;
        await Comment.findOne({ postId: replyingToId}).then(document => commentToBeUpdated = document)
        commentToBeUpdated.replies.forEach((item) => {
          if (item.id == id) {
            item.score = score
          }
        })
        await Comment.findOneAndUpdate(
          { postId: replyingToId },
          {
            replies: commentToBeUpdated.replies
          }
        )
      }
    }
  });

  // indicate to users that someone is online when they connect
  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map(connection => ({userId: connection.userId, username: connection.username}))
    }))
  })
})