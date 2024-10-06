const mongoose=require("mongoose");
const initData=require("../init/data.js");
const listing=require("../models/listings.js");
const MONGO_URL="mongodb://127.0.0.1:27017/WanderLust";
main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
};

const initDB= async ()=>{
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>(
        {
            ...obj,owner: "66fe73ef66a8aaf717c4450b",
        }
    ));
    await listing.insertMany(initData.data);
    console.log("data initialized");
}
initDB();