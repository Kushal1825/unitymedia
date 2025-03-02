import React from "react";
import App from "../App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Profile from "../component/profile/Profile.jsx";
import Chate from "../component/Chate/Chate.jsx";
import Home from "../component/Home/Home.jsx";
import ProfileEdit from "../component/ProfileEdit/ProfileEdit.jsx";
import Post from "../component/Post/Post.jsx";
import Story from "../component/Story/Story.jsx";
import Explore from "../component/Explore/Explore.jsx";
import Forgate from "../component/Forgate/Forgate.jsx";
import Signup from "../component/Registration/signup/Signup.jsx";
import Login from "../component/Registration/login/Login.jsx";
import ViewPost from "../component/ViewPost/ViewPost.jsx";
import ViewProfile from "../component/ViewProfile/ViewProfile.jsx";
import PrivateRoute from "../PrivateRoute.jsx";
import StoryUpload from "../component/Home/storyUpload/StoryUpload.jsx";
import StorySeen from "../component/StoryPage/StorySeen.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="forgate" element={<Forgate />} />
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path="" element={<PrivateRoute />}>
        <Route path="" element={<Home />} />
        <Route path="story" element={<Story />} />
        <Route path="explore" element={<Explore />} />
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="chates" element={<Chate />} />
        <Route path="profileedit" element={<ProfileEdit />} />
        <Route path="post" element={<Post />} />
        <Route path="u/story" element={<StoryUpload />} />
        <Route path="story/:id" element={<StorySeen />} />
        <Route path="p/:id" element={<ViewPost />} />
        <Route path=":username" element={<ViewProfile />} />
      </Route>
      
    </Route>
  )
);

export default router;
