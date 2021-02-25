const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const alert = require("alert");

mongoose.connect("mongodb://localhost:27017/bankDB",{useNewUrlParser:true, useUnifiedTopology:true});

const customerSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  balance: Number,
  accno: Number,
  ifsc:Number,
  transfer: [String],
});

const customerTable = mongoose.model("customer",customerSchema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  res.render("list");
});

app.get("/about",function(req,res) {
  res.render("about");
});

app.get("/contact",function(req,res) {
  res.render("contact");
});

app.get("/customers",function(req,res) {

  customerTable.find({}, function(err, customers) {
      if(err){
        console.log(err);
      }
      else {
        res.render("customers", {cus: customers});
        }
    });
});

app.get("/view/:id",function(req,res) {
  customerTable.find({}, function(err, customers) {
    if(err){
      console.log(err);
    }
    else {
      res.render("view", {num: req.params.id, users: customers});
    }
  });
});

app.get("/transaction/:Name",function(req,res) {
  customerTable.find({},function(err, customers) {
    if(err){
      console.log(err);
    }
    else {
      res.render("transaction", {name:req.params.Name, bankers:customers});
    }
  });
});

app.get("/succes/:name",function(req,res) {

  const amount = req.body.money;
  const senderName = req.params.name;
  const recName = req.body.receipient;
  res.render("succes");
});


app.post("/succes/:name",function(req,res){
    const amount = req.body.money;
    const senderName = req.params.name;
    const recName = req.body.receipient;

    var today = new Date();

    const from = "Received " + amount + "Rs from " + senderName + " on " + today.toLocaleString();
    const to = "Sent " + amount + "Rs to " + recName + " on " + today.toLocaleString();

    customerTable.findOne({name: senderName},function(err,value) {
      if(err){
        console.log(err);
      }
      else {
        value.transfer.push(to);
        value.save();
        console.log(value.transfer);

        customerTable.findOneAndUpdate({name: senderName}, {balance : value.balance - amount }, {useFindAndModify: false} ,function(err) {
          if (err) {
            console.log(err);
          }
          else {
            customerTable.findOne({name: recName},function(err,receiver) {
              if (err) {
                console.log(err);
              }
              else {
                receiver.transfer.push(from);
                receiver.save();
                var x = receiver.balance;
                const bal = +x + +amount;
            customerTable.findOneAndUpdate({name: recName}, {balance : bal}, {useFindAndModify: false} ,function(err) {
              if (err) {
                console.log(err);
              }
              else {
                      res.redirect("/succes/:senderName");
                  }

              });
            }
            });

          }

        });
      }
    });

});

app.get("/transferhistory/:history",function(req,res) {
const tName = req.params.history;
customerTable.findOne({name: tName},function(err,customer) {
  if (err) {
    console.log(err);
  }
  else{

      console.log("Length of transaction array is " + customer.transfer.length);

        console.log(customer.transfer);
        res.render("transferhistory",{objAr:customer.transfer});
  }

});
});


app.listen(3000,function(){
  console.log("Server started at port 3000.");
})
