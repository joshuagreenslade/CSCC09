---
**Grade (TA only)**

- max: 100
- score: 95

---

# Assignment 3: Rubric

**Important**: This rubric is a guideline for marking and should not be considered as binding. It means that the course staff reserves the right to:

- modify the rubric after the submission deadline
- assign more or less weight to each rubric elements when it comes to give a score

Complete this rubric by filling the blanks and selecting options using an `x` whenever it is appropriate. Here is an example that you should modify as well:

1. My name is [firstname] Joshua and this rubric is [select one]: 
    - _ missing 
    - _ incomplete for the most part 
    - _ badly filled for several questions
    - _ good but couple of questions were not filled or wrongly filled
    - x perfect 

## Academic integrity declaration

I hereby declared that the work submitted here is mine and its production complies with 

1. the Code of Behaviour on Academic Matters of University of Toronto
1. and the course policy (see website)

[date] February 26, 2017

[signature or initials] J. G.

## Authenticated Users and Multiple Galleries

---
**Grade (TA only)**

- max1: 50
- score1: 50
 
---


1. The API support for supporting users and multiple galleries: [select one]
    - _ is unimplemented 
    - _ is somehow implemented but does not realized its main functionality overall
    - _ does achieve its main functionality overall but several features are missing
    - _ does work well but couple of features are missing or not working properly
    - x does work very well overall and all features are properly implemented

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    your comments go here.
    ```

1. Through the application, users can: [select many]
    - x sign in
    - x sign out
    - x sign up

1. Authentication: [select many]
    - x credentials are sent over using POST requests when signing up
    - x credentials are sent over using POST requests when signing in
    - x passwords are stored as salted hashes
    - x session authentication is implemented and correctly used

1. Authorization policy: [select many]
    - x Non authenticated cannot read any picture nor comment
    - x Non-authenticated can sign-up and sign-in into the application
    - x Authenticated users can sign-out of the application
    - x Authenticated users can browse any gallery
    - x Gallery owners can upload and delete pictures to their own gallery only
    - x Authenticated users can post comments on any picture of any gallery
    - x Authenticated users can delete any one of their own comments but not others
    - x Gallery owners can delete any comment on any picture from their own gallery

In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

**Comments**
```
Everything is working correctly.
```

## Web Security

---
**Grade (TA only)**

- max2: 20
- score2: 20
 
---

1. HTTPS is: [select one]
    - _ not enabled
    - _ enabled but HTTP is not disabled
    - x enabled and HTTP is disabled
    
1. The certificate: [select many]
    - _ is missing
    - _ contains incomplete and/or irrelevant information
    - x contains complete and relevant information

1. User's inputs: [select one]
    - _ none of them are validated nor sanitized
    - _ some inputs are validated and/or sanitized but most of them are not
    - _ most inputs are validated and/or sanitized but couple of them are not
    - x all are validated and sanitized
    
3. Cookies [select many]
    - x the authentication has the `HttpOnly` flag 
    - x all cookies have the `Secure` flag
    - x all cookies have the `SameSite` flag

In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

**Comments**
```
My app makes sure that if a url is entered that it is a valid one.
```

## Frontend Update

---
**Grade (TA only)**

- max3: 10
- score3: 5

    There was a problem uploading photos and getting photos from galleries.
 
---


1. The frontend: [select one]
    - _ is not updated 
    - _ is somehow updated but does not implement most features overall
    - _ is updated but several features are missing
    - _ is updated but couple of features are missing or are not working properly
    - x is updated and all features are properly implemented


    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    your comments go here. 
    ```
 
In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

**Comments**
```
Navigating the galleries works in the same way as navigating the images.
```

## API Documentation

---
**Grade (TA only)**

- max4: 5
- score3: 5
 
---

In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

1. The documentation: [select one]
    - _ is not updated 
    - _ is somehow updated but several details are missing
    - _ is updated but couple of details are missing
    - x is updated and all details are there

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    your comments go here. 
    ```

**Comments**
```
The api is completely updated. In the documentation the possible validation errors are given in one list where any combination of them could be returned depending on the situation.
```

## Code quality and organization

---
**Grade (TA only)**

- max5: 15
- score3: 15
 
---

1. The repository is overall: [select one]
    - _ not following the required structure
    - _ follows the required structure but some files are either misplaced, wrongly named or misspelled
    - x well organized    
    
1. The Javascript code: [select many]
    - x is clean, well organized and indented properly
    - x does not contain any error from JSHint
    - x does not contain any warning from JSHint
    - x does not repeat itself (DRY principle) and is easily maintainable
    
1. When the app executes: [select many]
    - x it does not generate superfluous debugging messages in the console (both in the frontend and the backend)
    - x it does not generate error messages in the console (both in the frontend and the backend)
 
1. Overall, the application code: [select one]
    - _ is poorly implemented
    - _ is fairly well implemented
    - _ is good
    - x is excellent
    - _ is beyond expectations 
    
In the box below, write any comment you would like to communicate the TA regarding the work done for this part: 

**Comments**
```
The only error messages in the console are those that I sent, such as 400, 401, 403, 404, ...
There are also only warnings of image mixed content if the user gives the app the url of an image using http.
```
