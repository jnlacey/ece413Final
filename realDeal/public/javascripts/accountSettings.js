function updateEmail() {
	var email = document.getElementById("updateEmail").value;
	console.log("Old email");
	console.log(email);
	$("#testResponse").html(email);

	var xhr = new XMLHttpRequest();
  	xhr.addEventListener("load", emailResponse);
  	xhr.responseType = "json";
  	xhr.open("POST", '/users/updateEmail');
  	xhr.setRequestHeader("Content-type", "application/json");
  	xhr.send(JSON.stringify( {email:email, token: window.localStorage.getItem("authToken")}) );
}
function emailResponse() {
	$("#testResponse").html(this.status);
	if(this.status === 201) {
		window.localStorage.setItem("authToken", this.response.token);
	 	$("#testResponse").html("201!");
		console.log("AMAZING (email)");
	}
	location.reload(true);
}
function updateUvThresh() {
	var thresh = document.getElementById("updateUvThresh").value;

	var xhr = new XMLHttpRequest();
  	xhr.addEventListener("load", threshResponse);
  	xhr.responseType = "json";
  	xhr.open("POST", '/users/updateUvThresh');
  	xhr.setRequestHeader("Content-type", "application/json");
  	xhr.send(JSON.stringify( {thresh: thresh,  token: window.localStorage.getItem("authToken")}));
}
function threshResponse() {
	$("#testResponse").html(this.status);
	if(this.status === 201) {
		console.log("AMAZING (thresh)");
	}
	location.reload(true);
}

function updateName() {
	var name = document.getElementById("updateName").value;

	var xhr = new XMLHttpRequest();
  	xhr.addEventListener("load", nameResponse);
  	xhr.responseType = "json";
  	xhr.open("POST", '/users/updateName');
  	xhr.setRequestHeader("Content-type", "application/json");
  	xhr.send(JSON.stringify( {name: name,  token: window.localStorage.getItem("authToken")}));
}
function nameResponse() {
	$("#testResponse").html(this.status);
	if(this.status === 201) {
		console.log("AMAZING (name)");
	}
	location.reload(true);
}
function updatePass() {
	var pass = document.getElementById("updatePassword").value;
	var aRegex =/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
  	if (!aRegex.test(pass)) {
	   var responseDiv = document.getElementById('ServerResponse');
           responseDiv.style.display = "block";
           responseDiv.innerHTML = "<p>Password must be at least 8 characters long with 1 uppercase, lowercase, numeric, and special character.</p>";
	}
	else {
	   var xhr = new XMLHttpRequest();
  	   xhr.addEventListener("load", passwordResponse);
  	   xhr.responseType = "json";
  	   xhr.open("POST", '/users/updatePass');
  	   xhr.setRequestHeader("Content-type", "application/json");
  	   xhr.send(JSON.stringify( {pass: pass,  token: window.localStorage.getItem("authToken")}));
 	}
}
function passwordResponse() {
	$("#testResponse").html(this.status);
	if(this.status === 201) {
		console.log("AMAZING (pass)");
	}
	location.reload(true);
}

$(function() {  

   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   $("#updateEmailButton").click(updateEmail);
   $("#updateUvThreshButton").click(updateUvThresh);
   $("#updateNameButton").click(updateName);
   $("#updatePasswordButton").click(updatePass);
});