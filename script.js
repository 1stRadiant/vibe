let headerCount = 1;

function addHeader() {
  const headersContainer = document.getElementById('headers');
  const newRow = document.createElement('div');
  newRow.className = 'header-row';
  newRow.innerHTML = `
    <input type="text" placeholder="Header name" class="header-name">
    <input type="text" placeholder="Header value" class="header-value">
    <button onclick="this.parentElement.remove()" class="add-header">-</button>
  `;
  headersContainer.appendChild(newRow);
  headerCount++;
}

function getHeaders() {
  const headers = {};
  const headerRows = document.querySelectorAll('.header-row');
  
  headerRows.forEach(row => {
    const name = row.querySelector('.header-name').value.trim();
    const value = row.querySelector('.header-value').value.trim();
    if (name && value) {
      headers[name] = value;
    }
  });
  
  return headers;
}

function formatResponse(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return data;
  }
}

async function sendRequest() {
  const method = document.getElementById('method').value;
  const url = document.getElementById('url').value;
  const requestBody = document.getElementById('requestBody').value;
  const statusElement = document.getElementById('status');
  const timeElement = document.getElementById('time');
  const responseElement = document.getElementById('response');

  if (!url) {
    alert('Please enter a URL');
    return;
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders()
    }
  };

  if (method !== 'GET' && requestBody) {
    try {
      options.body = requestBody;
    } catch (e) {
      alert('Invalid JSON in request body');
      return;
    }
  }

  responseElement.textContent = 'Loading...';
  statusElement.textContent = '-';
  timeElement.textContent = '-';

  const startTime = performance.now();

  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    statusElement.textContent = response.status;
    timeElement.textContent = duration;
    responseElement.textContent = formatResponse(data);

  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    statusElement.textContent = 'Error';
    timeElement.textContent = duration;
    responseElement.textContent = error.message;
  }
}