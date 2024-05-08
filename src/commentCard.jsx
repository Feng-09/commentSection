import { useState } from "react"
import { MentionsInput, Mention } from 'react-mentions'
import mentionStyle from './mentionStyle'
import plus from '/images/icon-plus.svg'
import minus from '/images/icon-minus.svg'
import reply from '/images/icon-reply.svg'
import del from '/images/icon-delete.svg'
import edit from '/images/icon-edit.svg'


function CommentCard({ comment, info, setChat, setComments, replyClick, setReplyTo, setRepliedTo, comments, setReplyingToId, users, addComment, entry, setEntry, setRender, setMainInp }) {
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
    }

    //to get the time since comment was posted
    const curr = new Date()
    const currTime = curr.getTime()
    let commentAge;
    let createdAt;
    if (comment.createdTime) {
    commentAge = (currTime - comment.createdTime)/1000
    createdAt = Math.floor(commentAge) + "s ago"
    if (commentAge > 59) {
      createdAt = Math.floor(commentAge/60) + "mins ago"
    } else if (commentAge/60 > 59) {
      createdAt = Math.floor(commentAge/3600) + "hours ago"
    } else if (commentAge/3600 > 24) {
      createdAt = Math.floor(commentAge/86400) + "days ago"
    }
    }

    return (
        <>
        <div className="w-full bg-white rounded-lg h-fit p-4 flex flex-col mb-4 md:flex-col-reverse md:p-6">
            <div className="md:ml-16 md:mt-[-6rem]">
            <div className="flex mb-4">
                <img src={comment.user.image.png} className="w-10 h-10 mr-4" />
                <h1 className="text-xl text-[#324152] font-rubik font-semibold my-auto mr-4">{comment.user.username}</h1>
                {info.currentUser.username == comment.user.username ?
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
                <Likes inScore={comment.score} />
                {info.currentUser.username == comment.user.username ? !edit ?
                (<DelEdit setChat={setChat} comment={comment} setComments={setComments} comments={comments} setRender={setRender} setEdit={setEdit} />)
                : (<div className='rounded-lg bg-[#5457b6] text-lg font-semibold font-rubik text-center leading-10 w-24 h-10 md:z-20 md:self-start hover:cursor-pointer hover:opacity-50' onClick={() => {setEdit(false); update()}}>UPDATE</div>) 
                : (
                <div className="flex md:self-start md:z-20 hover:cursor-pointer hover:opacity-50">
                  <img src={reply} className="w-4 h-4 mr-2" />
                  <h1 className="text-[#5457b6] font-rubik font-semibold text-xl leading-4" onClick={() => {replyClick(); setReplyTo(comment.user.username); setRepliedTo(comment.user.username); setReplyingToId(comment.postId || comment.replyingToId); setReplyComment(true); window.screen.width >= 768 ? setMainInp(false) : null}}>Reply</h1>
                </div>
                )}
            </div>
        </div>
        {replyComment && window.screen.width >= 768 ? (
            <div className="flex gap-x-6 bg-white rounded-lg p-6 mb-4 mt-[-0.5rem] pb-2">
                <img src={info.currentUser.image.png} className="w-12 h-12" />
                <MentionsInput
                style={mentionStyle}
                value={entry}
                onChange={(e) => {setEntry(e.target.value)}}
                placeholder='Add your reply...'
                className='bg-white border-[#67727e2f] border-2 font-rubik h-fit w-full rounded-lg text-[#67727e] mb-6 overflow-y-auto'>
                 <Mention data={users} trigger="@" markup="@[__display__]" appendSpaceOnAdd={true} className='text-[#5457b6] z-50  md:relative md:top-[1px] md:right-[1.7px]' />
               </MentionsInput>
               <div className='h-12 w-24 rounded-lg bg-[#5457b6] float-right self-start hover:cursor-pointer hover:opacity-50'>
                 <h1 className='my-auto relative bottom-1 p-4 text-lg font-semibold font-rubik text-center' onClick={() => {addComment(); setReplyComment(false); setMainInp(true)}}>REPLY</h1>
               </div>
            </div>
        ) : null}
        </>
    )
}

function Likes({ inScore }) {
    const home = inScore
    const [score, setScore] = useState(inScore)

    const upVote = () => {
        //this makes it so that you can't add more than one upvote
        if (score <= home) {
            setScore(score + 1)
        }
    }
    const downVote = () => {
        //this makes it so that you can't add more than one downvote
        if (score >= home) {
            setScore(score - 1)
        }
    }

    return (
        <div className="bg-[#eaecf1] h-10 w-24 px-3 py-3 rounded-xl flex justify-between md:flex-col md:h-24 md:w-fit items-center">
            <img src={plus} className="w-4 h-4 hover:cursor-pointer" onClick={upVote} />
            <h1 className="text-xl text-[#5457b6] font-rubik font-semibold leading-none relative bottom-1 md:bottom-0">{score}</h1>
            <img src={minus} className="w-4 h-1 relative top-[0.4rem] md:top-0 hover:cursor-pointer" onClick={downVote} />
        </div>
    )
}

function DelEdit({ comment, setComments, comments, setRender, setEdit }) {
    const [confirm, setConfirm] = useState(false)
    const delComment = () => {
        if (comment.postId) {
          const newArr = comments.filter((item) => {
           return (item.id != comment.id)
          })
          setComments(newArr)
        } else {
            const newArr = comments
            console.log(comment.replyingToId)
            newArr[comment.replyingToId - 1].replies = newArr[comment.replyingToId - 1].replies.filter((item) => {
                return (item.id != comment.id)
            })
            setComments(newArr)
            setRender(a => !a)
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
             <div className="fixed top-0 left-0 w-screen h-screen z-40 bg-black opacity-40"></div>
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