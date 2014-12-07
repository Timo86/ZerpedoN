// store list of presentations which include what is the title and its current slide
// the list is loaded from config file under config/index.js
var presentations = {};
var listPresentation = [];

var demo = function(req, res) {
	// demo-presentation is the name of our presentation, also this
	// will be the filename or our presentation view
	res.render('demo-presentation', { title: 'Demo Presentation' });
}

// This is route for remote control page, we will not touch this
var controllerRoute = function(req, res){
  res.render('controller', { title: 'Remote Presentation Controller', layout: "controller_layout" })
};



exports.setupRemotePresenter = function(app, io){

	var presentation = function(newId, newTitle, control){
			this.id = newId;  // id for each presentation, currently same as the url
			this.title = newTitle;
			this.control = control;
			this.indexh = 0;  // initial slide horizontal index
			this.indexv = 0;  // initial slide veritical index
	};	

	//presentations = config.presentations; // load initial presentation list from config file

	// Set url for our demo presentation page
	app.get('/', function(req, res) {
		// demo-presentation is the name of our presentation, also this
		// will be the filename or our presentation view
		res.render('newPresentation', { title: 'Demo Presentation', layout: "controller_layout"});
	});

	//app.get('/demo-presentation', demo);

	app.get('/controller', controllerRoute);
	
	// setup remote control here
	// socket.io setup
	io.sockets.on('connection', function (socket) {

		socket.on('request_newPresentation', function(data) {	
			app.get('/'+data.id+'/'+data.title, function(req, res) {
				//on recupere la presentation avec data.presentationtype
				console.log('requestNewPres    ID = '+data.id+' title = '+data.title);
				// demo-presentation is the name of our presentation, also this
				// will be the filename or our presentation view
				//res.render('demo-presentation', { title: data.title });
				res.render(data.title, { title: data.title });
			});	

			var newPresentation = new presentation();
			newPresentation.id = data.id;
			newPresentation.title = data.title;
			newPresentation.control = data.control;

			listPresentation[data.id] = newPresentation;
				
			console.log('Request create Presentation'+listPresentation[data.id].id+' '+ JSON.stringify(listPresentation[data.id]) );
			socket.emit('newPresentation_create');
			
		});
		
		// once connected need to broadcast the cur slide data
		 socket.on('request_presentation', function(data){
		 	console.log('Request Presentation '+data.id+'       sending init presentation data ' + JSON.stringify(listPresentation[data.id]) );
		 		 			 	
		 	if(listPresentation[data.id]){
		 		console.log('Request Pres       sending init presentation data ' + JSON.stringify(listPresentation[data.id]) );
		 		socket.emit('initdata', listPresentation[data.id]);
		 	}
		 });
		
		
		// send commands to make slide go previous/ next/etc
		// this should be triggered from the remote controller
		socket.on('command', function(command) {
			
			console.log("receive command "+ JSON.stringify(command) );
			// TODO: future might need a way to tell how many slides there are
			var pptId = command.id;  // powerpoint id
			var cmd = command.txt;   // command can be 'up', 'down', 'left', 'right'
			if(listPresentation[pptId])
			{
				var curppt = listPresentation[pptId];
				// update ppt information
				if(cmd == 'up')
				{
					curppt.indexv--;
				}
				else if(cmd == 'down')
				{
					curppt.indexv++;
				}
				else if(cmd == 'left')
				{
					curppt.indexh--;
				}
				else if(cmd == 'right')
				{
					curppt.indexh++;
				}
				
				if(curppt.indexh < 0 ){
					curppt.indexh = 0;
					socket.emit('update_controller',{'id' : pptId, 'up' : true, 'down' : true,'left' : false, 'right' : true});
				}
					
					
				if(curppt.indexv < 0 ){
					curppt.indexh = 0;
					socket.emit('update_controller',{'id' : pptId, 'up' : false, 'down' : true,'left' : true, 'right' : true});
				}
					
				
				listPresentation[pptId] = curppt;
				
				// send the new data for update
				socket.broadcast.emit('updatedata', curppt);
			}
			
		});
		
	});	

	
};