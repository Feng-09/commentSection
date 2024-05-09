import { useState, useRef, useEffect } from 'react'
import data from '/data.json'
import CommentCard from './commentCard'
import { MentionsInput, Mention } from 'react-mentions'
import mentionStyle from './mentionStyle'
import userPfp from '/images/avatars/user.jpg'

function App() {
  const [chat, setChat] = useState(data)
  const [comments, setComments] = useState(JSON.parse(localStorage.getItem("comments")) || chat.comments)
  const [entry, setEntry] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [repliedTo, setRepliedTo] = useState('')
  const [id, setId] = useState(5)
  const [postId, setPostId] = useState(3)
  const [render, setRender] = useState(false)
  const [replyingToId, setReplyingToId] = useState(null)
  const [mainInp, setMainInp] = useState(true)
  const [user, setUser] = useState('')
  const [form, setForm] = useState(true)
  const inpRef = useRef(null)
  let info = data

  //store the comments in localStorage
  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments))
  }, [comments])

  // setTimeout(localStorage.clear(), 604800000) //clear the localStorage after a week

  //This is to tell how long ago a comment was posted
  const curr = new Date()
  const currTime = curr.getTime()

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

  console.log(user)
  const replyClick = () => {
    //this is for focusing on the text area on clicking 'reply"
    if (window.screen.width < 768) {
      inpRef.current.inputElement.focus()
    }    
  }

  const addComment = () => {
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

    if (!repliedTo) {//for adding first-level comments
      setComments((prevComments) => 
      [...prevComments, {
        "id": id,
        "postId": postId,
        "content": entry.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)),
        "createdTime": postTime,
        "score": 0,
        "user": {
          "image": {
            "png": "./images/avatars/image-juliusomo.png",
            "webp": "./images/avatars/user.jpg"
          },
          "username": user
        },
        "replies": [],
        "replyingTo": repliedTo
      }])
      setPostId(a => a + 1)
    } else {//for adding replies
      const newArr = comments
      const newReplies = newArr[replyingToId - 1].replies
      newArr[replyingToId - 1].replies = [...newReplies, {
        "id": id,
        "content": entry.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)),
        "createdTime": postTime,
        "score": 0,
        "user": {
          "image": {
            "png": "./images/avatars/image-juliusomo.png",
            "webp": "./images/avatars/user.jpg"
          },
          "username": user
        },
        "replies": [],
        "replyingTo": repliedTo,
        "replyingToId": replyingToId
      }]
      setComments(newArr)
      setRepliedTo('')
      setReplyTo('')
    }
    setEntry('')
    setId(a => a + 1)
  }

  return (
    <>
    {form ? (<Form setForm={setForm} setUser={setUser} />) : (
    <div className='min-h-screen h-fit min-w-screen w-full px-6 py-8 bg-[#f5f6fa] flex flex-col items-center'>
      {comments.sort((a, b) => b - a).map((comment, id) => {
        return (
          <div className='w-full max-w-3xl'>
          <CommentCard comment={comment} info={info} key={id} setChat={setChat} comments={comments} setComments={setComments} replyClick={replyClick} setReplyTo={setReplyTo} setRepliedTo={setRepliedTo} setReplyingToId={setReplyingToId} users={users} addComment={addComment} entry={entry} setEntry={setEntry} setMainInp={setMainInp} user={user} />
          {comment.replies.map((reply, id) => {
            return (
              <div className='flex h-fit'>
                <div className='w-[0.2rem] mr-[0.9rem] bg-[#67727e2f] text-[1px]'>.</div>
                <div className='flex flex-col w-full'>
                  <CommentCard comment={reply} info={info} key={id} setChat={setChat} comments={comments} setComments={setComments} replyClick={replyClick} setReplyTo={setReplyTo} setRepliedTo={setRepliedTo} setReplyingToId={setReplyingToId} users={users} addComment={addComment} entry={entry} setEntry={setEntry} setMainInp={setMainInp} user={user} setRender={setRender} />
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
    </div>)}
    </>
  )
}

function Form(props) {
  return (
      <div className="bg-[#f5f6fa] w-screen h-screen flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-80 gap-y-16 flex flex-col justify-between text-center shadow shadow-slate-700 focus:outline-none">
              <h1 className="font-rubik text-3xl font-semibold text text-[#324152]">Username</h1>
              <input className="font-rubik text-[#67727e] border-[#67727e2f] border-2 w-full h-12 rounded-lg bg-white p-2" placeholder="Enter your username..." onChange={(e) => {props.setUser(e.target.value)}} />
              <button className="h-10 w-full rounded-lg bg-[#5457b6] font-rubik text-xl font-semibold flex items-center justify-center hover:cursor-pointer hover:opacity-50" onClick={() => {props.setForm(false)}}>Comment</button>
          </div>
      </div>
  )
}

export default App
