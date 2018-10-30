export class ExtraLifeReporter {

	constructor(httpservice, presentation, teamId, endTime) {
		this.httpservice = httpservice;
		this.presentation = presentation;
		this.teamId = teamId;
		this.baseUrl = 'https://www.extra-life.org/api'
		this.endTime = endTime
	}

	startDonationWatch() {
		const url = {url: `${this.baseUrl}/teams/${this.teamId}/donations`};
		this.httpservice.recurringRequest(
			url,
			15,
			async (donationData) => {
				if (!_isNearEndTime(this.endTime, new Date())) {
					const participantRequest = {url: `${this.baseUrl}/participants?where=teamID${encodedEquals}${this.teamId}`};
					const participants = await this.httpservice.request(participantRequest);
					this.presentation.reportNewDonations(donationData, participants);
				}
			}
		);
		const now = new Date();
		const delay = this.endTime - now;
		setTimeout(function() {this.rollCredits();}.bind(this), delay);
	}

	async rollCredits() {
		const participantRequest = {url: `${this.baseUrl}/participants?where=teamID${encodedEquals}${this.teamId}`};
		const participants = await this.httpservice.request(participantRequest);
		const donorRequest = {url: `${this.baseUrl}/teams/${this.teamId}/donations&orderBy=createdDateUTC`};

		const donors = await this.httpservice.request(donorRequest);

		const creditsData = _createCreditsData(participants, donors);

		this.presentation.rollCredits(creditsData);
	}
}

const encodedEquals = '%20%3D%20';

const _createCreditsData = function(participants, donors) {
	const creditsData = {
		eventName: (participants.length> 1 && participants[0].eventName) ? participants[0].eventName : "Extra Life",
		teamName: (participants.length> 1 && participants[0].teamName) ? participants[0].teamName : "Extra Life Team",
		players: participants.map(x => x.displayName),
		donors: [],
		anonymousDonors: 0
	};

	const donorNames = [];
	donors.forEach(donor => {
		if (donor.displayName === 'Anonymous') {
			creditsData.anonymousDonors++;
		} else if (donorNames.indexOf(donor.displayName) === -1) {
			creditsData.donors.push(donor.displayName);
		}
	});

	return creditsData;
}

const _isNearEndTime = function(endTime, time) {
	const fiveMinuteBuffer = 5 * 60 * 1000;
	return (endTime - time) < fiveMinuteBuffer;
}
