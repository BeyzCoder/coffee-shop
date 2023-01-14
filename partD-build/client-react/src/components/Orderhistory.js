import React, {useState} from 'react';
import '../App.css';

// Routing.
import {Link} from "react-router-dom";

function Orderhistory() {

    // If there are data in the database
    const [getValid, setValid] = useState(false);

    // For storing the data
    const [getOrder, setOrder] = useState([]);
    if( getOrder.length === 0 ) {
        fetch('http://localhost:8080/kohiordershow')
        .then(response => response.json())
        .then(response => response.Order)
        .then(response => {
            setOrder(response);
            setValid(true);
        })
    }

    return (
        <div className="Page">
            <h2 class="section-header"> KOHI SHOP: ORDER HISTORY </h2>

            {!getValid && <p>There are no orders or can't connnect to database</p>}

            <section className="container order-section">
                <div className="orders-items">
                    {getOrder.map(post => (
                        <div className="order-items">
                            {post.cart.map(prod => (
                                <div className="order-item">
                                    <span className="item-name">{prod.drink_name}</span>
                                    <img className="order-image" src={`/images/${prod.pic_src}`} alt="picture"></img>
                                    <span className="item-price">${prod.price}</span>
                                </div>
                            ))}
                            <div className="order-detail">
                                <span className="order-timestamp">{post.timestamp}</span><br></br>
                                <span class="order-total-title">Total: </span>
                                <span className="order-total-price">${post.total_price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section><br></br>

            <Link to="/"> <button> Home </button> </Link>
        </div>
        
    )
}

export default Orderhistory;