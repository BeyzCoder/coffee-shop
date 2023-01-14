import React, {useState, useEffect} from 'react';
import "../App.css";

// Routing.
import {Link} from "react-router-dom";

function Pending() {

    const [getValid, setValid] = useState(false);
    const [getCheck, setCheck] = useState(false);

    // For storing data.
    const [getPend, setPend] = useState([]);
    const [getTotalPrice, setTotalPrice] = useState('');
    if(getPend.length == 0) {
        fetch('http://localhost:8080/kohipendingshow')
        .then(response => response.json())
        .then(response => {
            if( response ) {
                setPend(response.purcha_drink);
                setTotalPrice(response.total_price);

                setValid(true);
                setCheck(true);
                setTimer(getTimer + 1);
            } 
        });
    }

    // Timer
    const [getTimer, setTimer] = useState(0);

    useEffect(() => {
        if( getTimer !== 60 && getCheck ) {
            setTimeout(() => setTimer(getTimer + 0), 500)
        } 
        if( getTimer === 30 ) {
            setValid(false);
            alert("You cant anymore cancel your order");
            setTimeout(() => setTimer(getTimer + 1), 500)
        } 
        if( getTimer === 60) {
            alert("Your order is ready to pick up");

            fetch('http://localhost:8080/kohipendingdelete', {method: 'POST', body: "state=1", headers: {'Content-type': 'application/x-www-form-urlencoded'}})
            .then(response => response.json())
            .then(response => {
                alert(response.message);

                setValid(false);
                setCheck(false);
                setPend([]);
                setTotalPrice('');
            });
        }
    }, [getTimer]);

    return (
        <div className="Page">
            <h2 className="section-header">KOHI SHOP: PENDING ORDER</h2>

            {!getCheck && <p>No pending orders</p>}

            <section className="container pending-order-section">
                {getCheck && <p>Please do not leave the webpage</p>}
                <div className="pend-items">
                    {getPend.map(post => (
                        <div className="pend-item">
                            <span className="pend-name">{post.drink_name}</span>
                            <img className="pend-image" src={`/images/${post.pic_src}`} alt="picture"></img>
                            <span className="pend-price">${post.price}</span>
                        </div> 
                    ))}
                </div><br></br>

                <div className="pend-detail">
                    <span className="pend-total-title">Total: </span>
                    <span className="pend-total-price">${getTotalPrice}</span>
                </div>

                {getValid && <button className="btn cancel-pend-button" onClick={() => {
                    fetch('http://localhost:8080/kohipendingdelete', {method: 'POST', body: "state=0", headers: {'Content-type': 'application/x-www-form-urlencoded'}})
                    .then(response => response.json())
                    .then(response => {
                        alert(response.message);

                        setValid(false);
                        setCheck(false);
                        setPend([]);
                        setTotalPrice('');
                    });
                }}> CANCEL ORDER </button>}
            </section><br></br>
            
            {getCheck && <progress max="60" value={getTimer}></progress>}<br></br><br></br>
            
            <Link to="/"> <button> Home </button> </Link>
        </div>
    )
}

export default Pending;