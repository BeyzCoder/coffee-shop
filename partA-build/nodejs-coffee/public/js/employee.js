if( document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', Ready);
} else {
    PrintOutItemToList();
    Ready();
}

// #################################### LIST ####################################
function PrintOutItemToList() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/posting";

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
            else {
                var obj = JSON.parse(xmlhttp.responseText);
                var listItems = document.getElementsByClassName('list-items')[0];

                // Display the data to the table.
                for(x in obj) {
                    var itemContent = document.createElement('div');
                    itemContent.classList.add('list-item');
                    
                    var itemContentHTML = `
                        <span class="item-name">${obj[x].drink_name}</span>
                        <img class="item-image" src="images/${obj[x].pic_src}">
                        <span class="item-price">$${obj[x].price}</span>
                    </div>
                    `;
                
                    itemContent.innerHTML = itemContentHTML;
                    listItems.append(itemContent);
                }
            }
        }
    }
}

function request_query_insert() {
    // Create an XML request.
    var xmlhttp = new XMLHttpRequest();
    var url = "/insertmenu";
    
    var item_input = document.getElementById("item_in").value;
    var price_input = document.getElementById("price_in").value;
    var picture_input = document.getElementById("picture_in").value;  

    // If the inputs are empty then alert the client.
    if( item_input == "" || price_input == "" || picture_input == "" ) {
        alert("There are inputs that are missing!");

        // Clean up the text box.
        document.getElementById("item_in").value = "";
        document.getElementById("price_in").value = "";
        document.getElementById("picture_in").value = "";
    }
    else {
        var params = "item=" + item_input + "&" + "price=" + price_input + "&" + "picture=" + picture_input;

        // Setting up for the request.
        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send(params);

         // Wait until the server response back.
        xmlhttp.onreadystatechange = function() {
            if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
                var result = xmlhttp.responseText;

                if( result == "Success" ) {
                    alert("Your inputs has been added!");

                    location.reload();
                }
                else {
                    alert(result + ": Something went wrong to the insert!");

                    // Clean up the text box.
                    document.getElementById("item_in").value = "";
                    document.getElementById("price_in").value = "";
                    document.getElementById("picture_in").value = "";
                }
            }
        }
    }
}

function request_query_delete() {
    // Create an XML request.
    var xmlhttp = new XMLHttpRequest();
    var url = "/deletemenu";
    
    var item_input = document.getElementById("item_de").value;

    // If the inputs are empty then alert the client.
    if( item_input == "" ) {
        alert("There are inputs that are missing!");

        // Clean up the text box.
        document.getElementById("item_de").value = "";
    }

    else {
        var params = "item=" + item_input;

        // Setting up for the request.
        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send(params);

         // Wait until the server response back.
        xmlhttp.onreadystatechange = function() {
            if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
                var result = xmlhttp.responseText;

                if( result == "Success" ) {
                    alert("Your inputs has been deleted!");

                    location.reload();
                }
                else {
                    alert(result + ": Something went wrong to the delete!");

                    // Clean up the text box.
                    document.getElementById("item_de").value = "";
                }
            }
        }
    }
}