Hey!

About the project -

The server was built in master slave architecture in order to handle large key sizes.

Requests for cracking passwords are made by http calls while updating the ui with results is made by web sockets. 

The score function for each combination is calculated by the following elements -
1. Check if every word of the combination is legal - there are several substring that can’t be found in English, only letters and punctuation marks, specific first, last and second last letter.
2. Comparing letters frequencies between the combination and the English letters distribution and taking in account minimum number spaces to construct real words. 

How to start -

1. Create docker network:    docker network create ranet 
2. From master folder - build the image:
   cd master    docker build -t ran/bog-master1 . 
3. From slave folder :
   cd slave    docker build -t ran/bog-slave . 
4. List all images:     docker images  
5. Start master(in seperate terminal):    docker run -p 3000:3000  --name master --net ranet -i -t  <image-id-master> 
6. Start slaves(in seperate terminal):     docker run -p 4001:4000 --name slave1 --net ranet -i -t  <image-id-slave>    docker run -p 4002:4000 --name slave2 --net ranet -i -t  <image-id-slave>    docker run -p 4003:4000 --name slave3 --net ranet -i -t  <image-id-slave>    docker run -p 4004:4000 --name slave4 —net ranet -i -t  <image-id-slave> 
7. From the browser, navigate to localhost:3000

8.In case you need to re-run don’t forget docker rm /<master/slave1/../slave4> and follow steps 1-7)

Ran.