function sendReqForAccountInfo1() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess1,
      error: accountInfoError1
   });
}

function accountInfoSuccess1(data, textStatus, jqXHR) {

	var dev = data.devices[0].deviceId;

	/* For Summary View */
	$.ajax({
		url: '/activity/getActivitySummary',
		type: 'GET',
		data: {"deviceID": dev},
		responseType: 'json',
		success: summaryView,
		error: accountInfoError1
	});
}

/* Creates summary view */
function summaryView(data, textStatus, jqXHR) {

	var totalDuration = 0;
	var totalCalories = 0;
	var totalUV = 0;

	for(var i = 0; i < data.length; i++) {
		totalDuration += data[i].duration;
		totalCalories += data[i].calories;
		totalUV += data[i].uv;
	}

	$("#duration").html(totalDuration.toFixed(2));
	$("#calories").html(totalCalories.toFixed(2));
	$("#uvExposure").html(totalUV.toFixed(2));
}

function sendReqForAccountInfo2() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess2,
      error: accountInfoError1
   });
}

function accountInfoSuccess2(data, textStatus, jqXHR) {
   	var tableHTML = "";

	var dev = data.devices[0].deviceId;

	/* For List View */
	 $.ajax({
    	url: '/activity/getActivities',
     	type: 'GET',
 		data: {"deviceID": dev},
      	responseType: 'json',
      	success: listView,
      	error: listViewError
   	});
}

function listView(data, textStatus, jqXHR) {

     $("#error").hide();

     var table = document.getElementById("listView");
     while (table.firstChild) {
    	table.removeChild(table.firstChild);
	 }

	if(data.length == 0) {
		$("#tester").html("none found");
	}

	//var tableDiv = document.getElementById("listView");

	var tableObj = document.getElementById("listView");
	//tableObj.className = "striped";

	var thead = document.createElement("thead");
	var headRow = document.createElement("tr");

	var headActivityType = document.createElement("th");
	var headDate = document.createElement("th");
	var headDuration = document.createElement("th");
	var headCalories = document.createElement("th");
	var headUV = document.createElement("th");
	var activityAnchorCol = document.createElement("th");
	headActivityType.innerHTML = "Activity Type   ";
	var span = document.createElement("span");
	span.innerHTML = "<br>(Editable)";
	span.className = "Editable"; 
	headActivityType.appendChild(span);
	headDate.innerHTML = "Date of Activity";
	headDuration.innerHTML = "Duration of Activity (minutes)";
	headCalories.innerHTML = "Calories Burned";
	headUV.innerHTML = "UV Exposure";
	activityAnchorCol.innerHTML = "";

	headRow.appendChild(headActivityType);
	headRow.appendChild(headDate);
	headRow.appendChild(headDuration);
	headRow.appendChild(headCalories);
	headRow.appendChild(headUV);
	headRow.appendChild(activityAnchorCol);
	thead.appendChild(headRow);
	tableObj.appendChild(thead);
	
	var tbody = document.createElement("tbody");

	for(var i = 0; i < data.length; i++){
		var row = document.createElement("tr");

		var ActivityTypeRow = document.createElement("td");
		ActivityTypeRow.contentEditable = "true";
		ActivityTypeRow.className = "hovering";
		ActivityTypeRow.id = data[i].sessionNum;

		var DateRow = document.createElement("td");
		var DurationRow = document.createElement("td");
		var CaloriesRow = document.createElement("td");
		var UVRow = document.createElement("td");
		var anchorRow = document.createElement("td");
		var anchorString = "<a HREF = 'activityView.html?id=" + data[i].deviceID + "&session=" + data[i].sessionNum + "'>View Data</a>";

		ActivityTypeRow.innerHTML = data[i].activityType;
		console.log("big ol test");
		console.log(data[i].sessionNum);
		var tempDate = new Date(0);
		tempDate.setUTCSeconds(data[i].sessionNum); //Offset to convert to MST		
		
		var months;
		if(tempDate.getMonth() == 0) { months = "Jan"; }
		else if(tempDate.getMonth() == 1) { months = "Feb"; }
		else if(tempDate.getMonth() == 2) { months = "March"; }
		else if(tempDate.getMonth() == 3) { months = "Apr"; }
		else if(tempDate.getMonth() == 4) { months = "May"; }
		else if(tempDate.getMonth() == 5) { months = "June"; }
		else if(tempDate.getMonth() == 6) { months = "July"; }
		else if(tempDate.getMonth() == 7) { months = "Aug"; }
		else if(tempDate.getMonth() == 8) { months = "Sept"; }
		else if(tempDate.getMonth() == 9) { months = "Oct"; }
		else if(tempDate.getMonth() == 10) { months = "Nov"; }
		else if(tempDate.getMonth() == 11) { months = "Dec"; }

		var days = tempDate.getDate();
		var years = tempDate.getFullYear();



		DateRow.innerHTML = months + " " + days + ", " + years;

		var mins = data[i].duration / 60;
		DurationRow.innerHTML = mins.toFixed(2);
		CaloriesRow.innerHTML = data[i].calories.toFixed(2);
		UVRow.innerHTML = data[i].uv.toFixed(2);
		anchorRow.innerHTML = anchorString;
		
		row.appendChild(ActivityTypeRow);
		row.appendChild(DateRow);
		row.appendChild(DurationRow);
		row.appendChild(CaloriesRow);
		row.appendChild(UVRow);
		row.appendChild(anchorRow);

		tbody.appendChild(row);
	}
	tableObj.appendChild(tbody);
}


function accountInfoError1(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken 
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("index.html");
   } 
   else {
     
     $("#error").html("Error: " + jqXHR.responseText);
     $("#error").show();
   } 
}

function listViewError(jqXHR, textStatus, errorThrown) {
	if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("index.html");
   } 
   else {
     
     $("#error").html("Error: No activities found.");
     $("#error").show();

     var table = document.getElementById("listView");
     while (table.firstChild) {
    	table.removeChild(table.firstChild);
	 }
   } 
}

function signUpResponse() {
	$("#tester").html("cool");
  // 200 is the response code for a successful GET request
 //  if (this.status === 201) {
 //    if (this.response.success) {
 //      // Change current location to the signin page.
 //      window.location = "viewData.html";
 //    } 
 //  }
 //  else {
	// $("#error").html("Bad Request");
	// $("#error").show();    
 //  }
}



function sendReqForAccountInfo3() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess3,
      error: accountInfoError1
   });
}

function accountInfoSuccess3(data, textStatus, jqXHR) {
   	var tableHTML = "";
	var dev = data.devices[0].deviceId;
	/* For List View */
	 $.ajax({
    	url: '/activity/getActivities',
     	type: 'GET',
 		data: {"deviceID": dev},
      	responseType: 'json',
      	success: updateActivities1,
      	error: listViewError
   	});
}

function updateActivities1(data, textStatus, jqXHR) {
	//$("#tester").html(data.length);
	$("#error").hide();

	for(var i = 0; i < data.length; i++) {
		var sessionNumber = data[i].sessionNum;
		var dev = data[i].deviceID;

		var temp = document.getElementById(sessionNumber);
		//$("#tester").html(temp.innerHTML);

		if(temp.innerHTML != "Walking" && temp.innerHTML != "Running" && temp.innerHTML != "Biking") {
			$("#error").html("Invalid Activity Type. Valid: 'Walking', 'Running', or 'Biking'");
			$("#error").show();
		}
		else {	
			$("#tester").html("whoah");	
		 	var xhr = new XMLHttpRequest();
		  	xhr.addEventListener("load", updateActivitiesResponse);
		  	xhr.responseType = "json";
		  	xhr.open("POST", '/activity/update');
		  	xhr.setRequestHeader("Content-type", "application/json");
		  	xhr.send(JSON.stringify({deviceID: dev, session: sessionNumber, newActivityType: temp.innerHTML}));					   		
		}
	}
}
function updateActivitiesResponse() {
  // 200 is the response code for a successful GET request
  if (this.status === 201) {
    if (this.response.success) {
      // Change current location to the signin page.
      $("#tester").html("response detected");	
      window.location = "viewData.html";
    } 
  }
  else {
	$("#error").html(this.response.error);
	$("#error").show();    
  }
}

function updateActivitiesError(jqXHR, textStatus, errorThrown) {
	if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("index.html");
   } 
   else {
     
     $("#error").html("Error: Invalid.");
     $("#error").show();
   } 
}



$(function() {
	
	//Normal
	console.log("function called");

	document.getElementById("updateActivities").addEventListener("click", sendReqForAccountInfo3);
	sendReqForAccountInfo1();
	sendReqForAccountInfo2();

});
