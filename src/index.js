"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var irc_1 = require("irc");
var express_1 = __importDefault(require("express"));
var process = __importStar(require("process"));
var flixChannel = "#flix";
var ircServer = process.env.IRC_SERVER || "irc.r";
var app = express_1.default();
var port = 300;
var ircClient = new irc_1.Client(ircServer, "bruellwuerfel", {
    channels: [flixChannel]
});
app.post("/", function (req, res) {
    var message = req.body;
    ircClient.send(flixChannel, message);
});
