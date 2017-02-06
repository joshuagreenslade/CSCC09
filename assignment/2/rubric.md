

---
**Grade (TA only)**

- max: 20
- score:

---

# Assignment 2: Rubric

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

[date] February 6, 2017

[signature or initials] J.G.

## Implementing the Web API 

---
**Grade (TA only)**

- max1: 50
- score1:
 
---


1. The API support for adding images: [select one]
    - _ is unimplemented 
    - _ is somehow implemented but does not realized its main functionality overall
    - _ does achieve its main functionality overall but several features are missing
    - _ does work well but couple of features are missing or not working properly
    - x does work very well overall and all features are properly implemented

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    All features are implemented properly.
    ```
    
1. The API support for retrieving images: [select one]
    - _ is unimplemented 
    - _ is somehow implemented but does not realized its main functionality overall
    - _ does achieve its main functionality overall but several features are missing
    - _ does work well but couple of features are missing or not working properly
    - x does work very well overall and all features are properly implemented

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    All features are implemented properly. 
    ```
    
1. The API support for adding comments: [select one]
    - _ is unimplemented 
    - _ is somehow implemented but does not realized its main functionality overall
    - _ does achieve its main functionality overall but several features are missing
    - _ does work well but couple of features are missing or not working properly
    - x does work very well overall and all features are properly implemented

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    All features are implemented properly. 
    ```
    
1. The API support for retrieving comments: [select one]
    - _ is unimplemented 
    - _ is somehow implemented but does not realized its main functionality overall
    - _ does achieve its main functionality overall but several features are missing
    - _ does work well but couple of features are missing or not working properly
    - x does work very well overall and all features are properly implemented

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    All features are implemented properly.
    ```
    
1. The API support for deleting comments: [select one]
    - _ is unimplemented 
    - _ is somehow implemented but does not realized its main functionality overall
    - _ does achieve its main functionality overall but several features are missing
    - _ does work well but couple of features are missing or not working properly
    - x does work very well overall and all features are properly implemented

    In the box below, write down the features that you were not able to implement or make it work properly:  
    **Comments**
    ```
    All features are implemented properly. 
    ```

1. The API design follows the REST principles: [select many]
    - x all requests do use the appropriate HTTP method 
    - x all URLs do follow the proper collection/element pattern
    - x all requests do have the appropriate body (when required)
    - x all requests do have the appropriate content-type header
    - x all responses do have the appropriate content-type header
    - x all responses do have the appropriate status-code
        
    In the box below, write down the issues with the API:
    **Comments**
    ```
    No issues.
    ```    

1. Data storage: [select one]
    - _ data are not stored at all
    - _ data are stored in memory (global variables)
    - _ data are stored in the database but the database schema does not follow good practices
    - x data is stored in a database and its schema follows good practices
    
1. Data queries: [select one]
    - _ data queries are missing
    - _ data queries are poor and sometimes retrieve the entire collection in memory
    - _ data queries are satisfying but can be significantly improved (for instance multiple queries can be done in one or queries can be done more precise to avoid retrieving unnecessary data)
    - x data queries are good overall
    
1. JSON: [select one]
    - _ JSON is not used at all
    - _ JSON is used but not sometimes not appropriately (JSON is not fully understood)
    - _ JSON is used appropriately but sometimes without the appropriate content-type
    - x JSON is used appropriately with the appropriate content-type
    
1. Uploaded files: [select many]
    - x uploaded files are uploaded using the appropriate content-type
    - x uploaded files are stored along with their metadata
    - x uploaded files are served dynamically using one or several routing methods
    - x uploaded files are served with the correct mime-type

1. Errors: [select one]
    - _ not handled at all
    - _ are sparsely handled
    - _ are correctly handled (the application never crash)
    - x are correctly handled and output the correct status when appropriate

1. The API implementation follows the good practices: [select many]
    - x the API can serve multiple requests simultaneously (for instance it does not rely on global variables that could create race conditions)
    - x the API works independently from the frontent

1. Overall, when using the API: [select one]
    - _ it does not work because several features are not implemented
    - _ it does not work well as a simple usage does not give the expected results or generates errors
    - _ it works relatively well but a heavy usage does not give the expected results or generates errors
    - _ it works really well under all kinds of usages
    - x it works exceptionally well and tolerates bad usages (security aside): bad user inputs, UI stress and so on

In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

**Comments**
```
The api will return an error codes if the user entered an invalid argument. I am fairly certain that I returned the correct error codes.
```

## Integrating the frontend

---
**Grade (TA only)**

- max2: 30
- score2:
 
---


1. The frontend and the backend are well integrated: [select one]
    - _ no, the frontend is not served by Node.js
    - _ the frontend is properly served by Node.js but it is not working with the backend (no API call)
    - x the frontend and the backup are working together

1. The Ajax requests to the API are overall: [select many]
    - x correct with respect to the proposed API implementation
    - x are all strictly asynchronous
    - x are handling errors properly
    
1. The application is a true Single-Page-Application that does not reload nor transfer control to another page: [select one]
    - _ not at all, the application loads different HTML pages
    - _ a light use makes the page to refresh
    - _ a heavy use makes the page to refresh
    - x the application behaves perfectly well with that regard

1. Overall, the quality of the frontend is: [select one]
    - _ poor
    - _ fair
    - _ good
    - x excellent

In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

**Comments**
```
I believe that the api works asynchronously but it was difficult to test.
```

## Documenting the API

---
**Grade (TA only)**

- max3: 20
- score3:
 
---

In the box below, write any comment you would like to communicate the TA regarding the work done for this part:

1. The API documentation matches all routing methods in the code
    - _ overall missing 
    - _ several methods are missing (either in the code or in the documentation)
    - x overall complete

1. Looking at the details of the documentation, we can say that overall: [select many]
    - x all descriptions are accurate
    - x all request methods and URL are correct
    - x all request content-types are correct
    - x all request bodies are detailed
    - x all response status are listed
    - x all response content-types are correct
    - x all response bodies are detailed
    - x all examples are correct

1. Overall, the quality of the documentation is: [select one]
    - _ poor
    - _ fair
    - _ good
    - x excellent

**Comments**
```
I was not sure if I should have had seperate methods for uploading a file and uploading a url file or not, but in the end I decided not to. So in the documentation some of the methods have an option to use a file or a url.
```

## Code quality and organization

---
**Grade (TA only)**

- max3: 40
- score3:
 
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
    - _ is excellent
    - x is beyond expectations 
    
In the box below, write any comment you would like to communicate the TA regarding the work done for this part: 

**Comments**
```
I was not sure if the backend should display the HTTP requests and responses or not so I included them anyways. So the console in the frontend and the backend display error messages that I generated (eg. 400, 404 errors) by doing res.status(4xx).json("...") in app.js
```