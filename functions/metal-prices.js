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
          resolve(json.data); // << fix here
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

    const goldNow = goldData.spot_price;
    const goldChange = goldData.day_change_pct;

    const silverNow = silverData.spot_price;
    const silverChange = silverData.day_change_pct;

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
