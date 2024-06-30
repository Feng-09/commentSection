import { useState, useContext } from "react"
import { MentionsInput, Mention } from 'react-mentions'
import mentionStyle from './mentionStyle'
import plus from '/images/icon-plus.svg'
import minus from '/images/icon-minus.svg'
import reply from '/images/icon-reply.svg'
import del from '/images/icon-delete.svg'
import edit from '/images/icon-edit.svg'
import userPfp from '/images/avatars/user.jpg'
import { UserContext } from './UserContext'

function CommentCard({ comment, setComments, replyClick, setReplyTo, setRepliedTo, comments, setReplyingToId, users, addComment, entry, setEntry, setRender, setMainInp, ws }) {
    const [edit, setEdit] = useState(false)
    const [replyComment, setReplyComment] = useState(false)
    const [parts, setParts] = useState(comment.content.split(' '))
    const uhh = parts.map((part) => {//this is for editing a comment
        if (part.includes('http')) {
            const link = "@" + part.split('/').at(-1) + " "
            return (link)
        } else {
            return (part + ' ')
        }
        })
    const [content, setContent] = useState(uhh.join(''))
    const replaceWithLink = (link) => {
        const profile = link.slice(1)
        let hype = document.createElement('a')
        hype.href = profile
        hype.textContent = link
        return hype;
      }
    const update = () => {
        setParts(content.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)).split(' '))

        ws.send(JSON.stringify({
            content:content.replace(/@\[/g, "").replace(/]/g, "").replace(/@\w+/g, (replaceWithLink)),
            id:comment.id,
            postId:comment.postId,
            replyingToId:comment.replyingToId,
            updated: true
        }))
    }

    //to get the time since comment was posted
    const curr = new Date()
    const currTime = curr.getTime()
    let commentAge;
    let createdAt;
    if (comment.createdTime) {
    commentAge = (currTime - comment.createdTime)/1000
    createdAt = Math.floor(commentAge) + "s ago"
    if (commentAge > 59 && commentAge/60 <= 59) {
      createdAt = Math.floor(commentAge/60) + (Math.floor(commentAge/60) == 1 ? " min ago" : " mins ago")
    } else if (commentAge/60 > 59 && commentAge/3600 <= 24) {
      createdAt = Math.floor(commentAge/3600) + (Math.floor(commentAge/3600) == 1 ? " hour ago" : " hours ago")
    } else if (commentAge/3600 > 24 && commentAge/86400 <= 7) {
      createdAt = Math.floor(commentAge/86400) + (Math.floor(commentAge/86400) == 1 ? " day ago" : " days ago")
    } else if (commentAge/86400 > 7 && commentAge/86400 <= 31) {
      createdAt = Math.floor(commentAge/604800) + (Math.floor(commentAge/604800) == 1 ? " week ago" : " weeks ago")
    } else if (commentAge/86400 > 31 && commentAge/86400 <= 365.25) {
        createdAt = Math.floor(commentAge/2678400) + (Math.floor(commentAge/2678400) == 1 ? " month ago" : " months ago")
    } else if (commentAge/86400 > 365.25) {
        createdAt = Math.floor(commentAge/31557600) + (Math.floor(commentAge/31557600) == 1 ? " year ago" : " years ago")
    }
    }

    const {username} = useContext(UserContext)

    return (
        <>
        <div className="w-full bg-white rounded-lg h-fit p-4 flex flex-col mb-4 md:flex-col-reverse md:p-6">
            <div className="md:ml-16 md:mt-[-6rem]">
            <div className="flex mb-4">
                <img src={comment.user.image.webp} className="w-10 h-10 rounded-full mr-4" />
                <h1 className="text-xl text-[#324152] font-rubik font-semibold my-auto mr-4">{comment.user.username}</h1>
                {username == comment.user.username ?
                (<div className="h-6 w-12 my-auto ml-[-0.5rem] mr-2 rounded-md bg-[#5457b6] font-rubik text-center leading-5">you</div>)
                : null}
                <p className="text-[#67727e] font-rubik my-auto">{createdAt || comment.createdAt}</p>
            </div>
            {!edit ? 
            (<p className="text-[#67727e] mb-4 font-rubik">
               <span className="text-[#5457b6] font-semibold">
                {comment.replyingTo ? `@${comment.replyingTo} ` : null}
               </span>
               {parts.map((part) => {
                if (part.includes('http')) {
                    const link = "@" + part.split('/').at(-1) + " "
                    return (<a href='#'>{link}</a>)
                } else if (part.includes("@") && users.map((item) => {item.display == part})) {
                    const link = part + " "
                    return (<a href='#'>{link}</a>)
                } else {
                    return (part + ' ')
                }
                })}
             </p>)
             : (<MentionsInput
                style={mentionStyle}
                value={content}
                onChange={(e) => {setContent(e.target.value)}}
                placeholder='Edit your comment...'
                className='bg-white border-[#67727e2f] border-2 font-rubik h-fit w-full rounded-lg text-[#67727e] mb-6 overflow-y-auto'>
                 <Mention data={users} trigger="@" markup="@[__display__]" appendSpaceOnAdd={true} className='text-[#5457b6] z-50  md:relative md:top-[1px] md:right-[1.7px]' />
               </MentionsInput>)}
            </div>
            <div className="flex justify-between items-center">
                <Likes inScore={comment.score} ws={ws} id={comment.id} repToId={comment.replyingToId} />
                {username == comment.user.username ? !edit ?
                (<DelEdit comment={comment} setComments={setComments} comments={comments} setRender={setRender} setEdit={setEdit} ws={ws} />)
                : (<div className='rounded-lg bg-[#5457b6] text-lg font-semibold font-rubik text-center leading-10 w-24 h-10 md:z-20 md:self-start hover:cursor-pointer hover:opacity-50' onClick={() => {setEdit(false); update(); setRender(a => !a)}}>UPDATE</div>) 
                : (
                <div className="flex md:self-start md:z-20 hover:cursor-pointer hover:opacity-50" onClick={() => {replyClick(); setReplyTo(comment.user.username); setRepliedTo(comment.user.username); setReplyingToId(comment.postId || comment.replyingToId); setReplyComment(true); window.screen.width >= 768 ? setMainInp(false) : null}}>
                  <img src={reply} className="w-4 h-4 mr-2" />
                  <h1 className="text-[#5457b6] font-rubik font-semibold text-xl leading-4">Reply</h1>
                </div>
                )}
            </div>
        </div>
        {replyComment && window.screen.width >= 768 ? (
            <div className="flex gap-x-6 bg-white rounded-lg p-6 mb-4 mt-[-0.5rem] pb-2">
                <img src={userPfp} className="w-12 h-12 rounded-full" />
                <MentionsInput
                style={mentionStyle}
                value={entry}
                onChange={(e) => {setEntry(e.target.value)}}
                placeholder='Add your reply...'
                className='bg-white border-[#67727e2f] border-2 font-rubik h-fit w-full rounded-lg text-[#67727e] mb-6 overflow-y-auto'>
                 <Mention data={users} trigger="@" markup="@[__display__]" appendSpaceOnAdd={true} className='text-[#5457b6] z-50  md:relative md:top-[1px] md:right-[1.7px]' />
               </MentionsInput>
               <div className="flex flex-col items-center">
                <div className='h-12 w-24 rounded-lg bg-[#5457b6] float-right self-start mb-2 hover:cursor-pointer hover:opacity-50'>
                 <h1 className='my-auto relative bottom-1 p-4 text-lg font-semibold font-rubik text-center' onClick={() => {addComment(event); setReplyComment(false); setMainInp(true)}}>REPLY</h1>
                </div>
                <div className="font-rubik font-bold text-lg text-[#ed6468] text-center w-8 h-8 border-2 border-[#ed6468] rounded-xl opacity-50 hover:cursor-pointer" onClick={() => {setReplyComment(false)}}>X</div>
               </div>
               
            </div>
        ) : null}
        </>
    )
}

function Likes({ inScore, ws, id, repToId }) {
    const home = inScore
    const [score, setScore] = useState(inScore)

    const upVote = () => {
        //this makes it so that you can't add more than one upvote
        if (score <= home) {
            setScore(score + 1)
        }
        ws.send(JSON.stringify({
            score: score + 1,
            id: id,
            replyingToId: repToId
        }))
    }
    const downVote = () => {
        //this makes it so that you can't add more than one downvote
        if (score >= home) {
            setScore(score - 1)
        }
        ws.send(JSON.stringify({
            score: score - 1,
            id: id,
            replyingToId: repToId
        }))
    }

    return (
        <div className="bg-[#eaecf1] h-10 w-24 px-3 py-3 rounded-xl flex justify-between md:flex-col md:h-24 md:w-fit items-center">
            <img src={plus} className="w-4 h-4 hover:cursor-pointer" onClick={upVote} />
            <h1 className="text-xl text-[#5457b6] font-rubik font-semibold leading-none">{score}</h1>
            <img src={minus} className="w-4 h-1 relative top-[0.05rem] md:top-0 hover:cursor-pointer" onClick={downVote} />
        </div>
    )
}

function DelEdit({ comment, setComments, comments, setRender, setEdit, ws }) {
    const [confirm, setConfirm] = useState(false)
    const delComment = () => {
        if (comment.postId) {
        //   const newArr = comments.filter((item) => {
        //    return (item.id != comment.id)
        //   })
        //   setComments(newArr)

          ws.send(JSON.stringify({
            deleted:true,
            id:comment.id,
            postId:comment.postId
          }))
        } else {
            // const newArr = comments
            // newArr[comment.replyingToId - 1].replies = newArr[comment.replyingToId - 1].replies.filter((item) => {
            //     return (item.id != comment.id)
            // })
            // setComments(newArr)
            // setRender(a => !a)

            ws.send(JSON.stringify({
                deleted: true,
                id:comment.id,
                replyingToId:comment.replyingToId
              }))
        }
    }
    return (
        <div className="flex md:self-start md:z-20">
            <div className="flex mr-3 hover:cursor-pointer hover:opacity-50" onClick={() => {setConfirm(true)}}>
                <img src={del} className="w-4 h-4 mr-2" />
                <h1 className="text-[#ed6468] font-rubik font-semibold text-xl leading-4">Delete</h1>
            </div>
            <div className="flex hover:cursor-pointer hover:opacity-50" onClick={() => {setEdit(true)}}>
                <img src={edit} className="w-4 h-4 mr-2" />
                <h1 className="text-[#5457b6] font-rubik font-semibold text-xl leading-4">Edit</h1>
            </div>
            {confirm ? 
            (<>
             <div className="fixed top-0 left-0 w-screen h-screen z-50 bg-black opacity-40"></div>
             <div className='bg-white rounded-lg p-8 flex flex-col gap-y-8 border-4 border-[#ed646996] shadow shadow-slate-700 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-64 w-80 z-50'>
               <p className='text-[#67727e] font-rubik text-xl font-bold'>Delete this comment?</p>
               <p className="text-[#67727e] font-rubik text-sm">Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
               <div className='flex justify-between w-full text-center'>
                 <div className='h-10 w-20 rounded-lg bg-[#ed6468] font-rubik text-xl font-semibold leading-10 hover:cursor-pointer hover:opacity-50' onClick={() => {delComment(); setConfirm(false)}}>YES</div>
                 <div className='h-10 w-20 rounded-lg bg-[#5457b6] font-rubik text-xl font-semibold leading-10 hover:cursor-pointer hover:opacity-50' onClick={() => {setConfirm(false)}}>NO</div>
               </div>
             </div>
            </>) : null}
        </div>
    )
}

export default CommentCard