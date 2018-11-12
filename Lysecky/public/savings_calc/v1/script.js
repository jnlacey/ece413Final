function generateTable() {
    var initBalance = 1000;
    var numYears = 5;
    var interestRate = 1.2;
    var currBalance;

    var savingsTabelDiv = document.getElementById("savingsTable");
    var tableHTML = "";
    
    tableHTML += "<table>\n";
    tableHTML += "<tr><th>Year</th><th>Balance</th></tr>\n";
    
    currBalance = initBalance;
    for(let i = 0; i < numYears; i++) {
        currBalance += currBalance * (interestRate / 100.0);
        tableHTML += "<tr><td>" + (i+1) + "</td><td>" + currBalance + "</td></tr>\n";
    }
    
    tableHTML += "</table>\n";
   
    savingsTabelDiv.innerHTML = tableHTML;
}