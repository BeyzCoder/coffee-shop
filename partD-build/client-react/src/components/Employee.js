import React, {useState} from 'react';
import "../App.css";

// Routing.
import {Link} from "react-router-dom";

function Employee() {

    // For storing data
    const [getMenu, setMenu] = useState([]);
    if(getMenu.length < 1) fetch('http://localhost:8080/kohimenushow').then(response => response.json()).then(response => setMenu(response));

    // For inserting variable state
    const [getDrinkI, setDrinkI] = useState('');
    const [getPriceI, setPriceI] = useState('');
    const [getPicSrcI, setPicSrcI] = useState('');

    // For deleting variable state
    const [getDrinkD, setDrinkD] = useState('');

    return (
        <div className="Page">
            <h2 class="section-header"> KOHI SHOP: EMPLOYEE PAGE </h2>

            <section className="container list-section">
                <div className="list-items">
                    {getMenu.map(post => (
                        <div className="item">
                            <span className="item-name">{post.drink_name}</span>
                            <img className="item-image" src={`/images/${post.pic_src}`} alt="picture"></img>
                            <span className="item-price">${post.price}</span>
                        </div>
                    ))}
                </div>
            </section>
            
            <section className="container edit-section">
                <p> Insert: </p>
                <label for="item_in">Name of the drink: </label>
                <input type="text" placeholder="drink" value={getDrinkI} onChange={e => setDrinkI(e.target.value)} /><br></br><br></br>
                <label for="price_in">Price of the drink: </label>
                <input type="text" placeholder="price" value={getPriceI} onChange={e => setPriceI(e.target.value)} /><br></br><br></br>
                <label for="picture_in">Picture name: </label>
                <input type="text" placeholder="picture ex .png" value={getPicSrcI} onChange={e => setPicSrcI(e.target.value)} /><br></br><br></br>
            
                <button onClick={ (e) => {
                    var params = "";
                    if(getDrinkI !== '') params += `drink=${getDrinkI}&`;
                    if(getPriceI !== '') params += `price=${getPriceI}&`;
                    if(getPicSrcI !== '') params += `pic_src=${getPicSrcI}&`; 

                    fetch('http://localhost:8080/kohimenuinsert', {method: 'POST', body: params, headers: {'Content-type': 'application/x-www-form-urlencoded'}})
                    .then(response => response.json())
                    .then(response => {
                        if(response.message) {
                            if(response.message.drink) alert(response.message.drink);
                            if(response.message.price) alert(response.message.price);
                            if(response.message.price) alert(response.message.pic_src);
                        } else {
                            alert(`Insert Complete!\nprod_id: ${response.prod_id}\ndrink_name: ${response.drink_name}\nprice: ${response.price}\npic_src: ${response.pic_src}`);
                            window.location.reload();
                        }
                    });
                }}> Submit </button>

                <p> Delete: </p>
                <label for="item_de">Name of the item: </label>
                <input type="text" placeholder="drink" value={getDrinkD} onChange={e => setDrinkD(e.target.value)} /><br></br><br></br>

                <button onClick={ (e) => {

                    fetch('http://localhost:8080/kohimenudelete', {method: 'POST', body: `drink=${getDrinkD}`, headers: {'Content-type': 'application/x-www-form-urlencoded'}})
                    .then(response => response.json())
                    .then(response => {
                        alert(response.message);
                        window.location.reload();
                    });
                }}> Submit </button><br></br><br></br>
            </section>

            <Link to="/orderhistory"> <button> View Order History </button> </Link>
            <Link to="/"> <button> Home </button> </Link>
        </div>
    )
}

export default Employee;