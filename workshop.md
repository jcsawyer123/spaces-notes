# Spaces
This workshop was constructed based on the official documentation at www.digitalocean.com/docs/spscaes

# Part One - Intro
<!-- 
    START OF SLIDE INTRODUCTION
 -->
## Slide One - Object Storage Provided by Digital Ocean
- Spaces is an object storage service provided by Digital Ocean
_next slide_

## Slide Two - What is Object Sotorage
- Many of you are probably wondering, _what is object storage_
- Unlike traditional storage methods such as _block storage_ object storage does not use a hierarchical approach. 
- Instead we directly access an object using the unique identifer as opposed to a file name and path
_next slide_

## Slide Three - Buckets
- In Object Stoage, each object is stored with all the data instead of being split up. 
- The object is also stored with its metadata plus any extended metadata you wish to add to it
- This is useful as you can provide extra information to the file to help process the data (or do anything with it)

## Slide Four - Store and Serve Large Volumes of Data
- Using spaces allows you to send and serve large volumes of data
- Data Transfer is expensive. IF you are running a large application and need to serve data clients it can get expensive quickly.
- 
- You can now serve data to clients easily and quickly
- You can also store any data that you get
- For example, if you were running an image storage site you can take their images and store them and then serve them back quickly.

- there is also the Spaces Content Delivery Network or CDN which is avaliable at no cost. 

## Slide Five - Scalability
- Storage on a VPS (A digital ocean droplet) fills up quickly, this is due to the space restraints on them.
- You could add block storage for 1$ per 10GB (At Digital Ocean)
  - 100GB 10$/m
  - 500GB 50$/m
- However, Spaces is far better in terms of scalability. You only pay for exactly what you use and it will scale automatically.

## Slide Six - Following along
  - If you want to follow along with the rest of this workshop/talk you can sign up/login to digital ocean at www.digitalocean.com

## Slide Seven - Control Panel
- When you are logged in you should see a control panel like so. This is where we will begin.

<!-- 
    START OF DEMONSTRATION
 -->

# Part Two - Demonstration

## Creating a spcae
- Navigate to the Spaces tab
- Press "Create a space"
- Select a region (not super important, more region to come)
- File Listing (Does not matter for now, we will go over this)
- Give it a nice new unique name

## Accessing through browser
- Under the name of the space you will see the link to your space
  - format : `spacename.region.digitaloceanspaces.com`
  - Alternatively version: `region.digitaloceanspaces.com/spacename`
- If you selecetd "Restriced File Listing" you will get an _access denied_ error
- Lets go to settings and change that to enable file listing
- Now if we go back to the address you will see we are allowed access
- You should notice that it returns an XML output
  - Name of Space
  - Prefix
  - Marker
  - ...
- Lets upload a file to see what happens to the output
- Now there is a new <contents> section
- Inside you will see our new object/file with all of its details
- To access the contents of the file we can go to:
  - `spacename.region.digitaloceanspaces.com/file.ext`
  
## Accessing from client
- We can also access the content of the Space by using a client. In this example I am going to use WinSCP
- Spaces it built upon the S3 protocol as opposed to the likes of something suck as SFTP.
- To access our space we will need to create a "Space Access Key", we create this the API 

Step 1: Go to the API tab on the DigitalOcean Control Panel
Step 2: You will find yourself in "Applications & API" on the "Tokens/Keys" Section
Step 3: Press "Generate New Token" in the Space Access Keys
Step 4: Assign a name for your token
Step 5: Record your secret somewhere as it will not be shown again

NOTE: You will want to keep not of your secret key as you will not be shown it again

Now add the details to your client:
 Access Key: Just generated it
 Secret Key 2: Just generated it
 Endpoint: Copy from your spaces settings: sfo2.digitaloceanspaces.com

 ### Using the client
On the client we can see all spaces we have access to. On this we are also able to create new spaces as well as upload to them.
- If we create a new space (Folder in top level directory) we can access it like the original space on our control panel
- Alternatively, we can upload files or remove them on demand.

## Creating a basic web application
- Due to time limitations I went ahead and created this little express application to demonstrate how you would go about using this in an application.
- In many languages there are packages available for you to use. You can use a package that connects to S3 as long as you change the endpoint to spaces.

### Modules
In this project there are 4 required modules
  -  Express: Our Web Framework
  -  AWS-SDK: SDK for connecting using S3
  -  Multer: Middleware for uploading files
  -  Multer-s3: Allowing Multer to be used for S3

### Configuring AWS S3
Since Spaces is built upon S3 we need to connect using AWS S3 architechture. However just like when using a client we must change/specify a few details
    - Endpoint: 
    - Access Key
    - Secret Key

```js
const spaceEndpoint = new aws.Endpoint(config.endpoint);
var s3 = new aws.S3({
    endpoint: spaceEndpoint,
    accessKeyId: config.accessKey,
    secretAccessKey: config.secret,
    region: config.region
});
```

Alternative way of creating an S3 Object/Instance
```js
aws.config.update({
    endpoint: spaceEndpoint,
    accessKeyId: accessKey,
    secretAccessKey: secret,
    region: region
});
var s3 = new aws.S3();
```

## Configuring Multer
Here we create a function that when called takes a file (or files) and uploads them to our spaces. One of the parameters of the object we create is the S3 object we defined in the AWS section.

s3: The s3 object we created earlier
bucket: The bucket we want to access
acl: Access Control, we set to public-read so we can access it from the web

.array("upload", 1) : Uploads the array of files of length one. This could be replaces with ".single("upload"). 
"upload" just specified the field in this case we are just using "upload" to keep it simple..

```js
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucket,
        acl: "public-read",
        key: function (req, file, cb) {
            console.log(file);
            // cb(null, Date.now().toString())
            cb(null, file.originalname)
        }
    })
}).array("upload", 1);
```