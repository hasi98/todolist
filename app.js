//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-hasith:Test123@cluster0.hh9uwco.mongodb.net/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Item 1"
});

const item2 = new Item ({
  name: "Item 2"
});

const item3 = new Item ({
  name: "Item 3"
});

const defaultsItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// 


app.get("/", function(req, res) {
  Item.find().then((items) => {      
    if (items.length === 0) {
      Item.insertMany(defaultsItems);
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }  
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID).then(function(){
      res.redirect("/");
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}).then(function(foundList){
      res.redirect("/" + listName);
    })
  }

  
});

app.get("/:customeListName", function(req, res) {
 const customeListName = _.capitalize(req.params.customeListName);

List.findOne({name: customeListName}).then(function(foundList){
  if (foundList) {
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    
  } else {
    const list = new List({
      name: customeListName,
      items: defaultsItems
     });
     res.redirect("/" + customeListName);
     list.save();
  }

}); 
 
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started on port 3000");
});
