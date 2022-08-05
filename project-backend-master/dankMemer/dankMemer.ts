// MAIN FILE FOR DANKMEMER BOT
import { logout, setUp} from "./setup";
import { startTrackingChannels } from "./trackChannel";

//get authentification token from setUp
const authDetails = setUp();

//Find channels to track
setInterval(() => startTrackingChannels(authDetails.token, authDetails.authUserId), 100);

process.on('SIGINT', function() {
	//logout and send shutdown message on ctrl c
	logout(authDetails.token);
	console.log('Dank memer shutting down ✌');
	process.exit();
});