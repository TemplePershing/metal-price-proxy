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
          resolve(json);
        } catch (err) {
          reject(`Error parsing ${metal} response: ${err}`);
        }
      });
    }).on("error", reject);
  });
}

exports.handler = async function () {
  try {
    const [goldData, silverData] = await Promise.all([
      fetchPrice("gold"),
      fetchPrice("silver")
    ]);

    const goldNow = goldData.spotPrice;
    const goldChange = goldData.dayChangePct;

    const silverNow = silverData.spotPrice;
    const silverChange = silverData.dayChangePct;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        gold: { price: goldNow, change: goldChange },
        silver: { price: silverNow, change: silverChange }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};
