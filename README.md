# WorldOfWarcraft_PullAnalyzer
Node app to process Warcraft Logs submissions for raid bosses. 

The program currently has a simple feature set. Given either a specific guild or a specific [Warcraft Logs](https://www.warcraftlogs.com) user, it will download a list of all their boss encounters and determine a few key details.
* When was the encounter first attempted?
* When was it first successfully defeated?
* How many times has it been attempted?
* How much time was between the first attempt and first success?

It outputs this data to the console.

Other planned additions include:
* Roster information
* Better timing
* Only include "current expansion" data
* Limit results to specific fights

Simple invocation for a guild:
`node main.js --guild --guild_name 'NAME' --guild_server 'SERVER' --guild_region 'REGION'`

Simple invocation for a user
`node main.js --user --user_name 'WCL_USERNAME'`

To work the program needs a [Warcraft Logs API key](https://www.warcraftlogs.com/api/docs) stored in a file called 'secrets.json' with the format
`{"keys":{"api_key":"KEY"}}`

To avoid unecessary calls to the Warcraft Logs api the program caches responses in the db.json file that it creates. To force the program to fetch all the data again delete the db.json file that it creates and re-run it.