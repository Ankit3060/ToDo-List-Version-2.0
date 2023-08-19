const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");


const app = express();

//This is for using body-parser 
app.use(bodyParser.urlencoded({extended:true}));

//to use CSS and JS
app.use(express.static("public"));

// Connecting mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', {useNewUrlParser:true , useUnifiedTopology: true});

// Creating Schema
const ItemsSchema = new mongoose.Schema({
    name :String
})

// Creating model to use Schema
const Item = mongoose.model("Item",ItemsSchema);

// Creating deault data
const item1 = new Item({
    name:"Welcome to todo-List"
});

const item2 = new Item({
    name:"Click on + button to add new list"
});

const item3 = new Item({
    name:"Mark the check box after completion of task"
});

const defaultItems = [item1, item2, item3]


const listSchema = new mongoose.Schema({
    name: String,
    items : [ItemsSchema]
});

// Creating model to use Schema
const List = mongoose.model("List",listSchema);



//connecting embeded java script EJS
app.set('view engine', 'ejs');


// this is main function for the home route
app.get("/",function(req,res)
{
    // let day = date.getDate; 
    Item.find({})
    .then((db)=>{
        if(db.length===0){
            Item.insertMany(defaultItems)
            .then(()=>{
            console.log("Successfully saved");
            })
            .catch(()=>{
            console/log(err.message)
            });
            res.redirect("/")
        } else{
            res.render("list",{listTitle : "Today" , newListItems : db});
        }
        
    })
});


// this is post function of all the route 
app.post("/",function(req,res)
{
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name:itemName
    })

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName})
        .then(foundList=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }
});


app.post("/delete",(req,res)=>{
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId)
    .then(()=>{
        console.log("Successfully deleted the checked item")
    })
    .catch(()=>{
        console.log(err.meassage);
    });
    res.redirect("/");
    } else{
        List.findOneAndUpdate({name:listName},{$pull : {items:{_id:checkedItemId}}})
        .then(foundList=>{
                res.redirect("/"+listName)
            
        })
    }
});



app.get("/:customListName",(req,res)=>{
    const customListName =_.capitalize(req.params.customListName);
    List.findOne({ name: customListName })
    .then(foundList => {
        if (!foundList) {
            const list = new List({
                name : customListName,
                items : defaultItems
            });
            list.save();
            res.redirect("/"+customListName)
        } else {
            res.render("list",{listTitle : foundList.name , newListItems : foundList.items})
        }
    })
    .catch(err => {
        console.error(err);
    });

    
});


// This is about route 
app.get("/about",function(req,res)
{
    res.render("about");
});


// Connecting to server 
app.listen(3000, function()
{
    console.log("Server has started");
});