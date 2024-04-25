const http = require("http");
const fs = require("fs");
const path = require("path");
const {MongoClient} = require("mongodb");

const PORT = 5205;

const getMedicinesData = async(client) => {
 const cursor = client.db("MedicineDB").collection("Medicines").find({});
 const results = await cursor.toArray();
 console.log(JSON.stringify(results));
 return results;
}

http.createServer(async (req,res)=>{
    console.log(req.url);
    if(req.url === "/api"){
        const uri = "mongodb+srv://patel:dhvani@cluster0.9qmlsfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        const client = new MongoClient(uri);
        try{
            // Connect to the MongoDB cluster
            await client.connect();
            console.log(" Database Connection happened here!");
            const medicinesData = await getMedicinesData(client);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200,{"content-type": "application/json"});
            res.end(JSON.stringify(medicinesData));
        }
        catch(e){
            console.log("Error connecting in database");
        }
        finally{
            await client.close();
            console.log(" Database Connection closed here!")
        }
       
    }
    else{
        console.log(req.url);
        let contentType;
        let fileTrack = path.join(__dirname,"public",req.url==="/"? "index.html": req.url);
        let fileExpansion = path.extname(fileTrack);
        switch(fileExpansion){
            case ".html":
                contentType = "text/html";
                break;
            case ".css":
                contentType = "text/css";
                break;
            case ".js":
                contentType = "text/javascript";
                break;
            default:
                contentType = "text/plain";
        }
        fs.readFile(fileTrack,(err,data)=>{
            if(err){
                if(err.code === "ENOENT"){
                    res.writeHead(200,{"content-type":"text/plain"});
                    res.end(" 404 Page Not Found!");
                }
                else{
                    res.writeHead(500, { "content-type": "text/plain" });
                    res.end("Internal Server Error");
                }
            }
            else{
                console.log("Content type : ",contentType);
                res.writeHead(200,{"content-type":contentType});
                res.end(data);
            }
        })
    }
}).listen(PORT,()=>console.log(`Server is running on ${PORT}`));
