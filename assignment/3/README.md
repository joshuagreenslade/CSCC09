
---

# Assignment 2: API Documentation

## The Web Gallery API

### Create

- description: sign in the user
- request: `POST /api/signin/`
  - content-type: `application/json`
  - body: Object
    - username: (string) the user's username
    - password: (string) the user's password
- response: 200
  - content-type: `application/json`
  - body: Object
    - username: (string) the user's username
    - salt: (string) the string that will be added to the end of the user's password for extra strength
    - saltedHash: (string) the string that the user's password + the salt hashes to
    - left: (string) the username of the user added before the current one
    - right: (string) the username of the user added after the current one
- response: 400
  - body: "Invalid username, must only contain numbers or letters"
- response: 400
  - body: "Invalid password, must only contain numbers or letters"
- response: 401
  - body: "Unauthorized"
- response: 500
  - body: Database error

```
$ curl -X POST 
       -H "Content-Type: application/json" 
       -d '{"username":"Alice", "password":"pass4admin"}''
       https://localhost:3000/api/signin/
```


### Create

- description: create a new user
- request: `POST /api/users/`
  - content-type: `application/json`
  - body: Object
    - username: (string) the user's username
    - password: (string) the user's password
- response: 200
  - content-type: `application/json`
  - body: Object
    - username: (string) the user's username
    - salt: (string) the string that will be added to the end of the user's password for extra strength
    - saltedHash: (string) the string that the user's password + the salt hashes to
    - left: (string) the username of the user added before the current one
    - right: (string) the username of the user added after the current one
- response: 400
  - body: "Invalid username, must only contain numbers or letters"
- response: 400
  - body: "Invalid password, must only contain numbers or letters"
- response: 409
  - body: "Username 'username' already exists"
- response: 500
  - body: Database error

```
$ curl -X POST 
       -H "Content-Type: application/json" 
       -d '{"username":"Alice", "password":"pass4admin"}'
       https://localhost:3000/api/user/
```


### Create

- description: create a new image for the given gallery
- request: `POST /api/galleries/:gallery/images/`
  - content-type: `multipart/form-data`
  - body: FormData
    - picture: 
      - (file) the image file, or
      - (string) the image url
    - title: (string) the image's title
- response: 200
  - content-type: `application/json`
  - body: _id: (string) the id of the newly created image
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid title, must not be empty"
- response: 400
  - body: "Invalid url"
- response: 401
  - body: "Forbidden"
- response: 500
  - body: Database error

``` 
$ curl -X POST 
       -H "Content-Type: multipart/form-data" 
       -F 'picture=http://images.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png'
       -F 'title=Google'
       https://localhost:3000/api/galleries/alice/images/
```


### Create

- description: create a new comment for image with imageId in the given gallery
- request: `POST /api/galleries/:gallery/images/:imageId/comments/`
  - content-type: `application/json`
  - body: Object
    - message: (string) the comment's message
    - date: (string) the date the comment was created
- response: 200
  - content-type: `application/json`
  - body: _id: (string) the id of the newly created comment
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid image id, must only contain numbers or letters"
- response: 400
  - body: "Invalid message, must not be empty"
- response: 400
  - body: "Invalid date"
- response: 401
  - body: "Forbidden"
- response: 404
  - body: "Image with id 'imageId' does not exist in gallery 'gallery'"
- response: 500
  - body: Database error

``` 
$ curl -X POST 
       -H "Content-Type: application/json" 
       -d '{"message":"Hello World", "date":"2/5/2017"}'
       https://localhost:3000/api/galleries/alice/images/9DzkjQWvNvSHx3K8/comments/
```


### Read

- description: get the current user's gallery
- request: `GET /api/galleries/currentGallery/`
- response: 200
  - body: Object
    - username: (string) the user's username
    - salt: (string) the string that will be added to the end of the user's password for extra strength
    - saltedHash: (string) the string that the user's password + the salt hashes to
    - left: (string) the username of the user added before the current one
    - right: (string) the username of the user added after the current one
- response: 200
  - body: null
- response: 500
  - body: Database error

```
$ curl https://localhost:3000/api/galleries/currentGallery/
```


### Read

- description: get the given gallery
- request: `GET /api/galleries/:gallery/`
- response: 200
  - body: Object
    - username: (string) the user's username
    - salt: (string) the string that will be added to the end of the user's password for extra strength
    - saltedHash: (string) the string that the user's password + the salt hashes to
    - left: (string) the username of the user added before the current one
    - right: (string) the username of the user added after the current one
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 401
  - body: "Forbidden"
- response: 404
  - body: "Gallery 'gallery' does not exist"
- response: 500
  - body: Database error

```
$ curl https://localhost:3000/api/galleries/alice/
```


### Read

- description: sign the user out
- request: `GET /api/signout/`
- response: 200
  - content-type: `application/json`
  - body: "signed out"
- response: 500
  - body: Database error

```
$ curl https://localhost:3000/api/signout/
```


### Read

- description: retrieve the image data for the image with the given id in the given gallery
- request: `GET /api/galleries/:gallery/images/:id/`
- response: 200
  - content-type: `application/json`
  - body: Object
    - _id: (string) the image id
    - picture: 
      - (object) the image file's metadata if the image was given as a file, or
      - (string) the image's url if the image was given as a url
    - title: (string) the image's title
    - author: (string) the image's author
    - left: (string) the id of the image to the left
    - right: (string) the id of the image to the right
- response: 200
  - body: null
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid imageid, must only contain numbers or letters"
- response: 401
  - body: "Forbidden"
- response: 404
  - body: "Image with id 'id' does not exist in gallery 'gallery'"
- response: 500
  - body: Database error
 
``` 
$ curl https://localhost:3000/api/galleries/alice/images/9DzkjQWvNvSHx3K8/
``` 


### Read

- description: retrieve the url for the picture with the given id in the given gallery
- request: `GET /api/galleries/:gallery/images/:id/picture/`   
- response: 200
  - content-type: `mimetype`
  - body: (string) the url for the picture
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid image id, must only contain numbers or letters"
- response: 401
  - body: "Forbidden"
- response: 404
  - body: "Image with id 'id' does not exist in gallery 'gallery'"
- response: 500
  - body: Database error
 
``` 
$ curl https://localhost:3000/api/galleries/alice/images/9DzkjQWvNvSHx3K8/picture/
``` 
  

### Read

- description: retrieve the comments for the image in the given gallery, starting at the given comment where the comments are sorted as specified until limit is reached. The default for limit is 10 and the default for sort is decreasing.
- request: `GET /api/galleries/:gallery/images/:imageId/comments/:firstComment/[?limit=10&sort=decreasing]`  
- response: 200
  - content-type: `application/json`
  - body: list of objects
    - _id: (string) the id of the comment
    - image_id: (string) the id of the image that the comment was added to
    - author: (string) the author of the comment
    - message: (string) the comment's message
    - date: (string) the date the comment was added
    - older_comment: (string) the id of the comment added before this one
    - newer_comment: (string) the id of the comment added after this one
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid image id, must only contain numbers or letters"
- response: 400
  - body: "Invalid comment id, must only contain numbers or letters"
- response: 400
  - body: "Invalid arguments. Limit must be a number and 'limit' is not"
- response: 400
  - body: "Invalid arguments. Sort must be a decreasing or increasing and 'sort' is not"
- response: 401
  - body: "Forbidden"
- response: 500
  - body: Database error
 
``` 
$ curl https://localhost:3000/api/galleries/alice/images/9DzkjQWvNvSHx3K8/comments/last/?limit=1&sort=decreasing
``` 

  
### Delete
  
- description: delete the image with the given id and its comments from the given gallery
- request: `DELETE /api/galleries/:gallery/images/:id/`
- response: 200
  - content-type: `application/json`
  - body: (string) the id of the next image
- response: 200
  - body: null
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid image id, must only contain numbers or letters"
- response: 401
  - body:"Forbidden"
- response: 404
  - body: "Image 'id' does not exists"
- response: 500
  - body: Database error

``` 
$ curl -X DELETE
       https://localhost:3000/api/galleries/alice/images/9DzkjQWvNvSHx3K8/
``` 


### Delete
  
- description: delete the comment with the given id from the given image in the given gallery
- request: `DELETE /api/galleries/:gallery/images/:imageId/comments/:id/`
- response: 200
  - content-type: `application/json`
  - body: (string) the id of the comment deleted
- response: 400
  - body: "Invalid gallery name, must only contain numbers or letters"
- response: 400
  - body: "Invalid image id, must only contain numbers or letters"
- response: 400
  - body: "Invalid comment id, must only contain numebrs or letters"
- response: 401
  - body: "Forbidden"
- response: 404
  - body: "Comment with id 'id' does not exists with image 'image' in gallery 'gallery'"
- response: 500
  - body: Database error

``` 
$ curl -X DELETE
       https://localhost:3000/api/galleries/alice/imageId/9DzkjQWvNvSHx3K8/comments/cgAscdvYN5hapwRP/
``` 
