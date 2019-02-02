const express = require("express")
const aws = require("aws-sdk")
const multer = require('multer')
const multerS3 = require('multer-s3')
 
const app = express();

// Resources Used:
// https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
// https://www.npmjs.com/package/multer-s3

// Getting Config Values
const config = require("./config.json")
var bucket = config.bucketName;

// Configuring AWS  
const spaceEndpoint = new aws.Endpoint(config.endpoint);
var s3 = new aws.S3({
    endpoint: spaceEndpoint,
    accessKeyId: config.accessKey,
    secretAccessKey: config.secret,
    region: config.region
});
    
// Configuring Multer
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucket,
        acl: "public-read",
        metadata: function(req, file, cb) {
            cb(null, {fieldName: file.fieldname})
        },
        key: function (req, file, cb) {
            console.log(file);
            // cb(null, Date.now().toString())
            cb(null, file.originalname)
        }
    })
}).array("upload", 1);

/*--------------------------
Express Setup and Routes
--------------------------*/

// Use public directory for views
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
});
app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/public/success.html")
})
app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/public/error.html")
})

app.post("/upload", (req, res)   => {
    upload(req, res, (err) => {
        if(err) {
            console.log(err)
            return res.redirect("/error")
        } else {
            console.log("Uploaded File");
            return res.redirect("/success")
        }
    });
});

//"Error Handling"
app.use((req, res) => {
    res.status(404).send("Error 404, Page not found")
})

// Setting port and starting listening
port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Started on: " + port)
})