# Space
This Workshop was constructed using the official documentation www.digitalocean.com/docs/spaces

## Pricing
The base cost of Spaces is $5/month and gives you the ability to create multiple spaces. 
    - This includes 250GB of data storage (cumulative across all of your spaces).

## Object Storage
- Not stored inside of a typical hierarchical storage system
- Massively Scalable Containers "Buckets"
- Globally unique identifer instead of a file name and path
- The metadata stored is key because metadata can be defined by the user

## Scalability
- Droplet storage fills up quickly, instead of adding block storage that is in set incrememnts and likely more than you need.
- Spaces increases dynamically so you only pay for exactly what you need


## Features
A Spaces subscription gives you the abillity to create multiple Spaces to use as logical units for segmenting content. Each Space will have its own unique URL, All spaces support HTTPS
The Spaces URL naming patterm is `spacename.region.digitaloceanspaces.com` and `region.digitaloceanspaces.com/spacename`, where spacename is the name of your space and region is the region your space is in

## Documentation
If you want to learn more about how to use Spaces or other DigitalOcean services you can find information at www.digitalocean.com
Spaces Docs: www.digitalocean.com/docs/spaces

## Interoperability with S3
The Spaces API is designed to be interoperable with Amazon's AWS S3 API.
In most cases when using a client library, setting the "endpoint" or "base" URL to ${REGION}.digitaloceanspaces.com and generating a spaces key to replace your AWS IAM key will allow you to use Spaces in place of S3

# Create A Person Access Token (Not needed?)
To be able to use the API you will need a personal access toknen.
You can use them to authenticate to the API over Basic Authentication or instead of a for Digital Ocean over HTTPS

NOTE: Keep your tokens a secret. They function like passwords, do not use them in a manner they may get accessed. E.g. hardcoded into a program.

Step 1: Go to the API tab on the DigitalOcean Control Panel
Step 2: You will find yourself in "Applications & API" on the "Tokens/Keys" Section
Step 3: Press "Generate New Token" in the Person Access Tokens Section.
Step 4: Assign a name for your token, along with its scopes:
    Read: lets you list and retrieve information about all resources on the account
    Write: Lets you create, delete and modify all resources on the account
Step 5: Press Generate Token

Now you will have a token generated, that is the long alphanumeric string found underneath the name.
Take note of this token as it will not be shown again.

# Accessing Files On Spaces
## Browser
If we try to access  https://jcs-hackaway.sfo2.digitaloceanspaces.com/ we will get an access denied error, that is if we have our space to restricted.
If we set our file listing to unrestricted you will see some details about the space but not much else,

If we upload a random file such as "hello.md" with the contents being "Hello" You will now see that appear with its metadeta
    - Name
    - Last Modified
    - Owner Details
    - And etc

Now, how do we see the contents of that file? We visit
 https://jcs-hackaway.sfo2.digitaloceanspaces.com/hello.md

 ## Client
 Spaces is built upon the S3 Protocol as opposed to the likes of SFTP.
 We can connect to it using clients such as WinSCP. However, you will need to create a "Space Access Key", this is found in the API section of the Digital Ocean Control Panel.

Step 1: Go to the API tab on the DigitalOcean Control Panel
Step 2: You will find yourself in "Applications & API" on the "Tokens/Keys" Section
Step 3: Press "Generate New Token" in the Space Access Keys
Step 4: Assign a name for your token
Step 5: Record your secret somewhere as it will not be shown again

Now add the details to your client:
 Access Key: Just generated it
 Secret Key: Just generated it
 Endpoint: Copy from your spaces settings: sfo2.digitaloceanspaces.com


### Using the client
On the client we can see all spaces we have access to. On this we are also able to create new spaces as well as upload to them.
- If we create a new space (Folder in top level directory) we can access it like the original space on our control panel
- Alternatively, we can upload files or remove them on demand.

# Creating a basic web application to use Spaces
In this section we will be going over a very basic node application that allows the user to upload a file to a Space

## Modules
In this project there are 4 required modules
  -  Express: Our Web Framework
  -  AWS-SDK: SDK for connecting using S3
  -  Multer: Middleware for uploading files
  -  Multer-s3: Allowing Multer to be used for S3

## Configuring AWS S3
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

