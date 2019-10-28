export class StreamPresentation {
	constructor(baseUri, teamId, httpService) {
		this.trackedCount = -1;
	}

	reportNewDonations(donations, participants) {
		if (this.trackedCount === -1) {
			this.trackedCount = donations.length;
			return;
		}
		const newSum = participants.reduce((sum, participant) => sum + participant.sumDonations, 0);
		const formatter = Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits:2});
		const donationsToShow = donations.slice(0, donations.length-this.trackedCount);
		this.trackedCount = donations.length;
		const messages = ['New Donation!'];
		donationsToShow.forEach((donation) => {
			const displayName = (donation.displayName) ? _removeLastName(donation.displayName) : 'Anonymous';
			messages.push(displayName);
			messages.push(`Amount: ${donation.amount === null ? 'Anonymous' : formatter.format(donation.amount)}`);
		});

		messages.push(`New Total: ${formatter.format(newSum)}`);
		messages.push('Thank you!');
		const reportElement = document.getElementById('extraLifeOverlay');
		reportElement.innerHTML = `<div id='donation' class="donationDisplay animated"></div>`;
		const donationElement = document.getElementById('donation');

		_showMessage(donationElement, messages);
	}

	rollCredits(creditsData) {
		const creditRows = [];

		creditRows.push(`<div class="creditsTitle">${creditsData.eventName}</div>`);

		creditRows.push(`<div class="creditsSectionTitle">${creditsData.teamName}</div>`);
		creditsData.players.forEach((player) => creditRows.push(`<div class="creditsEntry">${player}</div>`));

		creditRows.push('<div class="creditsSectionTitle">Donors</div>');
		creditsData.donors = _removeLastNames(creditsData.donors);
		creditsData.donors.forEach((donor) => creditRows.push(`<div class="creditsEntry">${donor}</div>`));

		const reportElement = document.getElementById('extraLifeOverlay');

		creditRows.push(`<div class="creditsEntry">... And ${creditsData.anonymousDonors} others who wish to remain anonymous!</div>`);

		const credits = creditRows.join('');
		const creditMarquee = `<div class="creditMarquee">${credits}</div>`;

		reportElement.innerHTML = creditMarquee;

		setTimeout(
			function() {
				reportElement.innerHTML = "";
			},
			29 * 1000
		);
	}
}

const _showMessage = function(donationElement, messages) {
	donationElement.innerText = messages[0];
	donationElement.classList.remove('slideOutRight');
	donationElement.classList.add('slideInLeft');
	setTimeout(() => _clearMessage(donationElement, messages.slice(1)), 4000);
}

const _clearMessage = function(donationElement, messages) {
	donationElement.classList.remove('slideInLeft');
	donationElement.classList.add('slideOutRight');
	if (messages.length > 0) {
		setTimeout(() => _showMessage(donationElement, messages), 500);
	} else {
		const reportElement = document.getElementById('extraLifeOverlay');
		reportElement.innerHTML = '';
	}
}

const _removeLastNames = function(names) {
	return names.map(name => _removeLastName(name));
}

const _removeLastName = function(name) {
	const parts = name.trim().split(' ');
	if (parts.length === 1) {
		return name;
	} else {
		const lastNameFirstLetter = parts[parts.length-1][0];
		const keeping = (lastNameFirstLetter.toLowerCase() === lastNameFirstLetter) ? parts : parts.slice(0, -1);
		return keeping.join(' ');
	}
}