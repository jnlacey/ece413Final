function isValidInput() {
    var initBalanceElement = document.getElementById("initBalance");
    var numYearsElement = document.getElementById("numYears");
    var interestRateElement = document.getElementById("intRate");
    var isValid = true;
    
    var numYearsRe = /^\d?\d$/;         // One or two digits
    var interestRateRe = /^\d?\d\.\d+$/;     // One or two digits followed by a . followed by 1 or more digits
    var balanceRe = /^\d+(\.\d\d)?$/;   // Any number of digits followed optionally by a . and two digits

    if (balanceRe.test(initBalanceElement.value)) {
       initBalanceElement.classList.remove("error");
    }
    else {
       initBalanceElement.classList.add("error");
       isValid = false;
    }

    if (numYearsRe.test(numYearsElement.value)) {
       numYearsElement.classList.remove("error");
    }
    else {
       numYearsElement.classList.add("error");
       isValid = false;
    }

    if (interestRateRe.test(interestRateElement.value)) {
       interestRateElement.classList.remove("error");
    }
    else {
       interestRateElement.classList.add("error");
       isValid = false;
    }
    
    return isValid;
}

function generateTable() {
    if (!isValidInput()) return;
    
    var initBalance = 1.0 * document.getElementById("initBalance").value;
    var numYears = parseInt(document.getElementById("numYears").value);
    var interestRate = parseFloat(document.getElementById("intRate").value);
    var isYearlyInterest = document.getElementById("yearlyInt").checked;
    var currBalance;

    var savingsTableDiv = document.getElementById("savingsTable");
    var tableHTML = "";
    
    tableHTML += "<table>\n";
    tableHTML += "<tr><th>Year</th><th>Balance</th></tr>\n";
    
    currBalance = initBalance;
    for(let i = 0; i < numYears; i++) {
        if (isYearlyInterest) {
            currBalance += currBalance * (interestRate / 100.0);
        }
        else {
            currBalance *= Math.pow(1.0 + (interestRate / 100.0), 12);
        }
        tableHTML += "<tr><td>" + (i+1) + "</td><td>$" + currBalance.toFixed(2) + "</td></tr>\n";
    }
    
    tableHTML += "</table>\n";
   
    savingsTableDiv.innerHTML = tableHTML;
}

// Once the DOM is loaded, register an event handler for the Generate Table Button
document.addEventListener("DOMContentLoaded", function(event) {     
   var elements = document.getElementsByTagName("input");
   
   for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener("input", generateTable);
      elements[i].addEventListener("change", generateTable);
   }
   
   generateTable();
});


