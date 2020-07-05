const dialogflow = require('dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const serviceAccount = require('./credentails.json');
const { WebhookClient } = require('dialogflow-fulfillment');
const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */


// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors())

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/test', (req, res) =>{
	 res.json({msg: 'This is CORS-enabled for all origins!'})
})


app.post('/getBotResponse', async (request, response) =>{
	console.log(request.body)
    const { queryInput,sessionId  } = request.body;
	//const sessionId = uuid.v4();

    const sessionClient = new dialogflow.SessionsClient({ credentials: serviceAccount  });
    const session = sessionClient.sessionPath('titanic-agent-1-puqxqx', sessionId);
    console.log(sessionId)
    const responses = await sessionClient.detectIntent({ session, queryInput});

    const result = responses[0].queryResult;
	
	response.json(result)

})



app.post('/dialogflowWebhook',async (request, response) => {
   const agent = new WebhookClient({ request, response });

    console.log(JSON.stringify(request.body));

    const result = request.body.queryResult;
	console.log(request.body.queryResult)
   
    function welcome(agent) {
      agent.add(`Welcome to my agent!`);
    }
   
    function fallback(agent) {
      agent.add(`Sorry, can you try again?`);
    }
	
	let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('titanic.inputs', getPrediction);
    agent.handleRequest(intentMap);
	
	function getPrediction(agent) { 
    const name = agent.parameters.name,
          age = agent.parameters.age,
          gender = agent.parameters.gender,
          family_size = agent.parameters.family_size,
          ticket_class = agent.parameters.ticket_class,
          ticket_price = agent.parameters.ticket_price,
          embark = agent.parameters.embark;

   console.log(name,age,gender,family_size,ticket_class,ticket_price,embark)
    var title,ag,sex,fare,pclass,fsize,mbark;
    
    if(name.toLowerCase().includes("Mr")) title=0;
    else  if(name.toLowerCase().includes("Mrs")) title=1;
    else  if(name.toLowerCase().includes("Miss")) title=2;
    else  if(name.toLowerCase().includes("Master")) title=3;
    else title=4;
    
    
    if(age<=14) ag=0;
    else if(age>14 && age<=22) ag=1;
    else if(age>22 && age<=36) ag=2;
    else if(age>36 && age<=55) ag=3;
    else ag=4;
    
    sex= gender === 'male'?0:1;
    
    if(ticket_price.toLowerCase().startsWith("l")) fare=0;
    else if(ticket_price.toLowerCase().startsWith("m")) fare=1;
    else if(ticket_price.toLowerCase().startsWith("h")) fare=2;
    else fare=3;
    
    if(ticket_class==='1') pclass=1;
    else if(ticket_price==='2') pclass=2;
    else  pclass=3;
    
    if(family_size===1) fsize=0;
    else if(family_size<=3) fsize=1;
    else fsize=2;
    
    if(embark.toLowerCase().startsWith("s")) mbark=0;
    else if(embark.toLowerCase().startsWith("q")) mbark=1;
    else  mbark=1;
    
    console.log(`data ........`+title+` `+ag+` `+sex+` `+fare+` `+pclass+` `+fsize+` `+mbark);
        return axios.post('https://titanic-project-backend.herokuapp.com/predict',{"data":[title,ag,sex,fare,pclass,fsize,mbark]})
		//return axios.post('https://titanic-project-backend.herokuapp.com/predict',{"data":[0,1,1,0,1,0,0]})
        .then(function (response) {
           console.log(`I ........response`);
           console.log(response.data);
           console.log(`response `,response.data);
          if(response.data==1) 
          {
            agent.add(`According to the ML model, it seems you would survive if you were at titanic on that time.`);
          }
          else agent.add(`According to the ML model, it seems you wouldn't survive if you were at titanic on that time.`);

        })
        .catch(function (error) {
          console.log(error);
           agent.add(`I'm sorry,something went wrong`);
        });
  }

   
});


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`)) 


 

