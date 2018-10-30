export class HttpGetRequestService {
	async request(requestParameters, successHandler) {

		const headers = (requestParameters.hasOwnProperty('headers')) ? await _createHeaders(requestParameters.headers) : {};
		const requestDefinition = {method: 'GET', headers: headers};

		const response = await _sendRequest(requestParameters.url, requestDefinition);

		return response.body
	}

	async recurringRequest(requestParameters, frequencySeconds, successHandler) {
		if (
			typeof requestParameters !== 'object' ||
			!requestParameters.hasOwnProperty('url')
		) {
			return false;
		}
		const headers = (requestParameters.hasOwnProperty('headers')) ? await _createHeaders(requestParameters.headers) : {};
		const requestDefinition = {method: 'GET', headers: headers};

		const response = await _sendRequest(requestParameters.url, requestDefinition);

		if (response.code === 200) {
			if (!requestParameters.hasOwnProperty('headers')) {
				requestParameters.headers = {};
			}
			requestParameters.headers['If-none-match'] = await response.headers.get('etag');
			successHandler(response.body);
		}

		const delay = frequencySeconds * 1000;

		setTimeout(
			function() {this.recurringRequest(requestParameters, frequencySeconds, successHandler);}.bind(this),
			delay,
			successHandler
		);
	}
}

const _createHeaders = async function(headerJson) {
	const headers = new Headers();
	for (let property in headerJson) {
		headers.append(property, headerJson[property]);
	}
	return headers;
}

const _sendRequest = async function(url, requestDefinition) {

	const response = await fetch(url, requestDefinition);
	const json = (response.status === 200) ? await response.json() : {};
	const responseData = {code: response.status, body: json, headers: response.headers};

	return responseData;
}
