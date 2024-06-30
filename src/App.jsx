import { useState, useRef, useEffect, useContext } from 'react'
import CommentCard from './commentCard'
import Form from './AuthForm'
import { MentionsInput, Mention } from 'react-mentions'
import mentionStyle from './mentionStyle'
import userPfp from '/images/avatars/user.jpg'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import axios from 'axios'
import { UserContext } from './UserContext'

function App() {
  axios.defaults.baseURL = 'http://localhost:3000'
  axios.defaults.withCredentials = true
  const [comments, setComments] = useState(null)
  const [entry, setEntry] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [repliedTo, setRepliedTo] = useState('')
  const [id, setId] = useState(null)
  const [postId, setPostId] = useState(comments?.length + 1)
  const [render, setRender] = useState(false)
  const [replyingToId, setReplyingToId] = useState(100)
  const [mainInp, setMainInp] = useState(true)
  const [ws, setWs] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const inpRef = useRef(null)
  const nameCont = useRef()

  const { contextSafe } = useGSAP()
  const {username} = useContext(UserContext)

  //page transition animation
  const acceptUser = contextSafe(() => {
      const tl = gsap.timeline()
      tl.to('.userInp', { y: 120, opacity: 0, duration: 1, ease: 'back.inOut(5)'})
      tl.to('.nameCont', { y: -1000, duration: 1, ease: 'power3.inOut(10)', stagger: {
        each: 0.1,
        ease: 'power1.inOut'
      }}, 0.6)
      setTimeout(() => {
        if (username) {
          setIsLoggedIn(true)
        }
      }, 1000)
  })

  //retrieve comments from the database
  useEffect(() => {
    axios.get('/comments').then(response => {
      if (!comments) {
        setComments(response.data)
      }      
      setPostId(comments.length + 1)
    })
  }, [comments])

  //retrieve next id from the server
  useEffect(() => {
    axios.get('/id').then(response => {
      if (!id) {
        setId(response.data)
      }
    })
  }, [])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000')
    setWs(ws)
    ws.addEventListener('message', handleMessage)
  }, [])

  const handleMessage = (event) => {
    const messageData = JSON.parse(event.data)
    console.log(messageData.score)
    if (messageData.newId) {
      setId(messageData.newId)
    }
    if (messageData.replies && !messageData.replyingToId) {
      setComments((prevComments) => [
        ...prevComments, {
          "id": messageData.id,
          "postId": messageData.postId,
          "content": messageData.content,
          "createdTime": messageData.createdTime,
          "score": messageData.score,
          "user": messageData.user,
          "replies": messageData.replies,
          "replyingTo": messageData.repliedTo
        }
      ])
    } else if (messageData.replies && messageData.replyingToId) {
      setComments((prevComments) => {
        const newArr = prevComments
        const newReplies = newArr[messageData.replyingToId - 1].replies
        newArr[messageData.replyingToId - 1].replies = [...newReplies, {
          "id": messageData.id,
          "content": messageData.content,
          "createdTime": messageData.createdTime,
          "score": messageData.score,
          "user": messageData.user,
          "replies": [],
          "replyingTo": messageData.repliedTo,
          "replyingToId": messageData.replyingToId
        }];
        return newArr;
      });
      setRender(a => !a)
    } else if (messageData.deleted && messageData.postId) {
      setComments((prevComments) => {
        prevComments.filter((item) => {
          return item.id != messageData.id
        })
      })
    } else if (messageData.deleted && messageData.replyingToId) {
      setComments((prevComments) => {
        prevComments[messageData.replyingToId - 1].replies.filter((item) => {
          return item.id != messageData.id
        })
      });
      setRender(a => !a)
    } else if (messageData.updated && messageData.postId) {
      setComments((prevComments) => {
        prevComments.forEach((item) => {
          if (item.id == messageData.id) {
            item.content = messageData.content
          }
        })
      })
    } else if (messageData.updated && messageData.replyingToId) {
      setComments((prevComments) => {
        prevComments[messageData.replyingToId - 1].replies.forEach((item) => {
          if (item.id == messageData.id) {
            item.content = messageData.content
          }
        })
      })
    } else if (messageData.score && !messageData.replyingToId) {
      console.log('ji')
      setComments((prevComments) => {
        prevComments.forEach((item) => {
          if (item.id == messageData.id) {
            item.score = messageData.score
          }
        })
      })
    } else if (messageData.score && messageData.replyingToId) {
      console.log('jiji')
      setComments((prevComments) => {
        prevComments[messageData.replyingToId - 1].replies.forEach((item) => {
          if (item.id == messageData.id) {
            item.score = messageData.score
          }
        })
      })
    }
  }

  const users = [
    {
      id: "amyrobson",
      display: "@amyrobson"
    },
    {
      id: "juliusomo",
      display: "@juliusomo"
    },
    {
      id: "maxblagun",
      display: "@maxblagun"
    },
    {
      id: "ramsesmiron",
      display: "@ramsesmiron"
    },
    {
      id: "t3chspawn",
      display: "@t3chspawn"
    }
  ]

  const replyClick = () => {
    //this is for focusing on the text area on clicking 'reply"
    if (window.screen.width < 768) {
      inpRef.current.inputElement.focus()
    }    
  }

  const addComment = (event) => {
    //to create a link for mentions
    const replaceWithLink = (link) => {
      const profile = link.slice(1)
      let hype = document.createElement('a')
      hype.href = profile
      hype.textContent = link
      return hype;
    }

    const p = new Date()
    const postTime = p.getTime()

    // using websocketserver to update comments realtime
    event.preventDefault()
    if (!repliedTo) {//for sending first-level comments
      ws.send(JSON.stringify({
        content: entry.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)),
        id: id,
        newId: id + 1,
        postId: postId,
        // "content: entry.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)),
        createdTime: postTime,
        score: 0,
        user: {
          image: {
            webp: "./images/avatars/user.jpg"
          },
          username: username
        },
        replies: [],
      }))
    } else {
      ws.send(JSON.stringify({//for sending replies
        content: entry.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)),
        id: id,
        newId: id + 1,
        createdTime: postTime,
        score: 0,
        user: {
          image: {
            webp: "./images/avatars/user.jpg"
          },
          username: username
        },
        replies: [],
        replyingTo: repliedTo,
        replyingToId: replyingToId
      }))
    }

    if (!repliedTo) {//for adding first-level comments
     
    } else {//for adding replies
      setRepliedTo('')
      setReplyTo('')
    }
    setEntry('')
    // setId(a => a + 1)
  }

  return (
    <>
    {!isLoggedIn ? (<Form nameCont={nameCont} acceptUser={acceptUser} />) : null}
    <div className='min-h-screen h-fit min-w-screen w-full px-6 py-8 bg-[#f5f6fa] flex flex-col items-center'>
      {comments?.sort((a, b) => b - a).map((comment, id) => {
        return (
          <div className='w-full max-w-3xl'>
          <CommentCard comment={comment} key={id} comments={comments} setComments={setComments} replyClick={replyClick} setReplyTo={setReplyTo} setRepliedTo={setRepliedTo} setReplyingToId={setReplyingToId} users={users} addComment={addComment} entry={entry} setEntry={setEntry} setMainInp={setMainInp} ws={ws} />
          {comment.replies.map((reply, id) => {
            return (
              <div className='flex h-fit'>
                <div className='w-[0.2rem] mr-[0.9rem] bg-[#67727e2f] text-[1px]'>.</div>
                <div className='flex flex-col w-full'>
                  <CommentCard comment={reply} key={id} comments={comments} setComments={setComments} replyClick={replyClick} setReplyTo={setReplyTo} setRepliedTo={setRepliedTo} setReplyingToId={setReplyingToId} users={users} addComment={addComment} entry={entry} setEntry={setEntry} setMainInp={setMainInp} setRender={setRender} ws={ws} />
                </div>
              </div>
            )
          })}
          </div>
        )
      })}
      <div className='p-4 rounded-lg w-full bg-white relative max-w-3xl'>
        {repliedTo && window.screen.width < 768 ? 
        (<div className='p-1 text-center bg-emerald-100 text-[#67727e] w-fit rounded-t-lg px-4'>replying to: <span className='text-[#5457b6] font-semibold'>{replyTo}</span></div>)
        : null}
        <MentionsInput
         ref={inpRef}
         style={mentionStyle}
         value={mainInp ? entry : ''}
         onChange={(e) => {mainInp ? setEntry(e.target.value) : null}}
         allowSuggestionsAboveCursor={true}
         placeholder='Add a comment...'
         className='bg-white border-[#67727e2f] border-2 font-rubik h-24 w-full rounded-lg text-[#67727e] mb-6 overflow-y-auto'>
          <Mention data={users} trigger="@" markup="@[__display__]" appendSpaceOnAdd={true} className='text-[#5457b6] z-50 md:relative md:top-[1px] md:right-[1px]' />
        </MentionsInput>
        <img src={userPfp} className="w-12 h-12 rounded-full" />
        <div className='h-12 w-24 my-auto rounded-lg bg-[#5457b6] float-right relative bottom-12 hover:cursor-pointer hover:opacity-50'>
          <h1 className='my-auto leading-[3rem] text-lg font-semibold font-rubik text-center' onClick={addComment}>SEND</h1>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
