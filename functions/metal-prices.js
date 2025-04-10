const https = require("https");

function fetchPrice(metal) {
  const url = `https://api.metals.dev/v1/spot/${metal}?currency=usd`;
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json); // Don't go straight to json.data yet
        } catch (err) {
          reject(`Error parsing ${metal} response: ${err}`);
        }
      });
    }).on("error", reject);
  });
}

exports.handler = async function () {
  try {
    const [goldRaw, silverRaw] = await Promise.all([
      fetchPrice("gold"),
      fetchPrice("silver")
    ]);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        gold: goldRaw,
        silver: silverRaw
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};
