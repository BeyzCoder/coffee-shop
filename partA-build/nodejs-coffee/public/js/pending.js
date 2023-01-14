if( document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', Ready);
} else {
    PrintOutPendingOrder();
    Ready();
}

// #################################### PENDING ####################################
function PrintOutPendingOrder() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/pending-order";

    // Setting up for the request.
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send();

    // Wait until the server response back.
    xmlhttp.onreadystatechange = function() {
        if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
            var result = xmlhttp.responseText;

            if( result == "Fail" ) {
                alert(result + ": Something went wrong to the get!");
            }
            else if( result == "Empty" ) {
                var pendItems = document.getElementsByClassName('pending-order-section')[0];
                pendItems.innerHTML = "";
                pendItems.innerText = "There are no pending order at this moment...";
            }
            else {
                var obj = JSON.parse(xmlhttp.responseText);
                var pendItems = document.getElementsByClassName('pend-items')[0];

                obj = obj.Products;

                console.log(obj);
                // Display the data to the table.
                for( var i = 0; i < obj.length; i++ ) {
                    var itemContent = document.createElement('div');
                    itemContent.classList.add('pend-item');

                    var itemContentHTML = `
                        <span class="pend-name">${obj[i].drink_name}</span>
                        <img class="pend-image" src="images/${obj[i].pic_src}">
                        <span class="pend-price">$${obj[i].price}</span>
                    </div>
                    `;
                
                    itemContent.innerHTML = itemContentHTML;
                    pendItems.append(itemContent);

                    UpdateCartTotal();
                }
            }
        }
    }
}

function UpdateCartTotal() {
    var pendItems = document.getElementsByClassName('pend-items')[0];
    var pendItem = pendItems.getElementsByClassName('pend-item');
    var total = 0;
    for( var i = 0; i < pendItem.length; i++ ) {
        var item = pendItem[i];
        var priceElement = item.getElementsByClassName('pend-price')[0];
        
        var price = parseFloat(priceElement.innerText.replace('$', ''));
        total = total + price;
    }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('pend-total-price')[0].innerText = '$'+total;
}

function Ready() {
    var cancelOrderButton = document.getElementsByClassName('cancel-order-button')[0];
    cancelOrderButton.addEventListener('click', RemovePendingOrder);

    var barTimer = setInterval( () => {
        var progressBar = document.getElementsByClassName('prog-bar')[0];
        if( progressBar.value < 59 ) {
            setTimeout(() => progressBar.value += 1, 1000);
        } 
        if( progressBar.value == 30) {
            var cancelButton = document.getElementsByClassName('cancel-order-button')[0];
            progressBar.parentElement.removeChild(cancelButton);
            alert("You cant anymore cancel your order");
        }
        if( progressBar.value == 60 ) {
            clearInterval(barTimer);
            alert("Your order is ready to pick up");

            var xmlhttp = new XMLHttpRequest();
            var url = "/completed-order";

            // Setting up for the request.
            xmlhttp.open('POST', url, true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.send()

            // Wait until the server response back.
            xmlhttp.onreadystatechange = function() {
                if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
                    var result = xmlhttp.responseText;

                    if( result == "Fail" ) {
                        alert(result + ": Something went wrong to the get!");
                    }
                    else if ( result == "Double" ) {
                        console.log("the XMLrequest was double!");
                    }
                    else {
                        alert("Thank you for ordering with us");
                        location.reload();
                    }
                }
            }
        } 
    }, 1000);
}

function RemovePendingOrder() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/cancel-order";

    // Setting up for the request.
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send()

    // Wait until the server response back.
    xmlhttp.onreadystatechange = function() {
        if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
            var result = xmlhttp.responseText;

            if( result == "Fail" ) {
                alert(result + ": Something went wrong to the get!");
            }
            else {
                alert("You just cancel your order");
                location.reload();
            }
        }
    }
}

function barFunc() {
    var progressBar = document.getElementsByClassName('prog-bar')[0];
    if( progressBar.value < 59 ) {
        setTimeout(() => progressBar.value += 1, 1000);
    } 
    if( progressBar.value == 30) {
        var cancelButton = document.getElementsByClassName('cancel-order-button')[0];
        progressBar.parentElement.removeChild(cancelButton);
        alert("You cant anymore cancel your order");
    }
    if( progressBar.value == 60 ) {
        var xmlhttp = new XMLHttpRequest();
        var url = "/completed-order";

        // Setting up for the request.
        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send()

        // Wait until the server response back.
        xmlhttp.onreadystatechange = function() {
            if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
                var result = xmlhttp.responseText;

                if( result == "Fail" ) {
                    alert(result + ": Something went wrong to the get!");
                }
                else if ( result == "Double" ) {
                    console.log("the XMLrequest was double!");
                }
                else {
                    alert("Your order is ready to pick up");
                    alert("Thank you for ordering with us");
                    location.reload();
                }
            }
        }
    } 
}