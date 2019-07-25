const {google} = require('googleapis');
const mailComposer = require('nodemailer/lib/mail-composer');
	
export class CreateMail{

  	constructor(auth, to, sub, body, task, attachmentSrc){
  		this.me = 'jaiparakh.kota.10@gmail.com';
		this.task = task;
		this.auth = auth;
        this.to = to;
        this.sub = sub;
		this.body = body;
		this.gmail = google.gmail({version: 'v1', auth});
        this.attachment = attachmentSrc;
	}

	makeBody(){
		var arr = [];
		for(var i=0;i<this.attachment.attachment.length;i++){
			arr[i] = {
				path: this.attachment[i],
				encoding: 'base64'
			}
		}

		if(this.attachment.length){
			let mail = new mailComposer({
				to: this.to,
				text: this.body,
				subject: this.sub,
				textEncoding: "base64",
				attachments: arr
			});	
		}
		else{
			let mail = new mailComposer({
				to: this.to,
				text: this.body,
				subject: this.sub,
				textEncoding: "base64"
			});
		}
		
		mail.compile().build((err, msg) => {
			if (err){
				return console.log('Error compiling email ' + error);
			} 
		
			const encodedMessage = Buffer.from(msg)
			  .toString('base64')
			  .replace(/\+/g, '-')
			  .replace(/\//g, '_')
			  .replace(/=+$/, '');
			
			if(this.task === 'mail'){
				this.sendMail(encodedMessage);
			}
			else{
				this.saveDraft(encodedMessage);
			}
		});
	}

    sendMail(encodedMessage){
		this.gmail.users.messages.send({
			userId: this.me,
			resource: {
				raw: encodedMessage,
			}
		}, (err, result) => {
			if(err){
				return console.log('NODEMAILER - The API returned an error: ' + err);
			}
				
			console.log("NODEMAILER - Sending email reply from server:", result.data);
		});
    }

    saveDraft(encodedMessage){
		this.gmail.users.drafts.create({
			'userId': this.me,
			'resource': {
			  'message': {
				'raw': encodedMessage
			  }
			}
		})
    }

    deleteDraft(id){
		this.attachment.gmail.users.drafts.delete({
			id: id,
			userId: this.me 
		});
    }

    listAllDrafts(){
        this.gmail.users.drafts.list({
            userId: this.me
        }, (err, res) => {
        	if(err){
            	console.log(err);
        	}
			else{
				console.log(res.data);
			}
    	});
    }
}

