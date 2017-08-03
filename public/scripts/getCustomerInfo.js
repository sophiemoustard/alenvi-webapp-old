let id_customer = getUrlParameter('id_customer');
let _id = getUrlParameter('_id');
console.log('ID_CUSTOMER = ' + id_customer);
console.log('_ID = ' + _id);

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
  console.log(url);
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

function fillForm(rawData) {
  console.log(rawData);
  const data = rawData.data.info.thirdPartyInformations.array_values;
  const correspTable = {
    NIVEAU: 'pathology',
    COMMNIV: 'comments',
    DETAILEVE: 'interventionDetails',
    AUTRESCOMM: 'misc'
  };
  for (const k in data) {
    let select = '#' + correspTable[k];
    console.log(select);
    if (k === 'NIVEAU') {
      $(select).val(data[k]);
    }
    $(select).append(data[k]);
  }
}
