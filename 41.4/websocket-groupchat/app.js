/** app for groupchat */

const express = require("express");
const morgan = require("morgan");
const expressError = require("./express-error");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

// serve stuff in static/ folder

app.use(express.static("static"));

/** Handle websocket chat */

// allow for app.ws routes for websocket routes
const wsExpress = require("express-ws")(app);
const ChatUser = require("./ChatUser");

/** Handle a persistent connection to /chat/[roomName]
 *
 * Note that this is only called *once* per client --- not every time
 * a particular websocket chat is sent.
 *
 * `ws` becomes the socket for the client; it is specific to that visitor.
 * The `ws.send` method is how we'll send messages back to that socket.
 */

app.ws("/chat/:roomName", function (ws, req, next) {
	try {
		const user = new ChatUser(
			ws.send.bind(ws), // fn to call to message this user
			req.params.roomName // name of room for user
		);

		// register handlers for message-received, connection-closed

		ws.on("message", function (data) {
			try {
				user.handleMessage(data);
			} catch (err) {
				console.error(err);
			}
		});

		ws.on("close", function () {
			try {
				user.handleClose();
			} catch (err) {
				console.error(err);
			}
		});
	} catch (err) {
		console.error(err);
	}
});

/** serve homepage --- just static HTML
 *
 * Allow any roomName to come after homepage --- client JS will find the
 * roomname in the URL.
 *
 * */

app.get("/:roomName", function (req, res, next) {
	res.sendFile(`${__dirname}/chat.html`);
});

app.use((req, res, next) => {
	const e = new expressError("page not found", 404);
	return next(e);
});

app.use((e, req, res, next) => {
	let status = e.status || 500;
	let msg = e.msg || e;
	res.status(status).json({
		error: {
			msg,
			status,
		},
	});
});

module.exports = app;
