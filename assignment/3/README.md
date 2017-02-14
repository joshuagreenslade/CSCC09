
---

# Assignment 2: API Documentation

## The Web Gallery API

### Create

- description: create a new image
- request: `POST /api/images/`
    - content-type: `multipart/form-data`
    - body: FormData
      - picture: 
        - (file) the image file, or
        - (string) the image url
      - title: (string) the image's title
      - author: (string) the image's author
- response: 200
    - content-type: `application/json`
    - body: _id: (string) the id of the newly created image

``` 
$ curl -X POST 
       -H "Content-Type: multipart/form-data" 
       -F 'picture=https://images.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png'
       -F 'title=Google'
       -F 'author=Me'
       http://localhost:3000/api/images/
```


### Create

- description: create a new comment for image with imageId
- request: `POST /api/images/:imageId/comments/`
    - content-type: `application/json`
    - body: Object
      - author: (string) the comment's author
      - message: (string) the comment's message
      - date: (string) the date the comment was created
- response: 200
    - content-type: `application/json`
    - body: _id: (string) the id of the newly created comment

``` 
$ curl -X POST 
       -H "Content-Type: application/json" 
       -d '{"author":"Me", "message":"Hello World", "date":"2/5/2017"}'
       http://localhost:3000/api/images/9DzkjQWvNvSHx3K8/comments/
```


### Read

- description: retrieve the image data for the image with the given id
- request: `GET /api/images/:id/`
- response: 200
    - content-type: `application/json`
    - body: Object
      - _id: (string) the image id
      - picture: 
        - (object) the image file's metadata if the image was given aa a file, or
        - (string) the image's url if the image was given as a url
      - title: (string) the image's title
      - author: (string) the image's author
      - left: (string) the id of the image to the left
      - right: (string) the id of the image to the right
- response: 404
    - body: Image with id id no longer exist
 
``` 
$ curl http://localhost:3000/api/images/9DzkjQWvNvSHx3K8/
``` 


### Read

- description: retrieve the url for the picture whose id was provided
- request: `GET /api/images/:id/picture`   
- response: 200
    - content-type: `application/json`
    - body: (string) the url for the picture
- response: 404
    - body: Image id does not exist
 
``` 
$ curl http://localhost:3000/api/images/9DzkjQWvNvSHx3K8/picture/
``` 
  

### Read

- description: retrieve the comments for the image with 'imageId', starting at 'firstComment' where the comments are sorted as specified until limit is reached. The default for limit is 10 and the default for sort is decreasing.
- request: `GET /api/:imageId/comments/:firstComment/[?limit=10&sort=decreasing]`  
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
    - body: Invalid arguments. Limit must be a number and 'limit' is not
- response: 400
    - body: Invalid arguments. Sort must be a decreasing or increasing and 'sort' is not
 
``` 
$ curl 'http://localhost:3000/api/images/9DzkjQWvNvSHx3K8/comments/last/?limit=1&sort=decreasing'
``` 

  
### Delete
  
- description: delete the image with the given id
- request: `DELETE /api/images/:id/`
- response: 200
    - content-type: `application/json`
    - body: (string) the id of the next image
- response: 404
    - body: Image 'id' does not exists

``` 
$ curl -X DELETE
       http://localhost:3000/api/images/9DzkjQWvNvSHx3K8/
``` 


### Delete
  
- description: delete the comment with the given id
- request: `DELETE /api/comments/:id/`
- response: 200
    - content-type: `application/json`
    - body: (int) the id of the comment deleted
- response: 404
    - body: Comment id does not exists

``` 
$ curl -X DELETE
       http://localhost:3000/api/comments/cgAscdvYN5hapwRP/
``` 
