#!/bin/bash

docker network create mongoRS

docker run -d -p 27017:27017 --name mongo --network mongoRS mongo:8.0 mongod --replSet mongoRS --bind_ip localhost,mongo

docker exec -it mongo mongosh --eval "rs.initiate({
 _id: \"mongoRS\",
 members: [
   {_id: 0, host: \"mongo\"}
 ]
})"