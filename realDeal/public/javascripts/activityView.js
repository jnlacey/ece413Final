var map;
function sendReqForAccountInfo() {
   
   console.log("reqForAc");
   jQuery.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });
}

function accountInfoError(data, textStatus, jqXHR) {

}
function accountInfoSuccess(data, textStatus, jqXHR) {
   	var tableHTML = "";
	//document.getElementById('userName').html(data.fullName); 
	console.log("account found");
	var allIDs = [];
	for (var device of data.devices) {
		var anId = device.deviceId;
		allIDs.push(anId);
		console.log(anId);
	} 
		jQuery.ajax({
      			url: '/devices/getdata',
     	 		type: 'GET',
			data: {"theID": allIDs},
     	 		responseType: 'json',
     	 		success: reportedData,
     	 		error: accountInfoError
  	 	});
    
}
function dataFill(data, textStatus, jqXHR) {
	const urlParams = new URLSearchParams(window.location.search);
	const idQ = urlParams.get('id');
	const sessionQ = urlParams.get('session');

	var aDate = new Date(0);
	aDate.setUTCSeconds(data.sessionNum);
	var durMin = data.duration/60.0;
	var durFinal = durMin.toFixed(1);
	var uvExp = data.uv;
	var type = data.activityType;
	var cals = data.calories;
	
	document.getElementById('theDate').innerHTML = aDate;
 	document.getElementById('theDuration').innerHTML =durFinal;
 	document.getElementById('theUv').innerHTML = uvExp.toFixed(2);
 	document.getElementById('theType').innerHTML = type;
 	document.getElementById('theCalories').innerHTML = cals.toFixed(2);
 	document.getElementById('error').innerHTML = "AMAZING";
 	
		jQuery.ajax({
      			url: '/devices/getdata',
     	 		type: 'GET',
			data: {"theID": idQ},
     	 		responseType: 'json',
     	 		success: mapMarker,
     	 		error: accountInfoError
		});

// activity date, duration, UV exposure, activity type, calories burned
}
function mapMarker(data, textStatus, jqXHR) {
	const urlParams = new URLSearchParams(window.location.search);
	const idQ = urlParams.get('id');
	const sessionQ = urlParams.get('session');

	var reports = data.deviceReports;
	var myLatLng;
	myLatLng = {lat: 32.253, lng: -110.912};
  	for (var i = 0; i < reports.length; i++) {
	    if(reports[i].session == sessionQ) {
		myLatLng = {lat: reports[i].GPS_lat, lng: reports[i].GPS_lon};
	    }
	}
	var map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 16,
    	center: myLatLng
  	});
       for (var i = 0; i < reports.length; i++) {
	    if(reports[i].session == sessionQ) {   
	       myLatLng = {lat: reports[i].GPS_lat, lng: reports[i].GPS_lon};
	       var marker = new google.maps.Marker({
	       position: myLatLng,
	       map: map,
       	       title: 'Marker'
      	      });
	  }
       }
}
function initMap() {
	const urlParams = new URLSearchParams(window.location.search);
	const idQ = urlParams.get('id');
	const sessionQ = urlParams.get('session');

		jQuery.ajax({	
			url: '/activity/getOneActivity',
     	 		type: 'GET',
			data: {"deviceID": idQ, "sessionNum": sessionQ},
     	 		responseType: 'json',
     	 		success: dataFill,
     	 		error: accountInfoError
  	 	});
}

$(function() {
	console.log("function called");
	sendReqForAccountInfo();
});

