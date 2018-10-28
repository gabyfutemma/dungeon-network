const DATABASE = firebase.database();

$(document).ready( function() {
  splash();
  $(".signin-btn").on("click", signInClick);
  $(".start-btn").on("click", register);
  $(".signup-btn").on("click", signUpClick);
  $(".return-btn").on("click", returnToIndex);
});

function splash(){
  $("#splash-logo").fadeOut(5000, function() {
    $("#splash-logo").addClass("splash-display");
    $("#start-and-play").removeClass("startplay-display");
  });
}

function signInClick(event) {
  event.preventDefault();
  const email = $(".email").val();
  const password = $(".password").val();
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(response) {
    window.location = "main.html?id=" + response.user.uid;
  })
  .catch(function(error) {
    handleError(error);
  });
}

function register(){
  event.preventDefault();
  window.location= "register.html";
}

function signUpClick(event) {
  event.preventDefault();
  const nickname = $(".nickname").val();
  const email = $(".email").val();
  const password = $(".password").val();
  const birthday = $(".birthday").val();
  const country = $(".country").val();
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(response) {
    const USER_ID = response.user.uid;
    DATABASE.ref("/user/" + USER_ID).set({
      displayName: nickname,
      userEmail: email,
      userPassword: password,
      userID: USER_ID,
      userDateOfBorn: birthday,
      userCountry: country
    });
    window.location = "main.html?id=" + USER_ID;
  })

  .catch(function(error) {
    handleError(error);
  });
}

function returnToIndex(event) {
  event.preventDefault();
  window.location= "index.html";
}

function handleError(error) {
  const errorMessage = error.message;
  alert(errorMessage);
}
