const {google} = require('googleapis');
var base64 = require('js-base64').Base64;
const parse = require('node-html-parser').parse;
const cheerio = require('cheerio');
var open = require('open');
var Mailparser = require('mailparser').MailParser;

class Check{

    constructor(auth){
        this.me = 'jaiparakh.kota.10@gmail.com';
        this.gmail = google.gmail({version: 'v1', auth});
        this.auth = auth;
    }

    checkInbox(){
        this.gmail.users.messages.list({
            userId: this.me
        }, (err, res) => {
            if(!err){
                console.log(res.data);
            }
            else{
                console.log(err);
            }
        })
    }

    checkForMediumMails(){
        var query = "from:noreply@medium.com is:unread";
        this.gmail.users.messages.list({
            userId: this.me,
            q: query 
        }, (err, res) => {
            if(!err){
                var mails = res.data.messages;
                mails.forEach(m => {
                    this.getMail(m.id);
                })
            }
            else{
                console.log(err);
            }
        });        
    }

    getMail(msgId){
        this.gmail.users.messages.get({
            'userId': this.me,
            'id': msgId
        }, (err, res) => {
            if(!err){
                var body = res.data.payload.parts[0].body.data;
                var htmlBody = base64.decode(body.replace(/-/g, '+').replace(/_/g, '/'));
                var mailparser = new Mailparser();

                mailparser.on("end", (err,res) => {
                    console.log(res);
                })

                mailparser.on('data', (dat) => {
                    if(dat.type === 'text'){
                        const $ = cheerio.load(dat.textAsHtml);
                        var links = [];
                        var modLinks = [];
                        $('a').each(function(i, elem) {
                            links[i] = $(this).attr('href');
                        });

                        var pat = /------[0-9]-[0-9][0-9]/;
                        var k =0;
                        
                        modLinks = links.filter(li => {
                            if(li.match(pat) !== null){
                                return true;
                            }
                            else{
                                return false;
                            }
                        });
                        console.log(modLinks);
                        this.openAllLinks(modLinks);
                    }
                })

                mailparser.write(htmlBody);
                mailparser.end();
                //console.log(htmlBody);
                //var out = parse(htmlBody);
                //console.log(out.querySelectorAll('a'));
                /*const $ = cheerio.load(htmlBody);
                var links = [];
 
                $('a').each(function(i, elem) {
                links[i] = $(this).attr('href');
                });
                console.log(links);*/
                //this.openAllLinks(links.slice(0,links.length-7));
            }
        });
    }

    openAllLinks(arr){
        arr.forEach(e => {
            open(e); 
        });
    }

}

module.exports = Check;
