const DATABASE = firebase.database();
const USER_ID = window.location.search.match(/\?id=(.*)/)[1];
const MAX_CHAR = 300;
const filterView = $(".filter-view");
const postArea = document.getElementById("post-textarea");

$(document).ready(function() {
  getUserName();
  getNameIdFollowList();
  $(".send-btn").on("click", sendPosts);
  $('.logout-btn').on("click", logout);
  filterView.change(filterViewPosts);
  postArea.addEventListener('input', countCharBlockButton);
});

// GET NAME LOGGED USER
function getUserName() {
  DATABASE.ref(`/user/${USER_ID}`).once("value")
  .then(function(snapshot) {
      const dataSnapshot = snapshot.val();
      const displayName = dataSnapshot.displayName;
      setUserName(displayName);
      getPostsDB(displayName);
  });
}

// SET NAME LOGGER USER IN PROFILE
function setUserName(name) {
  const userName = $(".user-name");
  userName.text(name);
}

// GET ALL POSTS OF USER IN LOAD DB
function getPostsDB(){
  DATABASE.ref(`/user-posts/${USER_ID}`).on("child_added", function (privatePostsData) {
    const privateKey = privatePostsData.key;
    const privateData = privatePostsData.val();
    const privateAuthorId = privateData.authorID;
    const privateAuthorName = privateData.authorName;
    const privateText = privateData.text;
    const privateFilter = privateData.filter;
    const privateLikes = privateData.like;
    printPosts(privateKey, privateAuthorId, privateAuthorName, privateText, privateFilter, privateLikes);
  });
}

// GET PERSONAL POSTS DB
function getPersonalPostsDB(){
  DATABASE.ref(`/user-posts/${USER_ID}`).once("value")
  .then(function(personalData) {
    personalData.forEach(function(personalPostsData) {
      const personalKey = personalPostsData.key;
      const personalData = personalPostsData.val();
      const personalAuthorId = personalData.authorID;
      const personalAuthorName = personalData.authorName;
      const personalText = personalData.text;
      const personalFilter = personalData.filter;
      const personalLikes = personalData.like;
      printPosts(personalKey, personalAuthorId, personalAuthorName, personalText, personalFilter, personalLikes);
    });
  });
}

// GET ALL PUBLIC POSTS
function getPublicPostsDB() {
  DATABASE.ref(`/posts/`).once("value")
  .then(function(publicPosts) {
    publicPosts.forEach(function(publicPostsData) {
      const publicKey = publicPostsData.key;
      const publicData = publicPostsData.val();
      const publicAuthorId = publicData.authorID;
      const publicAuthorName = publicData.authorName;
      const publicText = publicData.text;
      const publicFilter = publicData.filter;
      const publicLikes = publicData.like;
      printPosts(publicKey, publicAuthorId, publicAuthorName, publicText, publicFilter, publicLikes);
    });
  });
}

// GET FRIENDS POSTS DB
function getFriendsPostsDB() {
  DATABASE.ref(`/friends/${USER_ID}`).once("value")
  .then(function(friendsListSnapshot) {
    friendsListSnapshot.forEach(function(friendSnapshot){
      const friendData = friendSnapshot.val();
      const friendFollowedName = friendData.friendName;
      const friendFollowedID = friendData.friendId;
      DATABASE.ref(`/friends-posts/`).once('value')
      .then(function(friendPostSnapshot) {
        friendPostSnapshot.forEach(function(eachFriendPost) {
          const friendPostKey = eachFriendPost.key;
          const friendPostData = eachFriendPost.val();
          const friendPostAuthorId = friendPostData.authorID;
          const friendPostAuthorName = friendFollowedName;
          const friendPostText = friendPostData.text;
          const friendPostFilter = friendPostData.filter;
          const friendPostLikes = friendPostData.like;
          if (friendFollowedID === friendPostAuthorId) {
            printPosts(friendPostKey, friendPostAuthorId, friendPostAuthorName, friendPostText, friendPostFilter, friendPostLikes);
          }
        });
      });
    });
  });
}

// BLOCK BUTTON AND CHAR COUNT
function countCharBlockButton() {
  const upArea = this.value;
  const nChar = upArea.split('').length;
  $(".character-count").html(MAX_CHAR - nChar);
  if (upArea.value === null) {
    $(".send-btn").prop("disabled", true);
  }
  if (nChar > 0 && nChar <= MAX_CHAR) {
    $(".send-btn").prop("disabled", false);
    $(".send-btn").css("opacity", "1");
  } else {
    $(".send-btn").prop("disabled", true);
    $(".send-btn").css("opacity", "0.5");
  }
}

// SEND POSTS
function sendPosts(event) {
  event.preventDefault();
  DATABASE.ref(`/user/${USER_ID}`).once("value")
  .then(function(snapshot) {
    const dataSnapshot = snapshot.val();
    const displayName = dataSnapshot.displayName;
    const newPostKey = DATABASE.ref().child("posts").push().key;
    const filterPost = $(".filter-posts").val();
    const newPost = $(".post-textarea").val();
    $(".post-textarea").val("");
    $(".character-count").text(MAX_CHAR);
    $(".send-btn").prop("disabled", true);
    $(".send-btn").css("opacity", "0.5");
    const postInfo = {
      authorID: USER_ID,
      authorName: displayName,
      text: newPost,
      filter: filterPost,
      like: 0
    };
    if (filterPost === "public" && filterPost !== "none") {
      DATABASE.ref(`/posts/${newPostKey}`).set(postInfo);
    }
    if (filterPost === "friends" && filterPost !== "none") {
      DATABASE.ref(`/friends-posts/${newPostKey}`).set(postInfo);
    }
    if (filterPost !== "none") {
      DATABASE.ref(`/user-posts/${USER_ID}/${newPostKey}`).set(postInfo);
    }
  });
}

// PRINT POSTS IN HTML
function printPosts(key, id, author, text, filter, likes) {
  $(".posts-list").prepend(`
    <li class="box-post mb-2 pl-1 pt-2" data-post-key=${key}>
      <h4 class="ml-2"> ${author} </h4>
      <p class="text-wrap ml-2" data-text-key=${key}> ${text} </p>
      <div class="d-flex flex-wrap justify-content-end mt-3">
        <div class="d-flex align-items-center">
          <p class="likes-count mr-1" data-countlike-id="${key}"> ${likes} </p>
          <button class="like-btn form-btn post-btn my-3 mr-2 py-1 px-1" data-like-id="${key}"> Life! </button>
        </div>
        <button class="edit-btn form-btn post-btn my-3 mr-2 py-1 px-1" data-edit-id=${key}> Edit </button>
        <button class="del-btn form-btn post-btn my-3 mr-2 py-1 px-1" data-del-id=${key}> Delete </button>
      </div>
    </li>
  `);
  if (id === USER_ID) {
    $(`button[data-like-id=${key}]`).hide();
  }
  if (id === USER_ID && filterView.val() === "none" || filterView.val() === "private") {
    $(`p[data-countlike-id=${key}]`).hide();
  }
  if (filterView.val() === "public" || filterView.val() === "friends") {
    $(`button[data-del-id=${key}]`).hide();
    $(`button[data-edit-id=${key}]`).hide();
  }
  likePosts($(`button[data-like-id=${key}]`), $(`p[data-countlike-id=${key}]`), likes, key);
  deletePosts($(`input[data-post-key=${key}]`), $(`button[data-del-id=${key}]`), key);
  editPosts($(`button[data-edit-id=${key}]`), key, text, filter);
}

//LIKE POSTS
function likePosts(buttonID, likesID, likes, key) {
  buttonID.click(function(){
    likesID.html(`${likes += 1}`);
    DATABASE.ref(`/posts/${key}`).update({
      like: likes
    });
    DATABASE.ref(`/friends-posts/${key}`).update({
      like: likes
    });
  });
}

// DELETE POSTS
function deletePosts(postId, buttonId, key) {
  buttonId.click(function() {
    DATABASE.ref(`/user-posts/${USER_ID}/${key}`).remove();
    DATABASE.ref(`/posts/${key}`).remove();
    DATABASE.ref(`/friends-posts/${key}`).remove();
    $(`li[data-post-key=${key}]`).remove();
  });
}

// EDIT POSTS
function editPosts(buttonId, key, text, filter) {
  buttonId.click(function() {
    $("#edit-post").modal();
    $(".modal-body-edit").empty();
    $(".modal-body-edit").prepend(`
      <textarea class="post-textarea edit-post h-100 w-100" data-area-id=${key} />
    `);
    $(".edit-post").text(`${text}`);
    $(".save-btn").click(function() {
      const editedText = $(".edit-post").val();
      if (filter === "public") {
        DATABASE.ref(`/user-posts/${USER_ID}/${key}`).update({
          text: editedText
        });
        DATABASE.ref(`/posts/${key}`).update({
          text: editedText
        });
      }
      if (filter === "friends") {
        DATABASE.ref(`/user-posts/${USER_ID}/${key}`).update({
          text: editedText
        });
        DATABASE.ref(`/friends-posts/${key}`).update({
          text: editedText
        });
      }
      $(`p[data-text-key=${key}]`).text(editedText);
    });
  });
}

// FILTER TO VIEW POSTS BY TYPE
function filterViewPosts() {
  $(".posts-list").empty();
  if (filterView.val() === "public") {
    getPublicPostsDB();
  }
  if (filterView.val() === "friends") {
    getFriendsPostsDB();
  }
  if (filterView.val() === "private" || filterView.val() === "none") {
    getPersonalPostsDB();
  }
}

// GET USERNAME AND KEY TO FOLLOW LIST
function getNameIdFollowList() {
  DATABASE.ref("user").once("value")
  .then(function(snapshot){
    snapshot.forEach(function(childSnapshot){
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      const childUserName = childData.displayName;
      createUsers(childUserName, childKey);
    });
  });
}

// FOLLOW USERS
function createUsers(displayName, key) {
  if (key !== USER_ID) {
    $(".users-list").append(`
      <li class="d-flex align-items-center my-2">
        <button class="follow-btn form-btn post-btn py-1 px-3 mr-2" data-user-id="${key}"> Add to party!</button>
        <span>${displayName}</span>
      </li>
    `);
  }
  $(`button[data-user-id=${key}]`).click(function() {
    DATABASE.ref(`/friends/${USER_ID}`).push({
      friendName: displayName,
      friendId: key
    });
    alert(`You add ${displayName} to your party!`);
  });
}

// LOGOUT
function logout() {
  firebase.auth().signOut()
  .then(function() {
    window.location = "index.html";
  })
  .catch(function(error) {
  alert(error.message);
  });
}