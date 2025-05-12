const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");                           //joi add validation for individuals
const Review=require("./models/review.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("hi,i'm root");
});

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
     if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
     if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//  index route
app.get("/listings",wrapAsync( async (req,res)=>{
      const allListings=await Listing.find({});
      res.render("listings/index.ejs",{allListings});
    }));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("review");+
    res.render("listings/show.ejs",{listing});  
}));

//create route
app.post("/listings",validateListing,wrapAsync( async(req,res,next)=>{
    let result=listingSchema.validate(req.body);
    console.log(result);
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
        const newListing=new Listing(req.body.listing);
        if(result.error){
            throw new ExpressError(400,result.error);
        }
        // if(!newListing.title){
        //     throw new ExpressError(400,"Title is missing");
        // }
        // if(!newListing.description){
        //     throw new ExpressError(400,"description is missing");
        // }
        // if(!newListing.location){
        //     throw new ExpressError(400,"location is missing");
        // }
        await newListing.save();                               //by using wrapasync we don't need to write try n catch
        res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(404,"Page not found");
    // }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//reviews
//post route
app.post(
    "/listings/:id/reviews",
    validateReview,
    wrapAsync(async(req,res)=>{
     let listing= await Listing.findById(req.params.id);
     let newReview=new Review(req.body.review);
     
     listing.review.push(newReview);
     await newReview.save();
     await listing.save();

     res.redirect(`/listings/${listing._id}`);
})
);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong!!"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);  //middleware
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});