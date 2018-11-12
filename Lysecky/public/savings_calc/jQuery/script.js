function isValidInput() {
    var initBalanceElement = $('#initBalance');
    var numYearsElement = $('#numYears');
    var interestRateElement = $('#intRate');
    var isValid = true;

    var numYearsRe = /^\d?\d$/; // One or two digits
    var interestRateRe = /^\d?\d\.\d+$/; // One or two digits followed by a . followed by 1 or more digits
    var balanceRe = /^\d+(\.\d\d)?$/; // Any number of digits followed optionally by a . and two digits

    if (balanceRe.test(initBalanceElement.val())) {
        initBalanceElement.removeClass("error");
    }
    else {
        initBalanceElement.addClass("error");
        isValid = false;
    }

    if (numYearsRe.test(numYearsElement.val())) {
        numYearsElement.removeClass("error");
    }
    else {
        numYearsElement.addClass("error");
        isValid = false;
    }

    if (interestRateRe.test(interestRateElement.val())) {
        interestRateElement.removeClass("error");
    }
    else {
        interestRateElement.addClass("error");
        isValid = false;
    }

    return isValid;
}

function generateTable() {
    if (!isValidInput()) return;

    var initBalance = 1.0 * $('#initBalance').val();
    var numYears = parseInt($("#numYears").val());
    var interestRate = parseFloat($("#intRate").val());
    var isYearlyInterest = $("#yearlyInt").prop('checked');
    var currBalance;

    var savingsTableDiv = $("#savingsTable");
    var tableHTML = "";

    tableHTML += "<table>\n";
    tableHTML += "<tr><th>Year</th><th>Balance</th></tr>\n";

    currBalance = initBalance;
    for (let i = 0; i < numYears; i++) {
        if (isYearlyInterest) {
            currBalance += currBalance * (interestRate / 100.0);
        }
        else {
            currBalance *= Math.pow(1.0 + (interestRate / 100.0), 12);
        }
        tableHTML += "<tr><td>" + (i + 1) + "</td><td>$" + currBalance.toFixed(2) + "</td></tr>\n";
    }

    tableHTML += "</table>\n";
    savingsTableDiv.html(tableHTML);
}

// Once the DOM is loaded, register an event handler for the Generate Table Button
$(function() {
    var elements = document.getElementsByTagName("input");

    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener("input", generateTable);
    }

    generateTable();
});
