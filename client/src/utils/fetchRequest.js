export default function handleReq(endpoint, methodType, customHeaders, data) {
  return fetch(`https://vhomesback.herokuapp.com${endpoint}`, {
    method: methodType,
    headers: customHeaders,
    redirect: "follow",
    body: JSON.stringify(data),
  }).then((res) => {
    return res;
  });
}

// module.exports = { handleAuth };
