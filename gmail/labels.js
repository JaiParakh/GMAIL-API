const {google} = require('googleapis');
var fs = require('fs');

class Labels{

    constructor(auth){
        this.auth = auth;
        this.me = 'jaiparakh.kota.10@gmail.com';
        this.labels = [];
        this.gmail = google.gmail({version: 'v1', auth}); 
    }

    listLabels(){
        this.gmail.users.labels.list({
            userId: this.me
        }, (err, res) => {
            if(err){
                return console.log('The Api returned an Error '+ err);
            }

            const labels = res.data.labels;

            if(labels.length){
                console.log('Labels:');
                labels.forEach((label) => {
                    console.log(`${label.name}`);
                    console.log(label.messagesUnread);
                    var la = {
                        id: label.id,
                        name: label.name
                    }
                    this.labels.push(la);
                });
            }
            else{
                console.log('No Labels Found.');
            }

            var json = JSON.stringify({labels: this.labels});

            fs.writeFile("./gmail/labels.json", json, (err) => {
                if (err){
                    console.log(err);
                }
                console.log('complete');
            });
            //console.log(this.labels);
        });
    }

    addToLabel(name, sender){
        var msgIds = [];
        let folders = JSON.parse(fs.readFileSync('./gmail/labels.json'));
        var name_id = folders.labels.find(la => la.name === name).id;
        var query = `from:${sender} is:unread`;
        console.log(query);
        this.gmail.users.messages.list({
            userId: this.me,
            q: query 
        }, (err, res) => {
            if(!err){
                var k = 0;
                var mails = res.data.messages;
                mails.forEach(m => {
                    msgIds[k] = m.id;
                    k++;
                });
                console.log(msgIds);
                console.log(name_id);
                this.gmail.users.messages.batchModify({
                    userId: this.me,
                    ids: msgIds,
                    addLabelIds: ['Label_32']
                }, (err, res) => {
                    if(!err){
                        console.log(res);
                        console.log('-----------');
                    }
                    else{
                        console.log(err);
                    }
                });
            }
        });
    }

    listAllMailsInLabel(name){
        
        let folders = JSON.parse(fs.readFileSync('./gmail/labels.json'));
        var id = folders.labels.find(la => la.name === name).id;

        var result = this.gmail.users.messages.list({
            userId: this.me,
            labelIds: [id] 
        });
        if(result.length){
            console.log(`Mails in ${name}`);
            result.forEach((res) => {
                console.log(res);
            });
        }
        else{
            console.log("Folder Is Empty");
        }
    }

}

module.exports = Labels;