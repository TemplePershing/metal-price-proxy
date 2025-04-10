const https = require("https");

function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

exports.handler = async function () {
  try {
    const [goldData, silverData] = await Promise.all([
      fetchYahoo("XAUUSD=X"),
      fetchYahoo("XAGUSD=X"),
    ]);

    const goldPrices = goldData.chart.result[0].indicators.quote[0].close;
    const silverPrices = silverData.chart.result[0].indicators.quote[0].close;

    const goldNow = goldPrices[goldPrices.length - 1];
    const goldPrev = goldPrices[goldPrices.length - 2];
    const goldChange = ((goldNow - goldPrev) / goldPrev) * 100;

    const silverNow = silverPrices[silverPrices.length - 1];
    const silverPrev = silverPrices[silverPrices.length - 2];
    const silverChange = ((silverNow - silverPrev) / silverPrev) * 100;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        gold: { price: goldNow, change: goldChange },
        silver: { price: silverNow, change: silverChange }
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch metal prices" }),
    };
  }
};
