'use strict';

const Promise = require('bluebird');
const conf = require('../../configurations/conf');
const request = require('request');
const a = 97;
const z = 122;
const NUM_OF_ENGLISH_LETTERS = z-a +1;

module.exports = {
    crackPassword: function(req, res){
        const slaves = conf.slaves;
        const chunk =  Math.floor(NUM_OF_ENGLISH_LETTERS / slaves.length);


        let chunkCounter = -1;
        res.json({numOfSlaves: slaves.length});

        return Promise.map(slaves, (slave)=>{
            return new Promise( (resolve, reject) => {
                request({
                    timeout: 1200000,
                    method: 'POST',
                     uri:     `${slave.domain}/crack/${a+chunkCounter + 1}/${a+chunk + chunkCounter}`,
                    body: {
                        text: req.query.text,
                        keySize: req.query.keySize,
                        answerUrl: `http://master:${process.env.PORT}/onSlaveFinished`
                    },
                    json: true
                }, function(error, response, body){
                    if( error) {
                        reject(error);
                        return;
                    }

                    resolve(body);
                });

                chunkCounter += chunk ;
            })
        }).catch(err=>{
            console.error(err);
        });
    }
};