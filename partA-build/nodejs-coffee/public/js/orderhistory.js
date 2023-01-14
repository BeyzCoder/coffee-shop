if( document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', PrintOutItemToOrder);
} else {
    PrintOutItemToOrder();
}

// #################################### ORDER ####################################
function PrintOutItemToOrder() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/order-history";

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
                var orderItems = document.getElementsByClassName('order-section')[0];
                orderItems.innerHTML = "";
                orderItems.innerText = "There are no orders yet";
            }
            else {
                var obj = JSON.parse(xmlhttp.responseText);
                var orders = obj.Orders
                var ordersItems = document.getElementsByClassName('orders-items')[0];

                for( var i = 0; i < orders.length; i++ ) {
                    var order = orders[i];

                    var orderProducts = order.Products;
                    var orderItems = document.createElement('div');
                    orderItems.classList.add('order-items');

                    var closeTag = `</div>`;
                    orderItems.innerHTML = closeTag;
                    ordersItems.append(orderItems);

                    var orderItemsClassTag = document.getElementsByClassName('order-items')[i];
                    
                    for( var j = 0; j < orderProducts.length; j++ ) {
                        var product = orderProducts[j];

                        var itemContent = document.createElement('div');
                        itemContent.classList.add('order-item')

                        var itemContentHTML =`
                                <span class="item-name">${product.drink_name}</span>
                                <img class="order-image" src="images/${product.pic_src}">
                                <span class="item-price">$${product.price}</span>
                            </div><br><br>
                        `;

                        itemContent.innerHTML = itemContentHTML;
                        orderItemsClassTag.append(itemContent);
                    }

                    var orderDetail = document.createElement('div');
                    orderDetail.classList.add('order-detail');

                    var itemContentHTML2 = `
                        <span class="order-timestamp">${order.timestamp}</span><br>
                        <span class="order-total-title">Total: </span>
                        <span class="order-total-price">${order.total_price}</span><br><br>
                    </div>
                    `
                    
                    orderDetail.innerHTML = itemContentHTML2;
                    orderItemsClassTag.append(orderDetail);
                }
            }
        }
    }
}