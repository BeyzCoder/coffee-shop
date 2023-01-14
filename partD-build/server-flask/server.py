from datetime import datetime, timezone
from flask import Flask, request, jsonify                                 # Building Web Server
from flask_restful import Api, Resource, reqparse, fields, marshal_with   # Building API
from flask_cors import CORS                                               # Able to send data
from flask_sqlalchemy import SQLAlchemy                                   # Building Database

app = Flask(__name__)
api = Api(app)

# This will create a database on the current work directory
db = SQLAlchemy(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kohiShop.db'

# Product info
class Product(db.Model):
    prod_id = db.Column(db.Integer, primary_key=True)
    drink_name = db.Column(db.String(255), nullable=False)
    price = db.Column(db.String(125), nullable=False)
    pic_src = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"Product(prod_id={self.prod_id}, drink_name={self.drink_name}, price={self.price}, pic_src={self.pic_src})"

# This table is for order set
class Order(db.Model):
    order_id = db.Column(db.Integer, primary_key=True)
    total_price = db.Column(db.String(125), nullable=False)
    timestamp = db.Column(db.String(255), nullable=False)
    cart = db.relationship("Cartorder", backref='purchase', lazy=True)

    def __repr__(self):
        return f"Order(order_id={self.order_id}, total_price={self.total_price}, timestamp={self.timestamp})"

# This table is for items from the order set
class Cartorder(db.Model):
    cart_id = db.Column(db.Integer, primary_key=True)
    prod_order = db.Column(db.Integer, nullable=False)
    ord_id = db.Column(db.Integer, db.ForeignKey('order.order_id'), nullable=False)

    def __repr__(self):
        return f"Cart(prod_order={self.prod_order}, ord_id={self.ord_id})"

# This table tells if there is still an order
class Pending(db.Model):
    pend_id = db.Column(db.Integer, primary_key=True)
    purcha_drink = db.Column(db.String(550), nullable=False)
    total_price = db.Column(db.String(125), nullable=False)

    def __repr__(self):
        return f"Pending(purcha_drink={self.purcha_drink}, total_price={self.total_price})"

# This is for the react front-end, to be able to fetch data
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Will parse the form params
menuParser = reqparse.RequestParser()
menuParser.add_argument("drink", type=str, location="form", help="Missing a drink NAME input", required=True)
menuParser.add_argument("price", type=str, location="form", help="Missing a drink PRICE input", required=True)
menuParser.add_argument("pic_src", type=str, location="form", help="Missing a drink PICTURE input", required=True)

purchaseParser = reqparse.RequestParser()
purchaseParser.add_argument("total_price", type=str, location="form", help="Missing a TOTAL PRICE input", required=True)
purchaseParser.add_argument("purcha_drink", type=str, location="form", help="Missing a PURCHASES input", required=True)

# This will parse the instance of the class Model
product_field = {
    'prod_id'    : fields.Integer,
    'drink_name' : fields.String,
    'price'      : fields.String,
    'pic_src'    : fields.String
}

order_field = {
    'order_id'    : fields.Integer,
    'total_price' : fields.String,
    'timestamp'   : fields.DateTime,
    'cart'        : fields.Integer
}

pending_field = {
    'pend_id'      : fields.Integer,
    'purcha_drink' : fields.String,
    'total_price'  : fields.String
}

class KohiMenuShow(Resource):

    @marshal_with(product_field)
    def get(self):
        products = Product.query.all()
        return products

class KohiMenuInsert(Resource):
    
    @marshal_with(product_field)
    def post(self):
        req_args = menuParser.parse_args()
        product = Product(drink_name=req_args['drink'], price=req_args['price'], pic_src=req_args['pic_src'])
        db.session.add(product)
        db.session.commit()
        return product

class KohiMenuDelete(Resource):

    def post(self):
        req = request.form['drink']
        print(req)
        if( req == '' ): return {"message" : "Missing a drink NAME input"}
        Product.query.filter_by(drink_name=f"{req}").delete()
        db.session.commit()
        return {"message" : "Delete Complete!"}

class KohiPendingShow(Resource):

    def get(self):
        pending = Pending.query.first()
        drink_str = pending.purcha_drink
        drink_list = drink_str.split(',')

        obj = { 
            'purcha_drink' : [],
            'total_price'  : pending.total_price
        }
        for i in drink_list:
            prod = Product.query.filter_by(drink_name=i).first()
            obj['purcha_drink'].append({
                'prod_id'    : prod.prod_id,
                'drink_name' : prod.drink_name,
                'price'      : prod.price,
                'pic_src'    : prod.pic_src
            })

        return obj 

class KohiPurchasePend(Resource):

    @marshal_with(pending_field)
    def post(self):
        req_args = purchaseParser.parse_args()
        pending = Pending(purcha_drink=req_args['purcha_drink'], total_price=req_args['total_price'])
        db.session.add(pending)
        db.session.commit()
        return pending

class KohiPendingDelete(Resource):

    def post(self):
        if( request.form['state'] == "1" ):       # Order Complete
            pending = Pending.query.first()
            drink_str = pending.purcha_drink
            drink_list = drink_str.split(',')

            dateformat = datetime.now(timezone.utc).strftime("%Y-%m-%d %a, %I:%M %p")

            order = Order(total_price=pending.total_price, timestamp=dateformat)
            db.session.add(order)
            db.session.commit()
            order = Order.query.all()[-1]
            for i in drink_list:
                product = Product.query.filter_by(drink_name=i).first()
                cartorder = Cartorder(prod_order=product.prod_id, ord_id=order.order_id)
                db.session.add(cartorder)
                Pending.query.filter_by(pend_id=1).delete()
                db.session.commit()

            return {"message" : "Thank you for ordering to us!"}

        else:                                   # Order Cancel
            Pending.query.filter_by(pend_id=1).delete()
            db.session.commit()
            return {"message" : "Order cancel success!"}

class KohiOrderShow(Resource):

    def get(self):
        orders = Order.query.all()
        obj = { 'Order' : [] }
        for i in orders:
            carts = i.cart
            obj_2 = { 
                'total_price' : i.total_price,
                'timestamp'   : i.timestamp,
                'cart'        : []
            }
            for j in carts:
                product_id = j.prod_order
                prod_info = Product.query.filter_by(prod_id=product_id).first()
                obj_2['cart'].append({
                    'drink_name' : prod_info.drink_name,
                    'price'      : prod_info.price,
                    'pic_src'    : prod_info.pic_src
                })

            obj['Order'].append(obj_2)

        return obj

# This is for Employee
api.add_resource(KohiMenuShow, "/kohimenushow")
api.add_resource(KohiMenuInsert, "/kohimenuinsert")
api.add_resource(KohiMenuDelete, "/kohimenudelete")

# This is for Customer
api.add_resource(KohiPendingShow, "/kohipendingshow")
api.add_resource(KohiPurchasePend, "/kohipurchasepend") 
api.add_resource(KohiPendingDelete, "/kohipendingdelete")

# This is for Employee
api.add_resource(KohiOrderShow, "/kohiordershow")

if __name__ == "__main__":
    app.run(debug=True)