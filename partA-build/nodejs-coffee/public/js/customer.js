if( document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', Ready);
} else {
    PrintOutItemToMenu();
    Ready();
}

// #################################### MENU ####################################
function PrintOutItemToMenu() {
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
                var listItems = document.getElementsByClassName('menu-items')[0];

                // Display the data to the table.
                for(x in obj) {
                    var itemContent = document.createElement('div');
                    itemContent.classList.add('menu-item');
                    
                    var itemContentHTML = `
                        <span class="item-name">${obj[x].drink_name}</span>
                        <img class="item-image" src="images/${obj[x].pic_src}">
                        <div class="item-detail">
                            <span class="item-price">$${obj[x].price}</span>
                            <button class="btn item-button" type="button">ADD TO CART</button>
                        </div>
                    </div>
                    `;
                
                    itemContent.innerHTML = itemContentHTML;
                    listItems.append(itemContent);

                    itemContent.getElementsByClassName('item-button')[0].addEventListener('click', AddCartItem);
                }
            }
        }
    }
}

// #################################### CART ####################################
function Ready() {
    var deleteCartRowItemButtons = document.getElementsByClassName('btn-x');
    for( var i = 0; i < deleteCartRowItemButtons.length; i++ ) {
        var deleteButton = deleteCartRowItemButtons[i];
        deleteButton.addEventListener('click', RemoveCartItem);
    }

    var addCartRowItemButtons = document.getElementsByClassName('add-item-button');
    for( var i = 0; i <addCartRowItemButtons.length; i++ ) {
        var addButton = addCartRowItemButtons[i];
        addButton.addEventListener('click', AddCartItem);
    }

    var changesQuantityInputs = document.getElementsByClassName('cart-quantity-input');
    for( var i = 0; i < changesQuantityInputs.length; i++ ) {
        var numberInput = changesQuantityInputs[i];
        numberInput.addEventListener('change', ChangeQuantity);
    }

    var buttonPressed = document.getElementsByClassName('btn-purchase')[0];
    buttonPressed.addEventListener('click', RecordCartItems);
}

function AddCartItem(event) {
    var clicked = event.target;
    var itemInfo = clicked.parentElement.parentElement;
    var itemName = itemInfo.getElementsByClassName('item-name')[0].innerText;
    var itemImage = itemInfo.getElementsByClassName('item-image')[0].src;
    var itemPrice = itemInfo.getElementsByClassName('item-price')[0].innerText;

    var cartRowsItem = document.getElementsByClassName('cart-rows-item')[0];
    var cartContent = document.createElement('div');
    cartContent.classList.add('cart-row');

    var cartItemNames = document.getElementsByClassName('cart-item-name');
    for( var i = 0; i < cartItemNames.length; i++ ) {
        if( cartItemNames[i].innerText == itemName ) {
            alert("The item is already in the cart");
            return
        }
    }

    var itemCartContentHTML = `
    <div class="cart-item">
        <img class="cart-item-image" src="${itemImage}">
        <span class="cart-item-name">${itemName}</span>
    </div>
    <span class="cart-item-price">${itemPrice}</span>
    <div class="cart-quantity">
        <input class="cart-quantity-input" type="number" value="1">
    </div>
    <button class="btn btn-x" type="button">X</button>
    `

    cartContent.innerHTML = itemCartContentHTML;
    cartRowsItem.append(cartContent);

    cartContent.getElementsByClassName('btn-x')[0].addEventListener('click', RemoveCartItem);
    cartContent.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', ChangeQuantity);
    UpdateCartTotal();
}

function RemoveCartItem(event) {
    var clicked = event.target;
    clicked.parentElement.remove();
    UpdateCartTotal();
}

function ChangeQuantity(event) {
    var changed = event.target;
    if( isNaN(changed.value) || changed.value <= 0) {
        changed.value = 1;
    }
    UpdateCartTotal();
}

function UpdateCartTotal() {
    var cartRowsItem = document.getElementsByClassName('cart-rows-item')[0];
    var cartRows = cartRowsItem.getElementsByClassName('cart-row');
    var total = 0;
    for( var i = 0; i < cartRows.length; i++ ) {
        var cart = cartRows[i];
        var priceElement = cart.getElementsByClassName('cart-item-price')[0];
        var quantityElement = cart.getElementsByClassName('cart-quantity-input')[0];
        
        var price = parseFloat(priceElement.innerText.replace('$', ''));
        var quantity = quantityElement.value;
        total = total + (price * quantity);
    }
    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('cart-total-price')[0].innerText = '$'+total;
}

// #################################### SUBMIT ####################################

function RecordCartItems() {
    var cartRowsItem = document.getElementsByClassName('cart-rows-item')[0];
    var cartRows = cartRowsItem.getElementsByClassName('cart-row');
    var totalPrice = document.getElementsByClassName('cart-total-price')[0].innerText;

    if( cartRows.length == 0 ) {
        alert("There are no items in the cart");
        return
    }
    
    var params = `total=${totalPrice}&record=`;
    for( var i = 0; i < cartRows.length; i++ ) {
        var cart = cartRows[i];
        var itemName = cart.getElementsByClassName('cart-item-name')[0];
        var quantityElement = cart.getElementsByClassName('cart-quantity-input')[0];
        var quantity = quantityElement.value;

        if( quantity > 1) {
            for( var j = 0; j < quantity; j++ ) {
                params += itemName.innerText + ", ";
            }
        }
        else {
            params += itemName.innerText + ", ";
        }
    }
    params = params.slice(0, params.lastIndexOf(','));

    SendRecordToDatabase(params);
}

function SendRecordToDatabase(params) {
    var xmlhttp = new XMLHttpRequest();
    var url = "/purchased";

    // Setting up for the request.
    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(params);

    // Wait until the server response back.
    xmlhttp.onreadystatechange = function() {
        if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
            var result = xmlhttp.responseText;

            if( result == "Fail" ) {
                alert(result + ": Something went wrong to the get!");
            }
            else {
                alert("Your purchase is now on process!");

                var cartSection = document.getElementsByClassName('cart-section')[0];
                cartSection.innerHTML = "";
            } 
        }
    }
}