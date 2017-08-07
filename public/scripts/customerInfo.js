let id_customer = getUrlParameter('id_customer');
let _id = getUrlParameter('_id');
let address = getUrlParameter('address');

function getToken(id) {
  let url = location.protocol + '//' + location.hostname + '/api/ogust/tests/token/' + id;
  return $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
  });
}

function getOgustToken(rawToken) {
  const token = rawToken.data.token;
  let url = location.protocol + '//' + location.hostname + '/api/ogust/token';
  return $.ajax({
    type: 'GET',
    url: url,
    headers: {
      'x-access-token': token
    },
    dataType: 'json',
  });
}

function getCustomerInfo(rawOgustToken) {
  const ogustToken = rawOgustToken.data.token;
  let url = location.protocol + '//' + location.hostname + '/api/ogust/customers/' + id_customer + '/moreInfo';
  return $.ajax({
    type: 'GET',
    url: url,
    headers: {
      'x-ogust-token': ogustToken
    },
    dataType: 'json'
  });
}

function editCustomerInfo(rawOgustToken) {
  const ogustToken = rawOgustToken.data.token;
  const infoTitles = {
    pathology: 'NIVEAU',
    comments: 'COMMNIV',
    interventionDetails: 'DETAILEVE',
    misc: 'AUTRESCOMM'
  };
  let data = {};
  data.arrayValues = {};
  for (const k in infoTitles) {
    data.arrayValues[infoTitles[k]] = $('#' + k).val();
  }
  // const encodedAddress = encodeURIComponent(JSON.stringify(address));
  let url = location.protocol + '//' + location.hostname + '/api/ogust/customers/' + id_customer + '/moreInfo?address=' + address;
  return $.ajax({
    type: 'PUT',
    url: url,
    data: JSON.stringify(data),
    headers: {
      'x-ogust-token': ogustToken
    },
    dataType: 'json',
    contentType: 'application/json'
  });
}

function fillForm(rawData) {
  const data = rawData.data.info.thirdPartyInformations.array_values;
  const correspTable = {
    NIVEAU: 'pathology',
    COMMNIV: 'comments',
    DETAILEVE: 'interventionDetails',
    AUTRESCOMM: 'misc'
  };
  for (const k in data) {
    let select = '#' + correspTable[k];
    if (k === 'NIVEAU') {
      $(select).val(data[k]);
    }
    $(select).append(data[k]);
  }
}
