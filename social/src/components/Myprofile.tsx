import { BsThreeDotsVertical as Dots } from 'react-icons/Bs'
import { AiFillDislike as Dislike} from 'react-icons/Ai'
import { AiFillLike as Like} from 'react-icons/Ai'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { FormEvent } from 'react';
import Navbar from './Navbar';
import axios from 'axios';

interface Iposts {
    postid: number,
    post_author: string,
    post_text: string,
    post_date: string,
    isshown: boolean,
    isedited: boolean,
}

interface Ilikes {
    user_id: number,
    post_id: number,
}

interface Iresult {
    [postId: string]: number;
}

function Myprofile(props: { updateUser: (user:string) => void}) {

    const [userImage, setUserImage] = useState<Blob>();
    const [postInfo, setPostInfo] = useState<Iposts[]>([]);
    const [postLikes, setPostLikes] = useState<Ilikes[]>([]);
    // pagination
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4; // Number of items per page
    const pageCount = Math.ceil(postInfo.length / itemsPerPage);
    const handlePageClick = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected);
    };
    const offset = currentPage * itemsPerPage;
    const currentPageData = postInfo.slice(offset, offset + itemsPerPage);
    // pagination
    const [finalLikes, setFinalLikes] = useState<Iresult>({});
    const localVariable = localStorage.getItem("currentUser"); 
    const currentUser =  localVariable != null ? JSON.parse(localVariable).logUser : "";
    const userid = localVariable != null ? JSON.parse(localVariable).logId : 0;
    const navigate = useNavigate();

    const refreshPage = () => {
        navigate(0);
    }
    const { updateUser } = props;

    // logout button
    const logout = () => {
        updateUser("");
        localStorage.setItem("currentUser", JSON.stringify({}));
        navigate("/");
    }

    // show/hide the dropdown menu of its item
    const showMenu = (id: number) => {
        setPostInfo((postInfo) => postInfo.map((post) =>
            post.postid === id ? { ...post, isshown: !post.isshown } : post
        )
      ); 
    };

    // delete the given post
    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(`http://localhost:3000/server/delete/${id}`);
            console.log(id," was deleted successfully!", response);
            refreshPage();
        } catch (error) {
            console.log(error);
        }
    };

    // open edit
    const handleOpenEdit = (id: number) => {
        setPostInfo((postInfo) => postInfo.map((post) =>
        post.postid === id ? { ...post, isedited: !post.isedited } : post
        ));
    };

    // edit the given post
    const handleEdit = async (e: FormEvent<HTMLFormElement>, id: number) => {
        e.preventDefault();
        const myform = e.currentTarget;
        const text = myform.edited.value;
        console.log("this is edited", text);
        try {
            const response = await axios.post(`http://localhost:3000/server/edit/${id}/${text}`);
            console.log(id," was edited successfully!", response);
            refreshPage();
        } catch (error) {
            console.log(error);
        }
    };

    // like a post
    const likePost = async (postid: number) => {
        // send the query to the db
        try {
            const response = await axios.post(`http://localhost:3000/server/like/${postid}/${userid}`);
            console.log("post with id:", postid," was deleted successfully!", response);
            refreshPage()
        } catch (error) {
            console.log(error);
        }
    };

    // dislike a post
    const dislikePost = async (postid: number) => {
        try {
            const response = await axios.delete(`http://localhost:3000/server/dislike/${postid}/${userid}`);
            console.log("my respons to dislike", response);
            refreshPage();
        } catch(err) {
            console.log(err);
        }
    };
    // calculate likes
    const calculateLikes = (postLikes: Ilikes[]) => {
        const likesResult: Iresult = {};
        for(let i=0; i<postLikes.length; i++){
            if(!likesResult[postLikes[i].post_id]) likesResult[postLikes[i].post_id] = 1;
            else likesResult[postLikes[i].post_id] += 1;
        }
        console.log(likesResult);
        setFinalLikes(likesResult);
    };

    // returns true if the post is liked or false if it is not
    const isLiked = (userid: number, postid: number) => {
        for(let i=0; i<postLikes.length; i++){
            if( postLikes[i].post_id == postid && postLikes[i].user_id == userid ) {
            return true;
        }}
        return false;
    }
    
    //get the posts and the user's image from the server
    useEffect(() => {

        const getImage = async () => {
            try {
                const response = await axios.post(`http://localhost:3000/server/login/${currentUser}`);
                // convert data array to blob in order to display it
                const byteArray = new Uint8Array(response.data[0]["logimage"].data);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                setUserImage(blob);
                console.log("image result", blob);
                } catch (error) {
                console.log(error);
            }
        };

        const getPosts = async() => {
            let queryResult = [];
            try {
              const response = await axios.get(`http://localhost:3000/server/posts/${currentUser}`);
              queryResult = response.data;
              setPostInfo(queryResult);
            } catch(err) {
                console.log(err);
            }
        };

        const getLikes = async() => {
            try {
            const response = await axios.post(`http://localhost:3000/server/like/0/0`);
            const likes = response.data;
            setPostLikes(likes);
            calculateLikes(likes);
            // get each post's likes:
            } catch (err) {
                console.log(err)
            }
        };

        getPosts();
        getImage();
        getLikes();

    }, []);

    console.log(postInfo, postLikes);

    return(
        <div>
            <Navbar/>
            <div className=''> 
                <div className='text-2xl text-center font-extrabold text-orange-500 shadow-lg'>My Posts</div>
                { currentPageData.map( (currentPageData, index) => 
                (<div key={currentPageData.postid} className='text-[#363a42] rounded-md border-slate-400 m-2 p-2 bg-[#f5f6f8]'> 

                <div className='flex justify-between'>
                    <div className='flex items-center'>
                        {userImage && <img className="w-8 h-8 rounded-full" src={URL.createObjectURL(userImage)} alt="Selected" />}
                        <span className='font-semibold m-2'>{currentPageData.post_author}</span> 
                        <span>{currentPageData.post_date && currentPageData.post_date.split('T')[0].split('-').join(", ")}</span>
                    </div>
                    <div className='relative ml-auto'>
                        <div className='w-[2vw]'><Dots onClick={() => ( showMenu(currentPageData.postid) )}/>
                        { currentPageData.isshown ? <div className='bg-[#f7ebf1] font-semibold text-gray-600 absolute rounded-md ml-[-5vw] h-[8vh] w-[7vw] border-2 border-[#f7ebf1]'>
                            <div onClick={() => handleOpenEdit(currentPageData.postid)} className='m-[0.2vw] hover:text-[#e661a3]'>Edit</div>
                            <div onClick={() => handleDelete(currentPageData.postid)} className='m-[0.2vw] hover:text-[#ff6a6a]'>Delete</div>
                        </div> : <p></p> }
                        </div>
                    </div>
                </div>

                <div className='text-[16px] mt-2'>
                    { currentPageData.isedited ? 
                    <form onSubmit={(event) => handleEdit(event, currentPageData.postid)}>
                        <input key="form" className="rounded-md mx-2 py-4 w-[40%] outline-none" placeholder={" "+currentPageData.post_text} type="text"  name="edited"/>
                        <input key="btn" className="rounded-md hover:bg-[#cfdbc0] bgrounded-md w-[10%] p-2 border-slate-400 bg-[#b9dd90]" value="Edit" type="submit"></input>
                    </form>
                    :
                    <div>{currentPageData.post_text}</div>} 
                    {/*Add dislike icon if a user likes already the post.*/}
                    <div className='flex items-center font-14px mt-2'>           
                    { !isLiked(userid, currentPageData.postid) ? <div onClick={() => likePost(currentPageData.postid)} className='hover:text-red-500'><Like/></div>
                    : <div onClick={() => dislikePost(currentPageData.postid)} className='hover:text-red-500'><Dislike/></div> }
                    <span className='ml-2'>{finalLikes[currentPageData.postid] ? finalLikes[currentPageData.postid] : 0}</span>
                    </div>

                </div>
            </div>)
            )}
            </div>
            <ReactPaginate
                previousLabel={'Previous:'}
                nextLabel={'Next:'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={'border-b-2 p-2 m-2 font-semibold text-center text-gray-600 grid grid-cols-2 w-32 h-16'}
                activeClassName={'ml-[2vw] w-[60%] rounded-full bg-red-100 opacity-50'}
            />
            <button className="hover:bg-[#f35353] absolute bottom-4 right-4 bg-[#695681] text-white font-bold m-4 p-4 rounded-md" onClick={logout}>Log out </button>
        </div>
    )
};
export default Myprofile;