let kue = require('kue');
var mqtt = require('mqtt')

var client  = mqtt.connect('mqtt://mosquitto.likepoint.io')
 
//subscribe topic withdrawThai
client.on('connect', function () {
  client.subscribe('withdrawThai', function (err) {
    if (!err) {
  
    }
  })
})
 
 //เมื่อมี message เข้ามา
client.on('message', function (topic, message) {
  // message is Buffer
  console.log('topic' + topic.toString());
  //check topic == withdrawThai
  if(message.toString() == 'withdrawThai'){

	let queue = kue.createQueue();
	//job enqueue
	queue.on('job enqueue', function() {
		console.log('Job Submitted in the Queue.');
		// process.exit(0);
	});
	//create job to redis
	let job = queue.create('transferBank', {
		withdrawThai: 'withdrawThai'
	}).priority('high').attempts(5).save();
	// .backoff({delay: 60*1000})
	// .save();
  }
})