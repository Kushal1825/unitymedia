import { createContext, useContext, useState } from "react";



const PostContext = createContext();

export const PostProvider =({children})=>{
  const [post,setPost]=useState([]);
  const [postIds,setPostIds]=useState([]);

  return(
    <PostContext.Provider value={{post,setPost,postIds,setPostIds}}>
      {children}
    </PostContext.Provider>
  );

};

export const usePost = ()=>{
  return useContext(PostContext);
}


