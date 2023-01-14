import React, {useState} from 'react';
import "../App.css";

// Routing.
import { Link } from "react-router-dom";

function Customer() {

    // For storing data
    const [getMenu, setMenu] = useState([]);
    if(getMenu.length < 1) fetch('http://localhost:8080/kohimenushow').then(response => response.json()).then(response => setMenu(response));

    // For updating data
    const [getCart, setCart] = useState([]);

    // To see its price
    const [getPrice, setPrice] = useState(0);

    function addToCart(addItem) {
        setCart([...getCart, {...addItem}]);
        TotalPrice(addItem, 1);
    }

    function removeToCart(eraseItem) {
        setCart(getCart.filter(item => item !== eraseItem));
        TotalPrice(eraseItem, 0) 
        
    }

    function TotalPrice(item, state) {
        var operation;
        if( state === 1 ) {      // Add
            operation = parseFloat(getPrice) + parseFloat(item.price);
            setPrice(operation.toFixed(2));
        } else {                 // Minus
            operation = parseFloat(getPrice) - parseFloat(item.price);
            setPrice(operation.toFixed(2));
        }
    }

    return (
        <div className="Page">
            <h2 className="section-header"> KOHI SHOP: MENU DRINKS </h2>
            <section className="container menu-section">
                <div className="menu-items">
                    {getMenu.map(post => (
                        <div className="menu-item">
                            <span className="item-name">{post.drink_name}</span>
                            <img className="item-image" src={`/images/${post.pic_src}`} alt="picture"></img>
                            <div className="item-detail">
                                <span className="item-price">${post.price}</span>
                                <button className="btn add-item-button" onClick={() => addToCart(post)}>ADD TO CART</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <h2 class="section-header"> SHOPPING CART: </h2>
            <section className="container cart-section">
                <div className="cart-rows-item">
                    <div className="cart-row">
                        {getCart.map(post => (
                            <div className="cart-item">
                                <img className="cart-item-image" src={`/images/${post.pic_src}`} alt="picture"></img>
                                <span className="cart-item-name">{post.drink_name}</span>
                                <span className="cart-item-price">${post.price}</span>
                                <button className="btn del-item-button" onClick={() => removeToCart(post)}>X</button>
                            </div>
                        ))}
                    </div>
                </div>
            
                <div className="cart-total">
                    <span className="cart-total-title">Total: </span>
                    <span className="cart-total-price">${getPrice}</span>
                </div>

            </section><br></br>
            <button className="btn btn-purchase" onClick={ (e) => {
                if(getPrice === 0) {
                    alert("You have no item in cart!");
                }
                else {
                    var params=`total_price=${getPrice}&purcha_drink=`;
                    getCart.forEach(post => {
                        params += post.drink_name+',';
                    });
                    params = params.slice(0, params.lastIndexOf(','));      // To remove the extra comma ','
                    
                    fetch('http://localhost:8080/kohipurchasepend', {method: 'POST', body: params, headers: {'Content-type': 'application/x-www-form-urlencoded'}})
                    .then(response => response.json()) 
                    .then(response => {
                        alert(`Purchase Complete!\npurcha_drink: ${response.purcha_drink}\ntotal price: ${response.total_price}`);
                        setCart([]);
                        setPrice(0);
                    })
                }
            }}> PURCHASE </button><br></br><br></br>
            
            <Link to="/pending"> <button> View Pending </button> </Link>
            <Link to="/"> <button> Home </button> </Link>
        </div>
    )
}

export default Customer