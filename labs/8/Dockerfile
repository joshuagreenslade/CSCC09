# base image
FROM node

# create the application directory
RUN mkdir -p /home/nodejs/app
# copy the application
COPY ./app /home/nodejs/app
# move to working directory
WORKDIR /home/nodejs/app
# install all npm modules
RUN npm install --production
# run the nodejs application
CMD node app.js