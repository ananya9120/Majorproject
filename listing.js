const { ref } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        type:String,
        // default:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fbeach%2520sunset%2F&psig=AOvVaw0RNKuuvgueysNz9TurcGpO&ust=1743515765506000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLD4xsK8tIwDFQAAAAAdAAAAABAE",
        default: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
        set:(v)=> 
            v===""
         ? "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg" //"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fbeach%2520sunset%2F&psig=AOvVaw0RNKuuvgueysNz9TurcGpO&ust=1743515765506000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLD4xsK8tIwDFQAAAAAdAAAAABAE"
         : v,
    },
    price:Number,
    location :String,
    country:String,
    review:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;