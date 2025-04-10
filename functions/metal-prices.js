const https = require("https");

function fetchMetal(metal) {
  const url = `https://metals.live/api/metal/${metal}`;
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
      fetchMetal("gold"),
      fetchMetal("silver")
    ]);

    const goldNow = goldData[goldData.length - 1][1];
    const goldPrev = goldData[goldData.length - 2][1];
    const goldChange = ((goldNow - goldPrev) / goldPrev) * 100;

    const silverNow = silverData[silverData.length - 1][1];
    const silverPrev = silverData[silverData.length - 2][1];
    const silverChange = ((silverNow - silverPrev) / silverPrev) * 100;

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
