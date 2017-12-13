const nodemailer = require('nodemailer');
const base64ToS3 = require('nodemailer-base64-to-s3');

const smtpConfig = {
	host: 'smtp.gswcm.net',
	port: 25,
	logger: require('bunyan').createLogger({
		name: 'Mailer',
		streams: [
			{
				type: 'rotating-file',
				level: 'info',
				path: 'backend/logs/mailer.log',
				period: '1d', // daily rotation
				count: 7 // keep 3 back copies
			},
			{
				stream: process.stderr,
				level: 'warn'
			}
		]
	}),
	secure: false,
	ignoreTLS: true,
	connectionTimeout: 2000
};

const defaultMailingOptions = {
	from: 'JMT Mailing Robot <noreply@jmt.gswcm.net>',
	replyTo: 'noreply@jmt.gswcm.net'
};

const smtpTransport = nodemailer.createTransport(smtpConfig, defaultMailingOptions);
const base64ToS3_options = {
	aws: {
		accessKeyId: process.env.S3_KEY,
		secretAccessKey: process.env.S3_SECRET,
		params: {
			Bucket: 'jmt.gswcm.net'
		}
	}
};
smtpTransport.use('compile', base64ToS3(base64ToS3_options));

module.exports = smtpTransport;
