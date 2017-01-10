/*
Title: Riak Client Connectivity Example with SSL and Authentication
Author: Allan Paul Sy Ortile (aortile@basho.com)
Last Modified: 2017-01-10

Instructions:
1.) Make sure NodeJS is installed correctly. Test using `node --version`.
2.) Make sure changes are done to the following: node list and ports, certificate paths
3.) Run `node riak.js`.

Other Notes:
1.) Before turning on Riak security, make sure that SSL is configured and working. Visit the http port using a browser to see if the endpoint could be reached.
2.) Make sure you follow the Authentication and Authorization guide at http://docs.basho.com/riak/latest/ops/running/authz/
	2.1.) Make sure the user is created and has the necessary permisions
	2.2.) Make sure that the user has correct values in sources (CIDR, username, etc.)
	2.3.) If using certificate, make sure you generated a certificate for the user. The CN must contain the same user to be used in this script. Also if using a user certificate in the sources, replace the Riak server certificate with the user key and cert
3.) If you dont use any CRLs, you might want to set `check_crl = off` in `riak.conf`

Tips:
1.) If it cant find the module, exporting the `node_modules` folder where the Riak NodeJS client library is located
	ie. `export NODE_PATH=/usr/local/lib/node_modules`

Things to do:
1.) Better exception handling.

Disclaimer:
	This script comes with no warranty whatsover.

*/

Riak = require('basho-riak-client');
var riakNodeTemplate = false;
var fs = require('fs');
var assert = require('assert');
var riakClient = null;

// Shutdown function
function client_shutdown() {
	riakClient.stop(function (err, rslt) {
	    // NB: you may wish to check err
	    process.exit();
	});
}

// Riak setting declarations
// Use use protobuff port
// MODIFY THIS PART
var riakNodeList = ['riak1.myserver.com:8087'];

// Initialize the certificates
console.log("Initializing certificates.");
var ca = false, cert = false, key = false;
// If authentication is set to certificate, use the user crt and key (not the riak server)
// MODIFY THIS PART
ca = fs.readFileSync("/home/vagrant/certs/rootCA.crt");
cert = fs.readFileSync("/home/vagrant/certs/riakuser.crt");
key = fs.readFileSync("/home/vagrant/certs/riakuser.key");
user = 'riakuser';

// DO NOT MODIFY ANYTHING BEYOND THIS POINT
var riakAuth = {
		ca: ca.toString(),
		cert: cert.toString(),
		key: key.toString(),
		user: user };


console.log("Initializing riakNodeTemplate.");
riakNodeTemplate = new Riak.Node.Builder()
	.withAuth(riakAuth);

console.log("Initializing riakNodes.");
var riakNodes = Riak.Node.buildNodes(riakNodeList, riakNodeTemplate);

console.log("Building the riakCluster.");
var riakCluster = new Riak.Cluster.Builder()
	.withRiakNodes(riakNodes)
	.withQueueCommands()
	.build();

console.log("Initializing new riakClient.");
var riakClient = new Riak.Client(riakCluster, function (err, c) {
	riakClient.ping(function (err, rslt) {
			if (err) {
					throw new Error(err);
			} else {
					// On success, ping returns true
					assert(rslt === true);
					console.log("Ok.");
			}
			client_shutdown();
	});
});