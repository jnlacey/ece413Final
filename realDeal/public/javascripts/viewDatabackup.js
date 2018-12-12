function sendReqForAccountInfo() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });
}

function accountInfoSuccess(data, textStatus, jqXHR) {
   	var tableHTML = "";
	$("#userName").html(data.fullName); 

	console.log("account found");
	var allIDs = [];
	for (var device of data.devices) {
		var anId = device.deviceId;
		allIDs.push(anId);
		console.log(anId);
	} 
		$.ajax({
      			url: '/devices/getdata',
     	 		type: 'GET',
			data: {"theID": allIDs},
     	 		responseType: 'json',
     	 		success: reportedData,
     	 		error: accountInfoError
  	 	});
    
  	 

    	console.log("tried to add data");
	

}

function reportedData(data, textStatus, jqXHR) {
	//data wil be of structure:
	//{"deviceReports": [] 
	// "deviceID": [],
	//  "GPS_lat": [],
	//  "GPS_lon": [],
	//  "uvLevel": [],
	//  "session": []
	//}
	
	$("#dataTable").html("<p>hi</p>");
} 

//function updateHTML(data, textSatus, jqXHR) {
//	console.log("tried to add data");
//	$("#dataTable").html(data.tableHTML);
//}

function accountInfoError(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken 
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("index.html");
   } 
   else {
     $("#error").html("Error: " + status.message);
     $("#error").show();
   } 
}

$(function() {
	console.log("function called");
	sendReqForAccountInfo();


});
